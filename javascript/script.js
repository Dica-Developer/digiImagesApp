var globalLoadCount = 0;
var globalImageCount = 0;
var MAX_IMAGES = 220;
var IMAGES_PER_ROW = 20;
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
  if (null !== filter) {
    filterArray = JSON.parse(filter).split("\n");
  }

  var items = req.responseXML.getElementsByTagName("item");
  for (var i = 0; i < items.length && globalImageCount < MAX_IMAGES; i++) {
    var item = items[i];
    var thumbnail = item.getElementsByTagName("thumbnail")[0];
    var title = item.getElementsByTagName("title")[0];
    var titleText = title.firstChild.nodeValue;
    if (contains(titleText, filterArray)) {
      var img = document.createElement("image");
      img.src = thumbnail.getAttribute("url");
      img.title = titleText;

      var linkSrc = item.getElementsByTagName("content")[0].getAttribute("url");
      var link = document.createElement("a");
      link.href = "http://www.digi-images.de/showImage.html?imageId="+ linkSrc.replace(/^.*imageId=(\d+).*$/, "$1") +"&custAlbum=lastup";
      link.appendChild(img);
      var div = document.createElement("div");
      div.setAttribute("class", "step slide");
      var xPos = (globalImageCount % IMAGES_PER_ROW) * 555;
      var yPos = Math.floor(globalImageCount / IMAGES_PER_ROW) * 555;
      div.setAttribute("data-x", xPos);
      div.setAttribute("data-y", yPos);
      div.setAttribute("data-scale", "1");
      div.appendChild(link);
      document.getElementById("impress").appendChild(div);
      globalImageCount++;
    }
  }
  if (globalImageCount < MAX_IMAGES) {
    load(35 * globalLoadCount);
  } else {
    var script = document.createElement("script");
    script.setAttribute("src", "javascript/impress.js");
    document.body.appendChild(script);
  }
}

function load(start) {
  var host = localStorage["data.rss.url"];
  var url = "http://www.digi-images.de/cooliris.rss?&custAlbum=lastup&start=" + start;
  if (null !== host && host.match("^.*?:\\.*")) {
    url = JSON.parse(host);
  }

  req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.onload = showPhotos;
  req.send(null);
}
