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
  
    // Set google maps autofill for searching for addresses
    var weddingAddressField = document.getElementById("wedding-address");
    var weddingVenue = new google.maps.places.Autocomplete(weddingAddressField);
    var photoAddressField = document.getElementById("photo-address");
    var photoVenue = new google.maps.places.Autocomplete(photoAddressField);
    var receptionAddressField = document.getElementById("reception-address");
    var receptionVenue = new google.maps.places.Autocomplete(receptionAddressField);
  
    // event listeners to store the value of the address once selected by the user
    google.maps.event.addListener(weddingVenue, "place_changed", function () {
      gMapsWeddingVenue = weddingVenue.getPlace();
      // get the wedding address to get travel time
      weddingVenueAddress = gMapsWeddingVenue.formatted_address;
      console.log("gMapsWeddingVenue");
      console.log(gMapsWeddingVenue);
    });
    google.maps.event.addListener(photoVenue, "place_changed", function () {
      gMapsPhotoVenue = photoVenue.getPlace();
      // get the photo address to get the travel time
      photoVenueAddress = gMapsPhotoVenue.formatted_address;
      console.log("gMapsPhotoVenue");
      console.log(gMapsPhotoVenue);
      // get the photo city because that is where golden hour is happening!
      var photoAddressArray = gMapsPhotoVenue.address_components;
      console.log(photoAddressArray);
      for (i = 0; i < photoAddressArray.length; i++) {
        var addressType = photoAddressArray[i].types[0];
        if (addressType == "locality") {
          photoCity = photoAddressArray[i].short_name;
          console.log(photoCity);
        }
      }
    });
    google.maps.event.addListener(receptionVenue, "place_changed", function () {
      gMapsReceptionVenue = receptionVenue.getPlace();
      // get the reception address to get the travel time
      receptionVenueAddress = gMapsReceptionVenue.formatted_address;
      console.log("gMapsReceptionVenue");
      console.log(gMapsReceptionVenue);
    });
  
    // when form is submitted use addresses to get the travel time between each one
    $("#wedding-info-submit").on("click", function (e) {
      e.preventDefault();
      console.log("Wedding Submit Clicked");
      console.log(this);
  
      // get the date of the wedding from the form input wiht the id wedding-date
      dateInput = $("#wedding-date").val();
      console.log(dateInput);
  
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
        console.log(response);
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
          console.log(responseSun);
          // use the timezone from the current weather call
          var timeOffset = response.timezone / 3600;
          console.log("time offset: " + timeOffset);
  
          // get the sunset time in UTC
          var time = responseSun.results.sunset;
          // pull the hours, minutes, and am or pm from the string
          var hours = Number(time.match(/^(\d+)/)[1]);
          var minutes = Number(time.match(/:(\d+)/)[1]);
          var AMPM = time.match(/\s(.*)$/)[1];
          if (AMPM == "PM" && hours < 12) hours = hours + 12;
          if (AMPM == "AM" && hours == 12) hours = hours - 12;
  
          // if hours is 0 then set hours = 24+timeOffset
          if (hours == 0) {
            hours = 24 + timeOffset;
          }
          // else hours=hours+timeOffset
          else {
            hours = hours + timeOffset;
          }
          console.log("hours"+hours+" minutes"+minutes);
          sunsetStartDiv = timeRound(minutes,hours-1);
          sunsetEndDiv = timeRound(minutes,hours);
          console.log(sunsetStartDiv+" "+sunsetEndDiv);
  
          var sHours = hours.toString();
          var sMinutes = minutes.toString();
          // add leading 0 to numbers less than 10
          if (hours < 10) sHours = "0" + sHours;
          if (minutes < 10) sMinutes = "0" + sMinutes;
          // log the local military time of the sunset
          var sunsetTime = sHours+" "+sMinutes;
          console.log(sHours + sMinutes);
          // get travel time between wedding address and photo address
          calculateTravelTime(weddingVenueAddress, photoVenueAddress);
          calculateTravelTime(photoVenueAddress, receptionVenueAddress);
  
          // call function to set the time div with the golden hour
        });
      });
    }
  
    // call api service
    function calculateTravelTime(origin, destination) {
      // call the distance matrix api service from google
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status !== "OK") {
            alert("Error was: " + status);
          } else {
            console.log("get on with the else statement");
            var origin = response.originAddresses[0];
            var destination = response.destinationAddresses[0];
            console.log(response.rows[0].elements[0].status);
            if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
              alert(
                "Better get on a plane. There are no roads between " +
                  origin +
                  " and " +
                  destination
              );
            } else {
              // get the travel time in minutes
              var duration = response.rows[0].elements[0].duration;
              console.log(duration);
              var durationTime = duration.value / 60;
              console.log(durationTime);
            }
          }
        }
      );
      // call function to attach these time chunks next to the golden hour time
    }
  
    // function to set the time blocks on the web page using the travel time and the golden hour
  
    // rounding time to the nearist 15 minutes
    function timeRound(minutes, hours) {
      var m = ((((minutes + 7.5) / 15) | 0) * 15) % 60;
      var h = (((minutes / 105 + 0.5) | 0) + hours) % 24;
      var militaryTime = h + ":" + m;
      return militaryTime;
    }
  
    // creating the start and end times for the travel times
    var travelTime = 876;
    var ssStartTime = "15:15";
    var ssStartHour = parseInt(ssStartTime.substring(0,2))
    var ssStartMin = parseInt(ssStartTime.substring(3))
    var ssSeconds = Math.floor((ssStartHour *60 *60)+ssStartMin *60);
    console.log(ssStartHour+" "+ssStartMin);
    console.log(ssSeconds);
    var ttSeconds = ssSeconds-travelTime;
    var ttTime = new Date(ttSeconds *1000).toISOString().substr(11,8);
    console.log(ttTime);
    
  });
  