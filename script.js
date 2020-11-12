$(document).ready(function () {
  var gMapsWeddingVenue;
  var weddingVenueAddress = JSON.parse(
    localStorage.getItem("googleWedAddress")
  );
  var gMapsPhotoVenue;
  var photoVenueAddress = JSON.parse(
    localStorage.getItem("googlePhotoAddress")
  );
  var photoCity = localStorage.getItem("city");
  var gMapsReceptionVenue;
  var receptionVenueAddress = JSON.parse(
    localStorage.getItem("googleRecAddress")
  );
  var sunsetStartDiv;
  var sunsetEndDiv;
  var wedToPhotoStartDiv;
  var wedToPhotoEndDiv;
  var photoToRecStartDiv;
  var photoToRecEndDiv;
  var wedToPhotoTT;
  var wedToPhotoVal;
  var photoToRecTT;
  var photoToRecVal;
  // grab nearlyWedNames from local storage. Value is null if not stored
  var nearlyWedNames = localStorage.getItem("names");
  var names;
  // grab displayed date from local storage. Value is null if not stored
  var dateInputDisplay = localStorage.getItem("dateInputDisplay");
  var dateInput = localStorage.getItem("dateInputAPI");

  var calendarColors = ["drive1", "goldhour", "drive2"];
  var calendarColorIndex;

  // Set google maps autofill for searching for addresses
  var weddingAddressField = document.getElementById("wedding-address");
  var weddingVenue = new google.maps.places.Autocomplete(weddingAddressField);
  var photoAddressField = document.getElementById("photo-address");
  var photoVenue = new google.maps.places.Autocomplete(photoAddressField);
  var receptionAddressField = document.getElementById("reception-address");
  var receptionVenue = new google.maps.places.Autocomplete(
    receptionAddressField
  );

  // event listeners to store the value of the address once selected by the user
  google.maps.event.addListener(weddingVenue, "place_changed", function () {
    gMapsWeddingVenue = weddingVenue.getPlace();
    // get the wedding address to get travel time
    weddingVenueAddress = gMapsWeddingVenue.formatted_address;
    // store the address
    localStorage.setItem(
      "googleWedAddress",
      JSON.stringify(weddingVenueAddress)
    );
  });
  google.maps.event.addListener(photoVenue, "place_changed", function () {
    gMapsPhotoVenue = photoVenue.getPlace();
    // get the photo address to get the travel time
    photoVenueAddress = gMapsPhotoVenue.formatted_address;
    // store the photo address
    localStorage.setItem(
      "googlePhotoAddress",
      JSON.stringify(photoVenueAddress)
    );

    // get the photo city because that is where golden hour is happening!
    var photoAddressArray = gMapsPhotoVenue.address_components;
    for (i = 0; i < photoAddressArray.length; i++) {
      var addressType = photoAddressArray[i].types[0];
      if (addressType == "locality") {
        photoCity = photoAddressArray[i].short_name;
        localStorage.setItem("city", photoCity);
      }
    }
  });
  google.maps.event.addListener(receptionVenue, "place_changed", function () {
    gMapsReceptionVenue = receptionVenue.getPlace();
    // get the reception address to get the travel time
    receptionVenueAddress = gMapsReceptionVenue.formatted_address;
    // store the reception address
    localStorage.setItem(
      "googleRecAddress",
      JSON.stringify(receptionVenueAddress)
    );
  });

  $("#change-address").on("click", function () {
    // $("#submit-form").removeClass("hide");
    // $("#change-address").attr("class","hide");
    // previous comments will just reverse the class changes back to what they are on page load.
    location.reload();
  });

  $("#change-names").on("click", function () {
    $("#nearlywed-names").val(names);
    $("#submit-form").removeClass("hide");
    $("#change-table").attr("class","hide");
    $("#nearly-wed-row").removeClass("hide")
    $("#header-info").attr("class","hide");
  });

  // when form is submitted use addresses to get the travel time between each one
  $("#wedding-info-submit").on("click", function (e) {
    e.preventDefault();
    calendarColorIndex = 0;

    // get the date of the wedding from the form input wiht the id wedding-date
    dateInput = $("#wedding-date").val();
    dateInputDisplay = moment(dateInput, "YYYY-MM-DD").format("MMMM Do YYYY");
    $("#displayed-wed-date").text(dateInputDisplay);

    // store date input for api calls and date input for display purposes
    localStorage.setItem("dateInputDisplay", dateInputDisplay);
    localStorage.setItem("dateInputAPI", dateInput);

    $("#submit-form").attr("class", "hide");
    $("#change-table").removeClass("hide");

    // get nearly wed names, and add the html to the h2 with the ide nearly-wed
    names = $("#nearlywed-names").val()
    nearlyWedNames =
      "<img src='assets/left4.png' /> " +
      names +
      " <img src='assets/right4.png' />";
    // if the value entered is null then do not set the HTML
    console.log(names);
    if (names !== "") {
      $("#nearly-wed").html(nearlyWedNames);
      // Store the nearly wed names into local storage
      localStorage.setItem("names", nearlyWedNames);
    }

    // change the classes on the nearly-wed-row to be hidden, and the header-info to no longer be hidden
    $("#nearly-wed-row").attr("class", "hide");
    $("#header-info").removeClass("hide");

    // get golden hour time, and display the travel times on the webpage
    goldenHourCalc(photoCity, dateInput);
  });

  // golden hour calculation using open weather api and sunrise-sunset api
  function goldenHourCalc(city, date) {
    var currentWeather =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&units=imperial&APPID=7455a546f39f9c232db77780672611f7";

    // get the longitude and latitude, and the timezone of the city searched
    $.ajax({
      url: currentWeather,
      method: "GET",
    }).then(function (response) {
      $("#cityInput").text(city);
      var latitude = response.coord.lat;
      var longitude = response.coord.lon;

      // create a new url for the sunset information
      var futureSunset =
        "https://api.sunrise-sunset.org/json?lat=" +
        latitude +
        "&lng=" +
        longitude +
        "&date=" +
        date;

      // call the future sunset info
      $.ajax({
        url: futureSunset,
        method: "GET",
      }).then(function (responseSun) {
        // use the timezone from the current weather call
        var timeOffset = response.timezone / 3600;

        // get the sunset time in UTC
        var time = responseSun.results.sunset;

        // pull the hours, minutes, and am or pm from the string
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if (AMPM == "PM" && hours < 12) hours = hours + 12;
        if (AMPM == "AM" && hours == 12) hours = hours - 12;

        hours += timeOffset;

        // if hours less than 0 after adding the time offset value then add 24 to the hours to get it into military time.
        if (hours < 0) {
          hours += 24;
        }

        sunsetStartDiv = timeRound(minutes, hours - 1);
        sunsetEndDiv = timeRound(minutes, hours);

        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        // add leading 0 to numbers less than 10
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        // set the local military time of the sunset
        var sunsetTime = sHours + ":" + sMinutes;

        // get travel time between wedding address and photo address
        // call the distance matrix api service from google
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [weddingVenueAddress, photoVenueAddress],
            destinations: [photoVenueAddress, receptionVenueAddress],
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: false,
            avoidTolls: false,
          },
          function (response, status) {
            if (status !== "OK") {
              alert("Error was: " + status);
            } else {
              var origin = response.originAddresses[0];
              var destination = response.destinationAddresses[0];
              if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
                alert(
                  "Better get on a plane. There are no roads between " +
                    origin +
                    " and " +
                    destination +
                    ". Please re-enter the addresses, and try again"
                );
              } else {
                // get the travel time in minutes for wed to photo
                wedToPhotoTT = response.rows[0].elements[0].duration.value;
                wedToPhotoVal = response.rows[0].elements[0].duration.text;
                photoToRecTT = response.rows[1].elements[1].duration.value;
                photoToRecVal = response.rows[1].elements[1].duration.text;

                // round the travel time to the nearist 15 minutes to be able to use the ids on the page
                wedToPhotoEndDiv = timeRound(minutes - 15, hours - 1);
                wedToPhotoStartDiv = calcStartTime(
                  wedToPhotoEndDiv,
                  wedToPhotoTT
                );
                photoToRecStartDiv = timeRound(minutes + 15, hours);
                photoToRecEndDiv = calcEndTime(
                  photoToRecStartDiv,
                  photoToRecTT
                );

                // Array of information displayed on the screen.
                var divArray = [
                  {
                    id: wedToPhotoStartDiv,
                    text:
                      "LEAVE " +
                      weddingVenueAddress +
                      " at: " +
                      moment(wedToPhotoStartDiv, "HH:mm").format("h:mm a") +
                      ". Estimated Travel time is: " +
                      wedToPhotoVal +
                      ".",
                    colorIndex: 0,
                  },
                  {
                    id: wedToPhotoEndDiv,
                    text:
                      "ARRIVE at " +
                      photoVenueAddress +
                      " at: " +
                      moment(wedToPhotoEndDiv, "HH:mm").format("h:mm a") +
                      ".",
                    colorIndex: 0,
                  },
                  {
                    id: sunsetStartDiv,
                    text:
                      "GOLDEN HOUR Starts at: " +
                      moment(sunsetStartDiv, "HH:mm").format("h:mm a"),
                    colorIndex: 1,
                  },
                  {
                    id: sunsetEndDiv,
                    text:
                      "GOLDEN HOUR Ends at: " +
                      moment(sunsetEndDiv, "HH:mm").format("h:mm a") +
                      ". Actual sunset time is " +
                      moment(sunsetTime, "HH:mm").format("h:mm a") +
                      ".",
                    colorIndex: 1,
                  },
                  {
                    id: photoToRecStartDiv,
                    text:
                      "LEAVE " +
                      photoVenueAddress +
                      " at: " +
                      moment(photoToRecStartDiv, "HH:mm").format("h:mm a") +
                      ". Estimated Travel time is: " +
                      photoToRecVal +
                      ".",
                    colorIndex: 2,
                  },
                  {
                    id: photoToRecEndDiv,
                    text:
                      "ARRIVE at " +
                      receptionVenueAddress +
                      " at: " +
                      moment(photoToRecEndDiv, "HH:mm").format("h:mm a") +
                      ".",
                    colorIndex: 2,
                  },
                ];

                for (var i = 0; i < divArray.length; i++) {
                  var column = document.getElementById(divArray[i].id);
                  column.textContent = divArray[i].text;
                  column.setAttribute(
                    "class",
                    calendarColors[divArray[i].colorIndex]
                  );
                }

                // Set the colors for all the rows between the start and end times
                colorDivs(wedToPhotoStartDiv, wedToPhotoEndDiv);
                colorDivs(sunsetStartDiv, sunsetEndDiv);
                colorDivs(photoToRecStartDiv, photoToRecEndDiv);
              }
            }
          }
        );
      });
    });
  }

  // rounding time to the nearist 15 minutes
  function timeRound(minutes, hours) {
    var m = ((((minutes + 7.5) / 15) | 0) * 15) % 60;
    var h = (((minutes / 105 + 0.5) | 0) + hours) % 24;
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    var militaryTime = h + ":" + m;
    return militaryTime;
  }

  // pass the end time in HH:MM format in military time, and the duration in seconds
  function calcStartTime(endTime, duration) {
    var endHour = parseInt(endTime.substring(0, 2));
    var endMin = parseInt(endTime.substring(3));
    var endSeconds = Math.floor(endHour * 60 * 60 + endMin * 60);
    var startSeconds = endSeconds - parseInt(duration);
    var startHour = Math.floor(startSeconds / 3600);
    var startMin = Math.floor((startSeconds % 3600) / 60);
    startTime = timeRound(startMin, startHour);
    return startTime;
  }

  // pass the start time in HH:MM format in military time, and the duration in seconds
  function calcEndTime(startTime, duration) {
    var startHour = parseInt(startTime.substring(0, 2));
    var startMin = parseInt(startTime.substring(3));
    var startSeconds = Math.floor(startHour * 60 * 60 + startMin * 60);
    var endSeconds = startSeconds + duration;
    var endHour = Math.floor(endSeconds / 3600);
    var endMin = Math.floor((endSeconds % 3600) / 60);
    endTime = timeRound(endMin, endHour);
    return endTime;
  }

  // call this function with the start time and end time in military time HH:MM. This function will add the appropriate color class to all rows between the start and end time
  function colorDivs(startTime, endTime) {
    while (startTime != endTime) {
      startTime = moment(startTime, "HH:mm");
      startTime = startTime.add(15, "minutes").format("HH:mm");
      if (startTime != endTime) {
        var col = document.getElementById(startTime);
        col.setAttribute("class", calendarColors[calendarColorIndex]);
      }
    }
    calendarColorIndex++;
  }

  // sets nearlywed names to local strage
  $("#wedding-info-submit").on("click", function () {});

  //  if names and date are stored in local storage, then display in the header
  console.log(nearlyWedNames);
  console.log(dateInputDisplay);
  if (nearlyWedNames !== null && dateInputDisplay !== null) {
    // Set the h2 and h3 text with the nearlyWedNames, and dateInputDisplay. These are pulled form local storage
    $("#nearly-wed").html(nearlyWedNames);
    $("#displayed-wed-date").text(dateInputDisplay);
    $("#nearly-wed-row").attr("class", "hide");
    $("#header-info").removeClass("hide");
  }

  if (dateInput !== null) {
    $("#wedding-date").val(dateInput);
  }

  if (
    weddingVenueAddress !== null &&
    photoVenueAddress !== null &&
    receptionVenueAddress !== null
  ) {
    weddingAddressField.value = weddingVenueAddress;
    photoAddressField.value = photoVenueAddress;
    receptionAddressField.value = receptionVenueAddress;
  }
});
