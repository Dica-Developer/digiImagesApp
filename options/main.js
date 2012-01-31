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
  var currentTab = document.querySelector("li.navbar-item-selected");
  currentTab.classList.remove("navbar-item-selected");
  document.querySelector("#"+ currentTab.id +"Page").style.display = "none";
  this.classList.add("navbar-item-selected");
  document.querySelector("#"+ this.id +"Page").style.display = "block";
}
