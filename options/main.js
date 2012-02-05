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

function saveFeed(){
	var feed = document.querySelector("#feedBox").value;
	localStorage["data.rss.url"] = JSON.stringify(feed);
}

function saveFilter(){
	var filter = document.querySelector("#filterBox").value;
	var newFilter = "";
	var filterArray = filter.split("\n");
	for (var i = 0; i < filterArray.length; i++) {
		var filterTemp = filterArray[i].replace(/^\s/g, "");
		filterTemp = filterTemp.replace(/\s$/g, "");
		if (filterTemp.length > 0) {
			if (newFilter.length > 0) {
				newFilter = newFilter + "\n";
			}
			newFilter = newFilter + filterTemp;
		}
	}
	localStorage["data.user.filter"] = JSON.stringify(newFilter);
}

function fill(){
	var feed = localStorage["data.rss.url"];
	if (null !== feed && undefined !== feed) {
	  document.querySelector("#feedBox").value = JSON.parse(feed);
	}
	var filter = localStorage["data.user.filter"];
	if (null !== filter && undefined !== filter) {
	  document.querySelector("#filterBox").value = JSON.parse(filter);
	}
	document.querySelector("#feed").onclick = selectTab;
	
	document.querySelector("#filter").onclick = selectTab;
	
	document.querySelector("#about").onclick = selectTab;
}

function selectTab() {
  var currentTab = document.querySelector("li.navbar-item-selected")
  currentTab.classList.remove("navbar-item-selected");
  document.querySelector("#"+ currentTab.id +"Page").style.display = "none";
  this.classList.add("navbar-item-selected");
  document.querySelector("#"+ this.id +"Page").style.display = "block";
}
