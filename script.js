$(document).ready(function () {
  var gMapsWeddingVenue;
  var weddingVenueAddress;
  var gMapsPhotoVenue;
  var photoVenueAddress;
  var photoCity;
  var gMapsReceptionVenue;
  var receptionVenueAddress;
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

  var calendarColors = ["drive1", "goldhour", "drive2"];
  var calendarColorIndex = 0;

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
  });
  google.maps.event.addListener(photoVenue, "place_changed", function () {
    gMapsPhotoVenue = photoVenue.getPlace();
    // get the photo address to get the travel time
    photoVenueAddress = gMapsPhotoVenue.formatted_address;

    // get the photo city because that is where golden hour is happening!
    var photoAddressArray = gMapsPhotoVenue.address_components;
    for (i = 0; i < photoAddressArray.length; i++) {
      var addressType = photoAddressArray[i].types[0];
      if (addressType == "locality") {
        photoCity = photoAddressArray[i].short_name;
      }
    }
  });
  google.maps.event.addListener(receptionVenue, "place_changed", function () {
    gMapsReceptionVenue = receptionVenue.getPlace();
    // get the reception address to get the travel time
    receptionVenueAddress = gMapsReceptionVenue.formatted_address;
  });

  $("#change-address").on("click", function () {
    // $("#submit-form").removeClass("hide");
    // $("#change-address").attr("class","hide");
    // previous comments will just reverse the class changes back to what they are on page load.
    location.reload();
  });
  // when form is submitted use addresses to get the travel time between each one
  $("#wedding-info-submit").on("click", function (e) {
    e.preventDefault();

    // get the date of the wedding from the form input wiht the id wedding-date
    dateInput = $("#wedding-date").val();
    $("#displayed-wed-date").text(
      moment(dateInput, "YYYY-MM-DD").format("MMMM Do YYYY")
    );

    $("#submit-form").attr("class", "hide");
    $("#change-address").removeClass("hide");

    var nearlyWedNames = $("#nearlywed-names").val();
    $("#nearly-wed").html(
      "<img src='assets/left4.png' /> " +
        nearlyWedNames +
        " <img src='assets/right4.png' />"
    );

    $("#nearly-wed-row").attr("class", "hide");
    $("#header-info").removeClass("hide");
    // get golden hour time
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

        sunsetStartDiv = timeRound(minutes, hours - 1); // also the travel to the photo place end div
        sunsetEndDiv = timeRound(minutes, hours); // also the travel from the photo place start div

        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        // add leading 0 to numbers less than 10
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        // log the local military time of the sunset
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
                // get the travel time in minutes
                wedToPhotoTT = response.rows[0].elements[0].duration.value;
                wedToPhotoVal = response.rows[0].elements[0].duration.text;
                photoToRecTT = response.rows[1].elements[1].duration.value;
                photoToRecVal = response.rows[1].elements[1].duration.text;

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
                      moment(sunsetTime, "HH:mm").format("h:mm a")+".",
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
                      "ARRIVE at "+receptionVenueAddress+" at: " +
                      moment(photoToRecEndDiv, "HH:mm").format("h:mm a")+".",
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

  // creating the start and end times for the travel times

  // pass the end time in HH:MM format in militart time, and the duration in seconds
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

  // call this function with the start time and end time in military time HH:MM
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
});
