var globalLoadCount = 0;
var globalImageCount = 0;
var PRELOAD_IMAGES = 25;
var MAX_IMAGES = 220;
var IMAGES_PER_ROW = 1;
var ELEM_ID = 0;
var NEXT_START_POSITION = {};
var req;

function contains(shouldContain, filter) {
  var result = false;
  if (filter.length > 0) {
    for (var i = 0; i < filter.length; i++) {
      var regexp = new RegExp(filter[i]);
      if (shouldContain.match(regexp)) {
        result = true;
        break;
      }
    }
  } else {
    result = true;
  }
  return result;
}

function getXY() {

	var xPos, yPos;
	if(IMAGES_PER_ROW === 1){
		xPos = 0;
		yPos = 0;
	}else{
		if(IMAGES_PER_ROW*IMAGES_PER_ROW === globalImageCount){
			var currentDirection = directions().current;
			NEXT_START_POSITION = {
				xPos : __ret.xPos + 355,
				yPos : __ret.yPos -355
			};
			// ansonsten xPos +2*355
			// direction to south
			IMAGES_PER_ROW +=2;
			SIDE_IMAGE_COUNT = 1;
		}
		if ((sideImageCount === (IMAGES_PER_ROW - 1))) {
			// direction 90 degrees to the right
			// new position
			SIDE_IMAGE_COUNT = 1;
		} else {
			SIDE_IMAGE_COUNT += 1;
		}
	}

	NEXT_START_POSITION = {xPos:xPos, yPos:yPos};
	return NEXT_START_POSITION;
}


function showPhotos() {
	globalLoadCount++;
	var filterArray = {};
	var filter = localStorage["data.user.filter"];
	if (null !== filter && undefined !== filter) {
		filterArray = JSON.parse(filter).split("\n");
	}

	var items = req.responseXML.getElementsByTagName("item");
	var tmpDiv = document.createElement('div');
	var detailTMPDiv = document.createElement('div');
	for (var i = 0, l = items.length; i < l && globalImageCount < MAX_IMAGES; i++) {
		var item = items[i];
		var thumbnail = item.getElementsByTagName("thumbnail")[0];
		var title = item.getElementsByTagName("title")[0];
		var titleText = title.firstChild.nodeValue;
		var detailsText = decodeURIComponent(unescape(item.getElementsByTagName('description')[1].firstChild.nodeValue).replace(/\+/g,  " "));
		if (contains(titleText, filterArray)) {
			var img = new Image();
			img.addEventListener('load', function () {
				impress.handleDescription(this)
			});
			img.src = thumbnail.getAttribute("url").replace('size=500', 'size=300');
			img.title = titleText;

			var titleSpan = document.createElement('div');
			titleSpan.setAttribute('class', 'description');
			titleSpan.setAttribute('data-rotateZ', '90');
			var spanText = document.createTextNode(titleText);
			titleSpan.appendChild(spanText);
			var linkSrc = item.getElementsByTagName("content")[0].getAttribute("url");
			var link = document.createElement("a");
			link.href = "http://www.digi-images.de/showImage.html?imageId=" + linkSrc.replace(/^.*imageId=(\d+).*$/, "$1") + "&custAlbum=lastup";
			link.appendChild(img);
			var detailsDiv = document.createElement('div');
			detailsDiv.setAttribute('class','details');
			detailsDiv.innerHTML = detailsText;
			var div = document.createElement("div");
			div.setAttribute("class", "step slide");
			var position = getXY();
			div.setAttribute("data-x", position.xPos);
			div.setAttribute("data-y", position.yPos);
			div.setAttribute("data-scale", "1");
			div.setAttribute("data-hover", "2");
			detailsDiv.setAttribute("data-x", xPos);
			detailsDiv.setAttribute("data-y", yPos);
			detailsDiv.setAttribute("data-z", "220");
			detailsDiv.setAttribute("data-scale", "2");
			detailsDiv.setAttribute("data-rotate_X", "90");
			div.appendChild(link);
			div.appendChild(titleSpan);
			detailTMPDiv.appendChild(detailsDiv);
			tmpDiv.appendChild(div);
			globalImageCount++;
		}
	}
//	if (globalLoadCount === 1) {
//		document.getElementById("impress").appendChild(tmpDiv);
//		var script = document.createElement("script");
//		script.setAttribute("src", "javascript/impress.js");
//		document.body.appendChild(script);
//	} else {
		impress.updateImpress(tmpDiv);
		impress.updateImpress(detailTMPDiv);
//	}
}

function load(start) {
  var host = localStorage["data.rss.url"];
  var url = "http://www.digi-images.de/cooliris.rss?&custAlbum=lastup&start=" + start;
  var regex = new RegExp("^.*?:\\.*");
  if (null !== host && undefined !== host && host.match(regex)) {
    url = JSON.parse(host);
  }

  req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.onload = showPhotos;
  req.send(null);
}
