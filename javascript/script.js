/*
Copyright (C) 2012 DigiImagesApp-Dev-Team

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
  }
  else {
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

  var items = req.responseXML.getElementsByTagName("item");
  var tmpDiv = document.createElement('div');
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
      link.href = "http://www.digi-images.de/showImage.html?imageId=" + linkSrc.replace(/^.*imageId=(\d+).*$/, "$1") + "&custAlbum=lastup";
      link.appendChild(img);
      var div = document.createElement("div");
      div.setAttribute("class", "step slide");
      var xPos = (globalImageCount % IMAGES_PER_ROW) * 555;
      var yPos = Math.floor(globalImageCount / IMAGES_PER_ROW) * 555;
      div.setAttribute("data-x", xPos);
      div.setAttribute("data-y", yPos);
      div.setAttribute("data-scale", "1");
      div.setAttribute("data-hover", "2");
      div.appendChild(link);
      tmpDiv.appendChild(div);
      globalImageCount++;
    }
  }
  if (globalLoadCount === 1) {
    document.getElementById("impress").appendChild(tmpDiv);
    var script = document.createElement("script");
    script.setAttribute("src", "javascript/impress.js");
    document.body.appendChild(script);
  }
  else {
    updateImpress(tmpDiv);
  }
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
