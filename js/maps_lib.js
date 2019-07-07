(function (window, undefined) {
    var MapsLib = function (options) {

        var self = this;

        options = options || {};

        this.recordName = options.recordName || "result"; //for showing a count of results
        this.recordNamePlural = options.recordNamePlural || "results";
        this.searchRadius = options.searchRadius || 805; //in meters ~ 1/2 mile

        // the encrypted Table ID of your Fusion Table (found under File => About)
        this.fusionTableId = options.fusionTableId || "",

        // Found at https://console.developers.google.com/
        // Important! this key is for demonstration purposes. please register your own.
        this.googleApiKey = options.googleApiKey || "",
        
        // name of the location column in your Fusion Table.
        // NOTE: if your location column name has spaces in it, surround it with single quotes
        // example: locationColumn:     "'my location'",
        this.locationColumn = options.locationColumn || "main";
        
        // appends to all address searches if not present
        this.locationScope = options.locationScope || "";

        // zoom level when map is loaded (bigger is more zoomed in)
        this.defaultZoom = options.defaultZoom || 12; 

        // center that your map defaults to
        this.map_centroid = new google.maps.LatLng(options.map_center[0], options.map_center[1]);
        
        // the current center of the map
        this.current_center = this.map_centroid

        // marker image for your searched address
        if (typeof options.addrMarkerImage !== 'undefined') {
            if (options.addrMarkerImage != "")
                this.addrMarkerImage = options.addrMarkerImage;
            else
                this.addrMarkerImage = ""
        }
        else
            this.addrMarkerImage = "images/blue-pushpin.png"

    	this.currentPinpoint = null;
    	$("#result_count").html("");

        // disable Google's points of interest markers in the basemap
        var basemapStyles =[
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                      { visibility: "off" }
                ]
            }
        ];
        
        this.myOptions = {
            zoom: this.defaultZoom,
            center: this.map_centroid,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: basemapStyles 
        };
        this.geocoder = new google.maps.Geocoder();
        this.map = new google.maps.Map($("#map_canvas")[0], this.myOptions);
        
        // maintains map centerpoint for responsive design
        google.maps.event.addDomListener(self.map, 'idle', function () {
            self.calculateCenter();
        });
        google.maps.event.addDomListener(window, 'resize', function () {
            self.map.setCenter(this.current_center);
        });
        self.searchrecords = null;

        MapsLib.prototype.reach = function () {
        
var map;
var line;
var int;

var directionsDisplay = new google.maps.DirectionsRenderer({ draggable: true });
var directionsService = new google.maps.DirectionsService();
var buttonRoute = document.querySelector('#routeGo')
var buttonWaypoint = document.querySelector('#waypointAdd')
var routeFrom= document.querySelector('#routeFrom')

var routeTo=document.querySelector('#routeTo')
directionsDisplay.addListener('directions_changed', function() {
    createPolyline(directionsDisplay.getDirections());
  });
buttonRoute.addEventListener('click',calcRoute)
buttonWaypoint.addEventListener('click',addWaypoint)
load()
function load() {
   // var myOptions = {
        //zoom: 3,
       // mapTypeId: google.maps.MapTypeId.ROADMAP,
        //center: new google.maps.LatLng(50, 0),
      
    //};
  //map = new google.maps.Map(document.getElementById("map_canvas"), this.myOptions);
  var autocomplete2 = new google.maps.places.Autocomplete(routeFrom);
  autocomplete2.bindTo('bounds', self.map);
  var autocomplete1 = new google.maps.places.Autocomplete(routeTo);
  autocomplete1.bindTo('bounds', self.map);
  directionsDisplay.setMap(self.map);
  directionsDisplay.setPanel(document.getElementById("directions"));
};

function addWaypoint(){
  routeTo.insertAdjacentHTML('beforebegin',
    `
    <div style="margin-bottom:7px"><input type="text"  name="waypoint" value="" />
    <label>Waypoint</label><button style="margin-left:10px;" class="remove btn btn-danger btn-sm">Remove</button><div>`) 
  let arr = document.querySelectorAll('.remove')
   arr[arr.length-1].addEventListener('click', function() {
     this.parentNode.remove()
    });
  }
function calcRoute() {
  const locations = []
  const waypoints = document.querySelectorAll('input[name="waypoint"]')
  waypoints.forEach(function(item){
    if(item.value !==''){
      locations.push({
      location:item.value,
      stopover:true
    })
    }
  })
    var request = {
        origin: routeFrom.value,
        destination: routeTo.value,
        waypoints: locations,
       // optimizeWaypoints: true,
        travelMode: "DRIVING"
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            console.log('its dragged')
            //document.getElementById('Gresponse').innerHTML = JSON.stringify(response);
            createPolyline(response);
        }
    });
};

