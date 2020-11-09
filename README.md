# Wedding Scheduler
First group project for UCSD Coding Bootcamp.

## Description
This webpage is a wedding scheduler that will set the traveling time between venues scheduled around golden hour. It requires three addresses entered by the user, and the wedding date. The address fields have [Google Places API](https://developers.google.com/places/web-service/autocomplete) event listeners, which will autopouplate the fields with locations. After the information is submitted by the user, then three API calles are performed. The first is to use the city of the Photo Venue to [Open Weather API](https://openweathermap.org/api). What is returned there is the longitude and latitude of the city. Then using the longitude, latitude, and date a second API call is made to the [Sunrise-Sunset API](https://sunrise-sunset.org/api). This returns the sunset time for that date, and location. The golden hour is calculated from that starting one hour before the sun sets, and ending at sunset. Lastly [Google Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/start) is called for the travel time between the Wedding Venue, Photo Venue, and Reception Venue. Once all that information is together, then time blocks are populated on the schedule. 

!!INFORMATION ON ADDING ADDITIONAL TIME BLOCKS!!

See images below for screenshots of the app, and [here]() is a link to use the app.
## Reference Images
Page on Intial Load:

Page after addresses are entered, and golden hour is set on the calculator:

Page when user clicks a time block to add more information to the schedule:

Page after user has saved the additional time blocks:

## License
MIT License
Copyright (c) 2020 Michael Bubel, Erika Cueva, Anastasia Ivanshchenko, and Amanda LeMoine
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.