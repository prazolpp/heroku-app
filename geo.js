const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
require('dotenv').config();
const KEY = process.env.KEY;

let visitors = [];
let visitorData = {};

const render = ($city, $lat, $long) => {
  let getList = visitors.reduce((acc, city) => {
    return `${acc}<a href='/geo/location/city/${city}'> <h2>${city} - ${visitorData[city].count}</h2> </a>`;
  }, "");

  return `<h1>You are visiting from <span id="city"></span></h1>
    <div id="googleMap" style="width:100%;height:500px;"></div>
    <h1>The cities our visitors come from </h1>
    <div class = "listCities" style="max-height: 300px; overflow:auto;"></div>
    <hr />

    <h2>API Access</h2>
    <h3>
      <a href=""/geo/location/api/ip/206.189.152.211"">/geo/location/api/ip</a> - To retrieve your IP information
    </h3>
    
    <h3>
      <a href="/geo/location/api/ip/206.189.152.211">/geo/location/api/ip/&lt;Replace with an IP address you want to look up&gt;</a> - To retrieve information about a specific IP address
    </h3>
    
    <hr />
    <h2>INFO</h2>
    <p>
    IP Address from incoming IP address <a href="https://serverfault.com/questions/381393/can-the-ip-address-for-an-http-request-be-spoofed">cannot be spoofed</a> or made up.
    </p>
    
    <p>
    Your IP address is provided by your Internet Provider, so police can easily track you down if you do illegal activities online.
    </p>
    
    <p>
    To protect your privacy and hide your IP address, you can use a VPN service. If a request is through a VPN, server will only see the VPN's IP address.
    </p>
    
    
    <h1 style="margin-bottom: 30px;">The End</h1>
    
    <script>
    
    function myMap(){
        let mapProp = {
            center:new google.maps.LatLng(${$lat},${$long}),
            zoom:11,
        };
        let map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
        new google.maps.Marker({
            position: {lat: ${$lat}, lng: ${$long}},
            map: map,
            title: '${visitorData[$city].count} Hits'   
        })    
    }

    const list = document.querySelector('.listCities');
    city.innerText = "${$city}";
    list.innerHTML = "${getList}";

    </script>
    
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB29pGpCzE_JGIEMLu1SGIqwoIbc0sHFHo&callback=myMap"></script>
    `;
};

let capturedIPs = {};

const addToDB = ($city, $lat, $long, thisIP) => {
  if (visitors.includes($city)) {
    visitorData[$city].count++;
    if (!visitorData[$city]["visitors"].includes(thisIP)) {
      visitorData[$city]["visitors"].push(thisIP);
    }
  } else {
    visitors.push($city);
    visitorData[$city] = {};
    visitorData[$city]["count"] = 1;
    visitorData[$city]["long"] = $long;
    visitorData[$city]["lat"] = $lat;
    visitorData[$city]["visitors"] = [];
    visitorData[$city]["visitors"].push(thisIP);
  }
};

router.route("/visitors").get((req, res) => {
  let thisIP = req.get("x-forwarded-for");
  if (!thisIP) {
    thisIP = "73.158.65.158";
  }

  if (thisIP in capturedIPs) {
    let IPObject = capturedIPs[thisIP];
    return res.send(render(IPObject.city, IPObject.lat, IPObject.long));
  }

  fetch(`http://api.ipstack.com/${thisIP}?access_key=${KEY}`)
    .then((r) => r.json())
    .then((data) => {
      let $lat = data.latitude;
      let $long = data.longitude;
      let $city = data.city;

      addToDB($city, $lat, $long, thisIP);
      capturedIPs[thisIP] = {
        city: $city,
        lat: $lat,
        long: $long,
      };
      res.send(render($city, $lat, $long));
    });
});

router.route("/api/visitors").get((req, res) => {
  let visitorsInfo = {};
  Object.keys(visitorData).forEach((city, i) => {
    visitorsInfo[city] = visitorData[city].visitors;
  });
  res.send(JSON.stringify(visitorsInfo));
});

router.route("/location/city/:cityString").get((req, res) => {
  let $city = req.params.cityString;
  let $lat = visitorData[$city].lat;
  let $long = visitorData[$city].long;

  res.send(render($city, $lat, $long));
});

router.route("/location/api/ip/:thisIP").get((req, res) => {
  let thisIP = req.params.thisIP;

  if (thisIP in capturedIPs ) {
    let IPObject = capturedIPs[thisIP];
    return res.send(render(IPObject.city, IPObject.lat, IPObject.long));
  }


  fetch(`http://api.ipstack.com/${thisIP}?access_key=${KEY}`)
    .then((r) => r.json())
    .then((data) => {
      let $lat = data.latitude;
      let $long = data.longitude;
      let $city = data.city;

      addToDB($city, $lat, $long, thisIP);
      res.send(render($city, $lat, $long));
    });
});

router.route("");
module.exports = router;

