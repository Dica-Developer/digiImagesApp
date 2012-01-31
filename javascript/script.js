var globalLoadCount = 0;
var globalImageCount = 0;
var MAX_IMAGES = 220;
var IMAGES_PER_ROW = 20;
var ELEM_ID = 0;
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

function showPhotos() {
	globalLoadCount++;
	var filterArray = {};
	var filter = localStorage["data.user.filter"];
	if (null !== filter && undefined !== filter) {
		filterArray = JSON.parse(filter).split("\n");
	}

	var items = req.responseXML.getElementsByTagName("item"),
		tmpDiv = document.createElement('div');
	for (var i = 0; i < items.length && globalImageCount < MAX_IMAGES; i++) {
		var item = items[i];
		var thumbnail = item.getElementsByTagName("thumbnail")[0];
		var title = item.getElementsByTagName("title")[0];
		var titleText = title.firstChild.nodeValue;
		if (contains(titleText, filterArray)) {
			var img = new Image();
			img.addEventListener('load', function(){impress.handleDescription(this)});
			img.src = thumbnail.getAttribute("url").replace('size=500','size=300');
			img.title = titleText;

			var titleSpan = document.createElement('div');
			titleSpan.setAttribute('class','description');
			titleSpan.setAttribute('data-rotateZ','90');
			var spanText = document.createTextNode(titleText);
			titleSpan.appendChild(spanText);
			var linkSrc = item.getElementsByTagName("content")[0].getAttribute("url");
			var link = document.createElement("a");
			link.href = "http://www.digi-images.de/showImage.html?imageId=" + linkSrc.replace(/^.*imageId=(\d+).*$/, "$1") + "&custAlbum=lastup";
			link.appendChild(img);
			var div = document.createElement("div");
			div.setAttribute("class", "step slide");
			var xPos = (globalImageCount % IMAGES_PER_ROW) * 355;
			var yPos = Math.floor(globalImageCount / IMAGES_PER_ROW) * 355;
			div.setAttribute("data-x", xPos);
			div.setAttribute("data-y", yPos);
			div.setAttribute("data-scale", "1");
			div.setAttribute("data-hover", "2");
			div.appendChild(link);
			div.appendChild(titleSpan);
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
//	}
}

function load(start) {
  var host = localStorage["data.rss.url"];
  var url = "http://www.digi-images.de/cooliris.rss?&custAlbum=lastup&start=" + start;
  if (null !== host && undefined !== host && host.match("^.*?:\\.*")) {
    url = JSON.parse(host);
  }

  req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.onload = showPhotos;
  req.send(null);
}
