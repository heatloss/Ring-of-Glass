window.addEventListener('DOMContentLoaded', initnexus, true);

function initnexus() {
	ring = document.querySelector(".nexusring");
	browser = ring.querySelector(".nexusbrowser");
	browsercontent = browser.querySelector(".browsercontent");
	browserplate = document.getElementById("browserPlate");
	stack = ring.querySelector(".serverStack");
	spindle = stack.querySelector(".servers");
	spindleplate = document.getElementById("spindlePlate");
	activering = stack.querySelector(".activering");
	serverList = spindle.querySelectorAll("li");
	browserList = browser.querySelectorAll(".browsercopy > li");
	serverTitleList = spindle.querySelectorAll("li > p");
	scrollPage = document.querySelector(".scrollable");
	serverSpans = [];
	spindle.x = 0;
	spindle.y = 0;
	spindle.z = 0;
}

function bindNexusDrag () {
	var i = 0, j = serverList.length;
	for (; i < j; i++) {
		serverSpans[i] = matrixToArray(window.getComputedStyle(serverList[i])['-webkit-transform'])[14] || 0;
	}
	if (window.DeviceMotionEvent) {
//		window.addEventListener('deviceorientation', deviceOrientationHandler, false);
		spindleplate.addEventListener("touchstart", touchNexus, false);
	} else {
		spindleplate.addEventListener("mousedown", mouseNexus, false);
	}
}

function unbindNexusDrag () {
	if (window.DeviceMotionEvent) {
//		window.removeEventListener('deviceorientation', deviceOrientationHandler, false);
		spindleplate.removeEventListener("touchstart", touchNexus, false);
	} else {
		spindleplate.removeEventListener("mousedown", mouseNexus, false);
	}
}

function touchNexus (e) {
	spindle.x = e.targetTouches[0].pageX;
	spindle.y = e.targetTouches[0].pageY;
	frame.addEventListener("touchmove", touchNexusDelta, false); 
	document.body.addEventListener("touchend", killTouchNexusDelta, false);
}

function mouseNexus (e) {
	spindle.x = e.pageX;
	spindle.y = e.pageY;
	frame.addEventListener("mousemove", mouseNexusDelta, false); 
	document.body.addEventListener("mouseup", killMouseNexusDelta, false);
}

function killTouchNexusDelta() {
	frame.removeEventListener("touchmove", touchNexusDelta, false); 
	document.body.removeEventListener("touchend", killTouchNexusDelta, false);
	snapServer();
}

function killMouseNexusDelta() {
	frame.removeEventListener("mousemove", mouseNexusDelta, false); 
	document.body.removeEventListener("mouseup", killMouseNexusDelta, false);
	snapServer();
}

function touchNexusDelta (e) {
// Don't track motion when multiple touches are down in this element (that's a gesture)
	if (e.targetTouches.length !== 1) {
		return false;
	}
	e.preventDefault();
	e.stopPropagation();
	var xPos = e.targetTouches[0].pageX;
	var yPos = e.targetTouches[0].pageY;
	var xDelta = spindle.x - xPos;
	var yDelta = spindle.y - yPos;
	nexusController(xDelta,yDelta);
	spindle.x = xPos;
	spindle.y = yPos;
//	removeClass(browser,"active");
}

function mouseNexusDelta (e) {
	var xPos = e.pageX;
	var yPos = e.pageY;
	var xDelta = spindle.x - xPos;
	var yDelta = spindle.y - yPos;
	nexusController(xDelta,yDelta);
	spindle.x = xPos;
	spindle.y = yPos;
//	removeClass(browser,"active");
//	unbindBrowserDrag();
}

function nexusController (x,y) {
	var nexusSpaceY = y * 2.4;
	spindle.z += nexusSpaceY;
	highlightServer();
	adjustSpindle();
}

function highlightServer() {
	nearestServerIndex = getClosestIndex(-1*spindle.z, serverSpans);
	var i = 0, j = serverList.length;
	for (; i < j; i++) {
		removeClass(serverList[i], "active");
		removeClass(browserList[i], "active");
	}
	addClass(serverList[nearestServerIndex],"active");
	addClass(browserList[nearestServerIndex],"active");
}

function snapServer() {
	nearestServerIndex = getClosestIndex(-1*spindle.z, serverSpans);
	spindle.z = -1*serverSpans[nearestServerIndex];
	adjustSpindle();
	if (!hasClass(browser,"active")) {
		addClass(browser,"active");
	}
	if (!hasClass(frame,"browserOpen")) {
		bindBrowserDrag();
	}
}

function adjustSpindle() {
	spindle.style.webkitTransform = "translateZ(" + spindle.z + "px)";
}

function matrixToArray(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}

function getClosestIndex(num, ar) {
	var i = 0, closest, closestDiff, currentDiff;
	if(ar.length) {
			closest = ar[0];
			closestIndex = 0;
			for(i;i<ar.length;i++) {           
					closestDiff = Math.abs(num - closest);
					currentDiff = Math.abs(num - ar[i]);
					if(currentDiff < closestDiff) {
							closest = ar[i];
							closestIndex = i;
					}
					closestDiff = null;
					currentDiff = null;
			}
			//returns first element that is closest to number
			return closestIndex;
	}
	//no length
	return false;
}

