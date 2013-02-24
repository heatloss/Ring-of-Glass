var scrollColumn, proxy, swipeRow, paging;

function bindPageDrag (selector, proxySelector, pagingSelector) {
	scrollColumn = document.querySelector(selector);
	proxy = document.querySelector(proxySelector) || scrollColumn;
	scrollColumn.scroll = matrixToArray(window.getComputedStyle(scrollColumn)['-webkit-transform'])[13] || 0;
	var offsetV = scrollColumn.offsetHeight - scrollColumn.parentNode.offsetHeight;
	scrollColumn.snaps = [0, offsetV];
	proxy.x = 0;
	proxy.y = 0;
//	proxy.z = 0;
	paging = typeof pagingSelector !== "undefined" ? true : false;
	if (paging) { 
		swipeRow = document.querySelector(pagingSelector); 
		swipeRow.scroll = matrixToArray(window.getComputedStyle(swipeRow)['-webkit-transform'])[12] || 0;
		var offsetH = scrollColumn.offsetWidth; // using the scrollColumn width, since we don't actually want the container's width in this case;
		swipeRow.snaps = [0, offsetH];
		proxy.dir = "none";
	} 
	if (window.DeviceMotionEvent) {
		proxy.addEventListener("touchstart", touchPage, false);
	} else {
		proxy.addEventListener("mousedown", mousePage, false);
	}	
}

function unbindPageDrag () {
	if (window.DeviceMotionEvent) {
//		window.removeEventListener('deviceorientation', deviceOrientationHandler, false);
		scrollColumn.removeEventListener("touchstart", touchPage, false);
	} else {
		scrollColumn.removeEventListener("mousedown", mousePage, false);
	}
}

function touchPage (e) {
	proxy.x = e.targetTouches[0].pageX;
	proxy.y = e.targetTouches[0].pageY;
	frame.addEventListener("touchmove", touchPageDelta, false); 
	document.body.addEventListener("touchend", killTouchPageDelta, false);
}

function mousePage (e) {
	proxy.x = e.pageX;
	proxy.y = e.pageY;
	frame.addEventListener("mousemove", mousePageDelta, false); 
	document.body.addEventListener("mouseup", killMousePageDelta, false);
}

function killTouchPageDelta() {
	frame.removeEventListener("touchmove", touchPageDelta, false); 
	document.body.removeEventListener("touchend", killTouchPageDelta, false);
	snapPage();
	if (paging) { 
		proxy.dir = "none";
	} 
}

function killMousePageDelta() {
	frame.removeEventListener("mousemove", mousePageDelta, false); 
	document.body.removeEventListener("mouseup", killMousePageDelta, false);
	snapPage();
	if (paging) { 
		proxy.dir = "none";
	} 
}

function touchPageDelta (e) {
// Don't track motion when multiple touches are down in this element (that's a gesture)
	if (e.targetTouches.length !== 1) {
		return false;
	}
	e.preventDefault();
	e.stopPropagation();
	var xPos = e.targetTouches[0].pageX;
	var yPos = e.targetTouches[0].pageY;
	var xDelta = proxy.x - xPos;
	var yDelta = proxy.y - yPos;
	pageController(xDelta,yDelta);
	proxy.x = xPos;
	proxy.y = yPos;
}

function mousePageDelta (e) {
	var xPos = e.pageX;
	var yPos = e.pageY;
	var xDelta = proxy.x - xPos;
	var yDelta = proxy.y - yPos;
	pageController(xDelta,yDelta);
	proxy.x = xPos;
	proxy.y = yPos;
}

function pageController (x,y) {
	if (paging) { 
		if (proxy.dir === "vert") {
			scrollColumn.scroll -= y;
			scrollColumn.style.webkitTransform = "translateY(" + (scrollColumn.scroll) + "px)";	
		} else if (proxy.dir === "horiz") {
			swipeRow.scroll -= x;
			swipeRow.style.webkitTransform = "translateX(" + (swipeRow.scroll) + "px)";
		} else {
			proxy.dir = Math.abs(x) > Math.abs(y) ? "horiz" : "vert";
		}
	} else {
		scrollColumn.scroll -= y;
		scrollColumn.style.webkitTransform = "translateY(" + (scrollColumn.scroll) + "px)";	
	}
}

function snapPage () {
	if (-1*scrollColumn.scroll < 0 || -1*scrollColumn.scroll > scrollColumn.snaps[1]) {
		nearestPageIndex = getClosestIndex(-1*scrollColumn.scroll, scrollColumn.snaps);
		scrollColumn.scroll = -1*scrollColumn.snaps[nearestPageIndex];
		scrollColumn.style.webkitTransitionDuration = ".200s";
		scrollColumn.style.webkitTransform = "translateY(" + (scrollColumn.scroll) + "px)";
		setTimeout(function () { 
			scrollColumn.style.webkitTransitionDuration = "0s";
		}, 333);
	}
	if (paging) {
	
		nearestPageIndex = getClosestIndex(-1*swipeRow.scroll, swipeRow.snaps);
		swipeRow.scroll = -1*swipeRow.snaps[nearestPageIndex];
		swipeRow.style.webkitTransitionDuration = ".200s";
		swipeRow.style.webkitTransform = "translateX(" + (swipeRow.scroll) + "px)";
		setTimeout(function () { 
			swipeRow.style.webkitTransitionDuration = "0s";
		}, 333);
	
	
	}
}
