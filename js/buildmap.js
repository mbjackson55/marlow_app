//define where the markers file is
    var markersFile = "marlowmarkers.txt";
//define where the route file is
    var routeFile = "marlowroute.txt";	

//variables for routes
var linesLayer, points, lineFeature, lineString, routeMarkersLayer, routepos, routesize, routeoffset, routeicon;
var style_blue = {strokeColor: "#0000CD", strokeOpacity: 0.5, strokeWidth: 4.5};
var gpsmarker, routeMarkersLayer, poscount=0, osMap, mymarker, markers;
var watchID,mytimer;
//base pos is the location of stop one for centering the map
var basepos, lastmappos;

function initmapbuilder()
{
//initiate the map
var options = {resolutions: [2500, 1000, 500, 200, 100, 50, 25, 10, 5, 4, 2.5, 2, 1]};
osMap = new OpenSpace.Map('map', options);
// add markers
markers = new OpenLayers.Layer.Markers("Markers");
osMap.addLayer(markers);

//load the markers file
    OpenLayers.loadURL(markersFile, null, this, parseFile, onmarkersFail);
//this function parses through the text file to create the markers
function parseFile(result)
  {
    var text = result.responseText;
    is1 = new OpenLayers.Size(33,45);
	os1 = new OpenLayers.Pixel(-16,-36);
	iw = new OpenLayers.Pixel(16,16);
	//slit the file by line
    var lines = text.split('\n');
	/* cycle through each line and split it by comma into columns then if there are exactly 3 resulting columns, pass the first one to the x variable, the second to the y variable. Create the marker position from these then add the popup text from the last column. Finally create the marker */
    for (var i = 0; i < lines.length; i++)
    {
      var columns = lines[ i ].split(',');
      if (columns.length == 2)
        {
          var x = parseFloat(columns[ 0 ]);
          var y = parseFloat(columns[ 1 ]);
          var pos = new OpenSpace.MapPoint(x, y);
		  if (i==0){
		  //set the center of the map and the zoom level
			osMap.setCenter(pos,12);
			basepos=pos;
			}
		    iconfile="http://www.discoveringbritain.org/assets/templates/discoveringbritain/images/icons/numbers/"+(i+1)+".png";
			icon = new OpenSpace.Icon(iconfile, is1, os1, 0, iw);
			var marker = new OpenLayers.Marker(pos,icon);
			marker.id=(i+1);
			markers.addMarker(marker);	
			
			marker.events.register("click", marker, function() {
			var spage="#script"+this.id;
			$.mobile.changePage( spage, { transition: "slide"} );
			}); 
         }
      }
    } 

//this function creates an alert if the markers file fails to load                 
function onmarkersFail(e)
  {
      alert("Cannot load markers file");
  }			


//new markers end here

//make a route
//load the route file
    OpenLayers.loadURL(routeFile, null, this, parserouteFile, onrouteFail);
//this function parses through the text file to create the markers
function parserouteFile(result)
  {
    points = new Array();
	var text = result.responseText;
	linesLayer = osMap.getVectorLayer();
	//slit the file by line
    var lines = text.split('\n');
	/* cycle through each line and split it by comma into columns then if there are exactly 3 resulting columns, pass the first one to the x variable, the second to the y variable. Create the marker position from these then add the popup text from the last column. Finally create the marker */
    for (var i = 0; i < lines.length; i++)
    {
      var columns = lines[ i ].split(',');
      if (columns.length == 2)
        {
          var x = parseFloat(columns[ 0 ]);
          var y = parseFloat(columns[ 1 ]);
          points.push(new OpenLayers.Geometry.Point(x,y));
         }
      }
// create a polyline feature from the array of points
lineString = new OpenLayers.Geometry.LineString(points);
lineFeature = new OpenLayers.Feature.Vector(lineString, null, style_blue);
linesLayer.addFeatures([lineFeature]);
    } 

	function onrouteFail(e)
  {
      alert("Cannot load markers file");
  }	
  
clusterControl = new OpenSpace.Control.ClusterManager();
osMap.addControl(clusterControl);
clusterControl.activate();


function displayError(error) {
  var errors = { 
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  };
  alert("Error: " + errors[error.code]);
}

function onPinch(e) {
	pt=osMap.getCenter();
	var zL = osMap.getZoom(); 
    if (e.scale > 1)
    {
        // React to the pinch zoom in here.
	zL=zL+1;
	osMap.setCenter(new OpenSpace.MapPoint(pt),zL);	
    } else if (e.scale < 1) {
		zL=zL-1;
        //React to the pinch zoom out here.
			osMap.setCenter(new OpenSpace.MapPoint(pt),zL);	
    }
}
document.getElementById("map").ongestureend = onPinch;
}

//now the gps tracking code
function stoptrack(){
  clearInterval(mytimer);

poscount=0;
markers.removeMarker(gpsmarker); 
navigator.geolocation.clearWatch(watchID);
document.getElementById("gps").innerHTML="";
osMap.setCenter(lastmappos);
}

function starttrack(){
//save current nap position
 lastmappos= osMap.getCenter();

  var timeoutVal = 10 * 1000 * 1000;
  if (navigator.geolocation)
    {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
    }
  else{document.getElementById("gps").innerHTML="Geolocation is not supported by this browser.";}
  	mytimer=setInterval(function(){renewposition()},5000);
    //navigator.geolocation.clearWatch(watchID);
  
 //watchID=navigator.geolocation.watchPosition(
 //  showPosition, 
 // displayError,
 //{ enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
 // );

  }

function renewposition(){
    navigator.geolocation.getCurrentPosition(showPosition,showError);  
}    
  
function showPosition(position)
  {
poscount=poscount+1;
lon = position.coords.longitude;  
lat = position.coords.latitude;
  x=poscount+": Lat: " + lat.toFixed(8) + 
  " Lng: " + lon.toFixed(8) + "<br />" ;

//document.getElementById("gps").innerHTML=x;

var gridProjection = new OpenSpace.GridProjection();
var lonlat = new OpenLayers.LonLat(lon,lat);
var mapPoint = gridProjection.getMapPointFromLonLat(lonlat);

east=mapPoint.getEasting();
north=mapPoint.getNorthing(); 
  
size = new OpenLayers.Size(33,45);
offset = new OpenLayers.Pixel(-16,-36);
infoWindowAnchor = new OpenLayers.Pixel(16,16);
icon = new OpenSpace.Icon('images/hiking.png', size, offset, null, infoWindowAnchor);
content = "GPS location<br/>Lat:" +lat+"<br/>Lng:"+lon ;
oldgpsmarker=gpsmarker;

gpsmarker = new OpenLayers.Marker(mapPoint,icon);
markers.addMarker(gpsmarker);	

osMap.setCenter((mapPoint));   
markers.removeMarker(oldgpsmarker);  
  
  
  }
function showError(error)
  {
  switch(error.code) 
    {
    case error.PERMISSION_DENIED:
document.getElementById("gps").innerHTML="User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
document.getElementById("gps").innerHTML="Location information is unavailable."
      break;
    case error.TIMEOUT:
document.getElementById("gps").innerHTML="The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
document.getElementById("gps").innerHTML="An unknown error occurred."
      break;
    }
  }
  
  function recentremap(){
	pt=osMap.getCenter();
	osMap.setCenter(new OpenSpace.MapPoint(pt));	
  }
 
  initmapbuilder();