function createPolyline(directionResult) {
  if( line!==undefined){
  line.setMap(null)
  clearInterval(int)
  };
  line = new google.maps.Polyline({
      path: [],
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 4,
      icons: [{
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            strokeColor: '#393'
          },
          offset: '100%'
        }]
  });
  var legs = directionResult.routes[0].legs;
      for (i = 0; i < legs.length; i++) {
        var steps = legs[i].steps;
        for (j = 0; j < steps.length; j++) {
          var nextSegment = steps[j].path;
          for (k = 0; k < nextSegment.length; k++) {
            line.getPath().push(nextSegment[k]);
          }
        }
      }
  line.setMap(self.map);
  animate();
};

function animate() {
    var count = 0;
    int = setInterval(function() {
      count = (count + 1) % 200;
      var icons = line.get('icons');
      icons[0].offset = (count / 2) + '%';
      line.set('icons', icons);
  }, 24);
};


};

        //reset filters
        $("#search_address").val(self.convertToPlainString($.address.parameter('address')));
        var loadRadius = self.convertToPlainString($.address.parameter('radius'));
        if (loadRadius != "") 
            $("#search_radius").val(loadRadius);
        else 
            $("#search_radius").val(self.searchRadius);
        
        $(":checkbox").prop("checked", "checked");
        $("#result_box").hide();

        //-----custom initializers-----
        $("#text_search").val("");
        //-----end of custom initializers-----

        //run the default search when page loads
        self.doSearch();
        if (options.callback) options.callback(self);
    };

    //-----custom functions-----
    //-----end of custom functions-----

    MapsLib.prototype.submitSearch = function (whereClause, map) {
        var self = this;
        //get using all filters
        //NOTE: styleId and templateId are recently added attributes to load custom marker styles and info windows
        //you can find your Ids inside the link generated by the 'Publish' option in Fusion Tables
        //for more details, see https://developers.google.com/fusiontables/docs/v2/using#WorkingStyles
        self.searchrecords = new google.maps.FusionTablesLayer({
            query: {
                from: self.fusionTableId,
                select: self.locationColumn,
                where: whereClause
            },
            styleId: 2,
            templateId: 2
        });
        self.fusionTable = self.searchrecords;
        self.searchrecords.setMap(map);
        self.getCount(whereClause);
    };


    MapsLib.prototype.getgeoCondition = function (address, callback) {
        var self = this;
        if (address !== "") {
            if (address.toLowerCase().indexOf(self.locationScope) === -1) {
                address = address + " " + self.locationScope;
            }
            self.geocoder.geocode({
                'address': address
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    self.currentPinpoint = results[0].geometry.location;
                    var map = self.map;

                    $.address.parameter('address', encodeURIComponent(address));
                    $.address.parameter('radius', encodeURIComponent(self.searchRadius));
                    map.setCenter(self.currentPinpoint);
                    // set zoom level based on search radius
                    if (self.searchRadius >= 1610000) map.setZoom(4); // 1,000 miles
                    else if (self.searchRadius >= 805000) map.setZoom(5); // 500 miles
                    else if (self.searchRadius >= 402500) map.setZoom(6); // 250 miles
                    else if (self.searchRadius >= 161000) map.setZoom(7); // 100 miles
                    else if (self.searchRadius >= 80500) map.setZoom(8); // 100 miles
                    else if (self.searchRadius >= 40250) map.setZoom(9); // 100 miles
                    else if (self.searchRadius >= 16100) map.setZoom(11); // 10 miles
                    else if (self.searchRadius >= 8050) map.setZoom(12); // 5 miles
                    else if (self.searchRadius >= 3220) map.setZoom(13); // 2 miles
                    else if (self.searchRadius >= 1610) map.setZoom(14); // 1 mile
                    else if (self.searchRadius >= 805) map.setZoom(15); // 1/2 mile
                    else if (self.searchRadius >= 400) map.setZoom(16); // 1/4 mile
                    else self.map.setZoom(17);

                    if (self.addrMarkerImage != '') {
                        self.addrMarker = new google.maps.Marker({
                            position: self.currentPinpoint,
                            map: self.map,
                            //icon: self.addrMarkerImage,
                            animation: google.maps.Animation.DROP,
                            title: "Kindly click to get Lat/Long values",
                            draggable: true
                        });
                       

                self.addrMarker.setAnimation(google.maps.Animation.BOUNCE);

                google.maps.event.addListener(self.addrMarker, 'click', function(a) {

                    //console.log(a);
                    
                    if(self.addrMarker){
                        document.getElementById("loc").style.display = "block";
                        document.getElementById('loc').value = a.latLng.lat().toFixed(5) + ', ' + a.latLng.lng().toFixed(5)
                    }else{
                        document.getElementById("loc").style.display = "none";
                    }
                });


                google.maps.event.addListener(self.addrMarker, 'dragend', function(a) {

                //console.log(a);
                
                if(self.addrMarker){
                    document.getElementById("loc").style.display = "block";
                    document.getElementById('loc').value = a.latLng.lat().toFixed(5) + ', ' + a.latLng.lng().toFixed(5)
                }
                else{
                    document.getElementById("loc").style.display = "none";
                }
                //document.getElementById('loc').value = a.latLng.lat().toFixed(5) + ', ' + a.latLng.lng().toFixed(5); //Place the value in input box

                  });
                    }


                /*
                    if (self.addrMarkerImage) {
                        var marker = new google.maps.Marker({
                            position: {lat:6.4377, lng:3.4828},
                            map: self.map,
                            //icon: self.addrMarkerImage,
                            animation: google.maps.Animation.DROP,
                            title: address,
                            draggable: true
                        });

                marker.setAnimation(google.maps.Animation.BOUNCE);
                google.maps.event.addListener(marker, 'dragend', function(a) {

                console.log(a);

                document.getElementById('loc').value = a.latLng.lat().toFixed(5) + ', ' + a.latLng.lng().toFixed(5); //Place the value in input box

                  });
                            } 
*/
                    var geoCondition = " AND ST_INTERSECTS(" + self.locationColumn + ", CIRCLE(LATLNG" + self.currentPinpoint.toString() + "," + self.searchRadius + "))";
                    callback(geoCondition);
                    self.drawSearchRadiusCircle(self.currentPinpoint);
                } else {
                    alert("We could not find your address: " + status);
                    callback('');
                }
            });
        } else {
            callback('');
            document.getElementById("loc").style.display = "none"
            document.getElementById("loc").value="";

        }
    };


    MapsLib.prototype.doSearch = function () {
        var self = this;
        self.clearSearch();
        //var reach = $("#fromroute").val();
        var address = $("#search_address").val();
        self.searchRadius = $("#search_radius").val();
        self.whereClause = self.locationColumn + " not equal to ''";
        
        //-----custom filters-----

           var type_column = "'TAGS'";
            var searchType = type_column + " IN (-1,";
            if ( $("#cbType1").is(':checked')) searchType += "1,";
            if ( $("#cbType2").is(':checked')) searchType += "2,";
            if ( $("#cbType3").is(':checked')) searchType += "3,";
            if ( $("#cbType4").is(':checked')) searchType += "4,";
            self.whereClause += " AND " + searchType.slice(0, searchType.length - 1) + ")";
            

            var type_column = "'Faulty'";
            var searchType = type_column + " IN (-1,";
            if ( $("#cbType11").is(':checked')) searchType += "0,";
            if ( $("#cbType21").is(':checked')) searchType += "1,";
            if ( $("#cbType31").is(':checked')) searchType += "2,";
            self.whereClause += " AND " + searchType.slice(0, searchType.length - 1) + ")";

            


            // Text search
            var text_search = $("#text_search").val().replace("'", "\\'");
            if (text_search != '')
            self.whereClause += " AND 'POLELANDMARK' contains ignoring case '" + text_search + "'";

            if (text_search){
               
            }
            
            




        //-----end of custom filters-----

            self.getgeoCondition(address, function (geoCondition) {
            self.whereClause += geoCondition;
            self.submitSearch(self.whereClause, self.map);
        });

    };

    MapsLib.prototype.reset = function () {
        $.address.parameter('address','');
        $.address.parameter('radius','');
        window.location.reload();
    };


    MapsLib.prototype.getInfo = function (callback) {
        var self = this;
        jQuery.ajax({
            url: 'https://www.googleapis.com/fusiontables/v2/tables/' + self.fusionTableId + '?key=' + self.googleApiKey,
            dataType: 'json'
        }).done(function (response) {
            if (callback) callback(response);
        });
    };

    MapsLib.prototype.addrFromLatLng = function (latLngPoint) {
        var self = this;
        self.geocoder.geocode({
            'latLng': latLngPoint
        }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    $('#search_address').val(results[1].formatted_address);
                    $('.hint').focus();
                    self.doSearch();
                }
            } else {
                alert("Geocoder failed due to: " + status);
            }
        });
    };

    MapsLib.prototype.drawSearchRadiusCircle = function (point) {
        var self = this;
        var circleOptions = {
            strokeColor: "#4b58a6",
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: "#4b58a6",
            fillOpacity: 0.05,
            map: self.map,
            center: point,
            clickable: false,
            zIndex: -1,
            radius: parseInt(self.searchRadius)
        };
        self.searchRadiusCircle = new google.maps.Circle(circleOptions);
    };

    MapsLib.prototype.query = function (query_opts, callback) {
        var queryStr = [],
            self = this;
        queryStr.push("SELECT " + query_opts.select);
        queryStr.push(" FROM " + self.fusionTableId);
        // where, group and order clauses are optional
        if (query_opts.where && query_opts.where != "") {
            queryStr.push(" WHERE " + query_opts.where);
        }
        if (query_opts.groupBy && query_opts.groupBy != "") {
            queryStr.push(" GROUP BY " + query_opts.groupBy);
        }
        if (query_opts.orderBy && query_opts.orderBy != "") {
            queryStr.push(" ORDER BY " + query_opts.orderBy);
        }
        if (query_opts.offset && query_opts.offset !== "") {
            queryStr.push(" OFFSET " + query_opts.offset);
        }
        if (query_opts.limit && query_opts.limit !== "") {
            queryStr.push(" LIMIT " + query_opts.limit);
        }
        var theurl = {
            base: "https://www.googleapis.com/fusiontables/v2/query?sql=",
            queryStr: queryStr,
            key: self.googleApiKey
        };
        $.ajax({
            url: [theurl.base, encodeURIComponent(theurl.queryStr.join(" ")), "&key=", theurl.key].join(''),
            dataType: "json"
        }).done(function (response) {
            //console.log(response);
            if (callback) callback(response);
        }).fail(function(response) {
            self.handleError(response);
        });
    };

    MapsLib.prototype.handleError = function (json) {
        if (json.error !== undefined) {
            var error = json.responseJSON.error.errors;
            console.log("Error in Fusion Table call!");
            for (var row in error) {
                console.log(" Domain: " + error[row].domain);
                console.log(" Reason: " + error[row].reason);
                console.log(" Message: " + error[row].message);
            }
        }
    };
    MapsLib.prototype.getCount = function (whereClause) {
        var self = this;
        var selectColumns = "Count()";
        self.query({
            select: selectColumns,
            where: whereClause
        }, function (json) {
            self.displaySearchCount(json);
        });
    };

    MapsLib.prototype.displaySearchCount = function (json) {
        var self = this;
        
        var numRows = 0;
        if (json["rows"] != null) {
            numRows = json["rows"][0];
        }
        var name = self.recordNamePlural;
        if (numRows == 1) {
            name = self.recordName;
        }
        $("#result_box").fadeOut(function () {
            $("#result_count").html(self.addCommas(numRows) + " " + name + " found");
        });
        $("#result_box").fadeIn();
    };

    MapsLib.prototype.addCommas = function (nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    };

    // maintains map centerpoint for responsive design
    MapsLib.prototype.calculateCenter = function () {
        var self = this;
        this.current_center = self.map.getCenter();
    };

    //converts a slug or query string in to readable text
    MapsLib.prototype.convertToPlainString = function (text) {
        if (text === undefined) return '';
        return decodeURIComponent(text);
    };

    MapsLib.prototype.clearSearch = function () {
        var self = this;
        if (self.searchrecords && self.searchrecords.getMap) 
            self.searchrecords.setMap(null);
        if (self.addrMarker && self.addrMarker.getMap) 
            self.addrMarker.setMap(null);
        if (self.searchRadiusCircle && self.searchRadiusCircle.getMap) 
            self.searchRadiusCircle.setMap(null);
    };

    MapsLib.prototype.findMe = function () {
        var self = this;
        var foundLocation;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                var accuracy = position.coords.accuracy;
                var coords = new google.maps.LatLng(latitude, longitude);
                self.map.panTo(coords);
                self.addrFromLatLng(coords);
                self.map.setZoom(14);
                jQuery('#map_canvas').append('<div id="myposition"><i class="fontello-target"></i></div>');
                setTimeout(function () {
                    jQuery('#myposition').remove();
                }, 3000);
            }, function error(msg) {
                alert('Please enable your GPS position future.');
            }, {
                //maximumAge: 600000,
                //timeout: 5000,
                enableHighAccuracy: true
            });
        } else {
            alert("Geolocation API is not supported in your browser.");
        }
    };


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = MapsLib;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return MapsLib;
        });
    } else {
        window.MapsLib = MapsLib;
    }

})(window);