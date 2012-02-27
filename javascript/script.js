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

var endImage = 9;
var settingNextImageNeedsOnCircleChangeEvent = false;
var globalLoadCount = 0;
var globalImageCount = 0;
var MAX_IMAGES = 225;
var IMAGES_PER_ROW = 1;
var ELEM_ID = 0;
var NEXT_START_POSITION = {xPos:0, yPos:0};
var SIDE_IMAGE_COUNT = 0;
var req;
var divMeasures = {
  width:355,
  height:355
};

/**
 * @Class
 */

var direction = (function () {
  //private
  var _directions = ['south', 'west', 'north', 'east'];
  var _directionPositions = function (xPos, yPos) {
    return {
      east:{
        xPos:xPos + divMeasures.width,
        yPos:yPos
      },
      south:{
        xPos:xPos,
        yPos:yPos + divMeasures.height
      },
      west:{
        xPos:xPos - divMeasures.width,
        yPos:yPos
      },
      north:{
        xPos:xPos,
        yPos:yPos - divMeasures.height
      }
    };
  };
  var _actDirection = 0;//[TODO] south instead of 0


  //global
  var getPosition = function (xPos, yPos) {
    return _directionPositions(xPos, yPos)[_directions[_actDirection]];
  };
  var setNewDirection = function () {
    if (_actDirection === _directions.length - 1) {
      _actDirection = 0;
    } else {
      _actDirection += 1;
    }
  };

  var setSouth = function () {
    _actDirection = 0;
  };

  return {
    getPosition:getPosition,
    setNewDirection:setNewDirection,
    setSouth:setSouth
  };
})();


function contains(shouldContain, filter) {
  if (filter.length > 0) {
    for (var i = 0; i < filter.length; i++) {
      var regexp = new RegExp(filter[i]);
      if (shouldContain.match(regexp)) {
        return true;
      }
    }
  } else {
    return true;
  }
  return false;
}

/**
 * @return {object} <string : string>
 */
var CIRCLE_IMAGE_COUNT = 1;
function getXY() {
  if (settingNextImageNeedsOnCircleChangeEvent) {
    onCircleChangeEvent();
    settingNextImageNeedsOnCircleChangeEvent = false;
  }
  var xPos = NEXT_START_POSITION.xPos;
  var yPos = NEXT_START_POSITION.yPos;
  if (IMAGES_PER_ROW * IMAGES_PER_ROW === globalImageCount) {
    NEXT_START_POSITION.xPos = xPos + divMeasures.width;
    if (IMAGES_PER_ROW !== 1) {
      NEXT_START_POSITION.xPos = NEXT_START_POSITION.xPos + divMeasures.width;
    }
    NEXT_START_POSITION.yPos = yPos - divMeasures.height;

    direction.setSouth();
    IMAGES_PER_ROW += 2;
    settingNextImageNeedsOnCircleChangeEvent = true;
    SIDE_IMAGE_COUNT = 1;
    CIRCLE_IMAGE_COUNT = 1;
  } else {
    NEXT_START_POSITION = direction.getPosition(xPos, yPos);
  }

  //set new direction
  if (SIDE_IMAGE_COUNT === IMAGES_PER_ROW) {
    SIDE_IMAGE_COUNT = 2;
    direction.setNewDirection();
  } else {
    SIDE_IMAGE_COUNT += 1;
  }
  return  {xPos:xPos, yPos:yPos};
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
  for (var i = 0, l = items.length; i < l && globalImageCount < MAX_IMAGES && (endImage === null || endImage > globalImageCount); i++) {
    var item = items[i];
    globalImageCount++;
    var title = item.getElementsByTagName("title")[0];
    var titleText = title.firstChild.nodeValue;
    if (contains(titleText, filterArray)) {
      var thumbnail = item.getElementsByTagName("thumbnail")[0];
      var detailsText = unescape(item.getElementsByTagName('description')[1].firstChild.nodeValue).replace(/\+/g, " ");
      try {
        detailsText = decodeURIComponent(detailsText);
      } catch (e) {
        // ignore it for now
      }

      var img = new Image();
      img.addEventListener('load', function () {
        impress.handleDescription(this);
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
      detailsDiv.setAttribute('class', 'details');
      detailsDiv.innertHTML = detailsText;
      var div = document.createElement("div");
      div.setAttribute("class", "step slide");
      var position = getXY();
      div.setAttribute("data-x", position.xPos);
      div.setAttribute("data-y", position.yPos);
      div.setAttribute("data-scale", "1");
      div.setAttribute("data-hover", "2");
      div.appendChild(link);
      div.appendChild(titleSpan);

      detailsDiv.setAttribute("data-x", position.xPos);
      detailsDiv.setAttribute("data-y", position.yPos);
      detailsDiv.setAttribute("data-z", "220");
      detailsDiv.setAttribute("data-scale", "2");
      detailsDiv.setAttribute("data-rotate_X", "90");
      detailTMPDiv.appendChild(detailsDiv);
      tmpDiv.appendChild(div);
    }
  }
  impress.updateImpress(tmpDiv);
  if (null !== endImage && endImage > globalImageCount && globalImageCount < MAX_IMAGES) {
    endImage = IMAGES_PER_ROW * IMAGES_PER_ROW;
    load(globalImageCount);
  }
//  impress.updateImpress(detailTMPDiv);
}

function onCircleChangeEvent() {
  var overviewDiv = document.getElementById('overview');
  var newScaleFactor = (IMAGES_PER_ROW * 3.2) / 7;
  overviewDiv.stepData.scale.x = newScaleFactor;
  overviewDiv.stepData.scale.y = newScaleFactor;
  if(impress.isOverview()){
    impress.select(overviewDiv, true);
  }
}

function load(start) {
  var host = localStorage["data.rss.url"];
  var url = "http://www.digi-images.de/cooliris.rss?&custAlbum=lastup&start=" + start;
  var regex = new RegExp("^.*?:\\.*");
  if (null !== host && undefined !== host && host.match(regex)) {
    url = JSON.parse(host)+"&start="+start;
  }

  req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.onload = showPhotos;
  req.send(null);
}

