var dragplate, sphere, cube, screenplate, bindTiltDrag, deviceOrientationHandler, doTilt, enviroController, init, killMouseDelta, killTouchDelta, mouseDelta, mouseTrack, tiltFilter, touchDelta, touchTrack, unbindTiltDrag;

window.addEventListener('DOMContentLoaded', init, true);

function init() {
	dragplate = document.getElementById("dragplate");
	sphere = document.getElementById("sphere");
	cube = document.getElementById("cube");
	frame = document.getElementById("screenFrame");
	conversation = document.getElementById("conversation");
	screenplate = document.getElementById("screenWindow");
	shifter = document.getElementById("contextShifter");
	help = document.getElementById("helpScreen");
	puzzle = document.getElementById("puzzleWindow");
	visorGoal = screenplate.querySelector("#visorbottom h4 .goal");
	GUIchrome = shifter.querySelector(".viewport");
	nexusMap = shifter.querySelector(".nexusmap .nexusnodes");
	cube.touch = false;
	cube.radius = 240;
	cube.rotation = 0;
	cube.gyrotation = 0;
//	cube.translation = 0;
	cube.viewTop = 0.523598776; // 30°
	cube.viewBottom = -0.523598776; // -30°
	dragplate.tilt = 0;
	dragplate.scale = 1.333;
	dragplate.gyrotilt = 0;
//	dragplate.gyrotiltRaw = 0;
	dragplate.tiltSum = 0;
	screenplate.x = 0;
	screenplate.y = 0;
	adjustedTilt = 0;
	
  if (window.DeviceMotionEvent) {
		document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });
		setTimeout(function () {
			window.scrollTo(0, 1);
		}, 1000);
  } else {
		window.focus();
  }
	bindTiltDrag();
	bindPinchRotate();
}
	
function bindTiltDrag () {
	if (window.DeviceMotionEvent) {
		harmonizeForAccel();
	} else {
		document.body.addEventListener("mousedown", mouseTrack, false);
	}
}

function unbindTiltDrag () {
	if (window.DeviceMotionEvent) {
		window.removeEventListener('deviceorientation', deviceOrientationHandler, false);
		screenplate.removeEventListener("touchstart", touchTrack, false);
		screenplate.removeEventListener("touchmove", touchDelta, false); 
		screenplate.removeEventListener("touchend", killTouchDelta, false);
	} else {
		document.body.removeEventListener("mousedown", mouseTrack, false);
		screenplate.removeEventListener("mousemove", mouseDelta, false); 
		screenplate.removeEventListener("mouseup", killMouseDelta   , false);
	}
}

function touchTrack (e) {
// Don't track motion when multiple touches are down in this element (that's a gesture)
	if (e.targetTouches.length !== 1) {
		return false;
	}
	screenplate.x = e.targetTouches[0].pageX;
	screenplate.y = e.targetTouches[0].pageY;
	screenplate.addEventListener("touchmove", touchDelta, false); 
	screenplate.addEventListener("touchend", killTouchDelta, false);
}

function mouseTrack (e) {
	screenplate.x = e.pageX;
	screenplate.y = e.pageY;
	screenplate.addEventListener("mousemove", mouseDelta, false); 
	document.body.addEventListener("mouseup", killMouseDelta, false);
}

function deviceOrientationHandler (eventData) {
  var LR = eventData.gamma;
  var FB = eventData.beta;
  var DIR = eventData.alpha;
  cube.gyrotation = -1*DIR*Math.PI/180;
  adjustedTilt = -1*LR*Math.PI/180 - 1.57079633;
  doTurn();
	radianDeltaLR = dragplate.gyrotilt - adjustedTilt;
	if(tiltFilter(radianDeltaLR)) { 
		dragplate.gyrotilt -= radianDeltaLR;
		doTilt();
	}
}

function enviroController (x,y) {
	var radianDeltaX = Math.atan(x/(cube.radius*dragplate.scale));
	var radianDeltaY = Math.atan(y/(cube.radius*dragplate.scale));
	cube.rotation = cube.rotation + radianDeltaX;
//	cube.translation = cube.translation - x;
	doTurn();
//	cube.style.webkitTransform = "translateX(" + -1*Math.sin(cube.rotation)*cube.radius + "px) translateZ(" + (cube.radius - Math.cos(cube.rotation)*cube.radius) + "px) rotateY("+ cube.rotation + "rad)";
	if(tiltFilter(radianDeltaY)) { 
		dragplate.tilt -= radianDeltaY;
		doTilt();
	}
}

function tiltFilter (arcDelta) {
	arcDelta = arcDelta || 0;
	var tiltSum = dragplate.tilt + dragplate.gyrotilt - arcDelta;
  if (tiltSum > cube.viewBottom && tiltSum < cube.viewTop) {
		return true;		
  } else {
		return false;
  }
}

function harmonizeForAccel () {
	if (window.DeviceMotionEvent) {
		window.addEventListener('deviceorientation', harmonizeAccelEvents, false);
	}
}

function harmonizeAccelEvents (eventData) {
  var LR = eventData.gamma;
	adjustedTilt = -1*LR*Math.PI/180 - 1.57079633;
	dragplate.tilt = -1*adjustedTilt;
	dragplate.gyrotilt = adjustedTilt;

	window.removeEventListener('deviceorientation', harmonizeAccelEvents, false);

		window.addEventListener('deviceorientation', deviceOrientationHandler, false);
		screenplate.addEventListener("touchstart", touchTrack, false);
		screenplate.addEventListener("gesturestart", killTouchDelta, false);// <- This might reduce flickering during two-finger operations.

}

function doTilt () {
	var deg10 = 0.174532925;
	var deg15 = 0.261799388;
	var deg30 = 0.523598776;
	var deg45 = 0.785398163;
	var deg60 = 1.04719755;
	var tiltSum = dragplate.tilt + dragplate.gyrotilt;
	dragplate.style.webkitTransform = "scale(" + dragplate.scale + ") rotateX("+ tiltSum + "rad) translateY(" + Math.sin(tiltSum)*cube.radius + "px) translateZ(" + (Math.cos(tiltSum)*cube.radius - cube.radius) + "px)";	
	if (tiltSum > deg15) { showHUD("up"); } else if (tiltSum < deg10) { hideHUD("up"); }
	if (tiltSum < -1*deg15) { showHUD("down"); } else if (tiltSum > -1*deg10) { hideHUD("down"); }
//	visor.style.webkitTransform = "rotateX("+ (deg30 + 1*tiltSum) + "rad) translateY(" + Math.sin(tiltSum)*cube.radius + "px) translateZ(" + (Math.cos(tiltSum)*cube.radius - cube.radius) + "px)";	
}

function doTurn () {
	var turnSum = cube.rotation + cube.gyrotation;
	cube.style.webkitTransform = "translateX(" + -1*Math.sin(turnSum)*cube.radius + "px) translateZ(" + (cube.radius - Math.cos(turnSum)*cube.radius) + "px) rotateY("+ turnSum + "rad)";
}

function showHUD(dir) {
	if (!hasClass(frame, "hudActive-" + dir)) { addClass(frame, "hudActive-" + dir); }
}

function hideHUD(dir) {
	if (hasClass(frame, "hudActive-" + dir)) { removeClass(frame, "hudActive-" + dir); }
}

function killMouseDelta() {
	screenplate.removeEventListener("mousemove", mouseDelta, false); 
	screenplate.removeEventListener("mouseup", killMouseDelta   , false);
}

function killTouchDelta() {
	screenplate.removeEventListener("touchmove", touchDelta, false); 
	screenplate.removeEventListener("touchend", killTouchDelta, false);
}

function mouseDelta (e) {
	var xPos = e.pageX;
	var yPos = e.pageY;
	var xDelta = screenplate.x - xPos;
	var yDelta = screenplate.y - yPos;
	enviroController(xDelta,yDelta);
	screenplate.x = xPos;
	screenplate.y = yPos;
}

function touchDelta (e) {
// Don't track motion when multiple touches are down in this element (that's a gesture)
	if (e.targetTouches.length !== 1) {
		return false;
	}
	e.preventDefault();
	e.stopPropagation();
	var xPos = e.targetTouches[0].pageX;
	var yPos = e.targetTouches[0].pageY;
	var xDelta = screenplate.x - xPos;
	var yDelta = screenplate.y - yPos;
	if (Math.abs(xDelta) + Math.abs(yDelta) < 99) { // <- should hopefully prevent misfiring two-finger touches
		enviroController(xDelta,yDelta);
		screenplate.x = xPos;
		screenplate.y = yPos;
	}
}

function bindPinchRotate () {
	if (hasClass(frame,"locked-activateNexus")) {
		return false;
	} else {
		if (window.DeviceMotionEvent) {
			screenplate.addEventListener("gesturechange", touchGesture, false);
		} else {
			document.addEventListener("keydown", keyHandler, false);
		}
	}	
}

function unbindPinchRotate () {
	if (window.DeviceMotionEvent) {
		screenplate.removeEventListener("gesturechange", touchGesture, false);
	} else {
		document.removeEventListener("keydown", keyHandler, false);
	}
	
}

function addClass(ele, cls) {
//	element.className += " " + cls;
	ele.classList.add(cls);
}

function removeClass(ele, cls) {
	ele.classList.remove(cls);
}

function hasClass(element, cls) {
	var r = new RegExp('\\b' + cls + '\\b');
	return r.test(element.className);
}

function touchGesture (event) {
	event.stopPropagation(); // <- this might reduce flickering on two-finger events
	if (event.scale < 0.75) { // pinch, pull out
		if (hasClass(frame, "nexusState-active")) { suspendNexus(); } else { restoreNexus(); }
	} else if (event.scale > 1.25) { // zoom, dive in
		if (hasClass(frame, "nexusState-active")) { suspendNexus(); } else { restoreNexus(); }
	}

}

function keyHandler (event) {
	if (event.keyCode === 32) { 
		if (hasClass(frame, "nexusState-active")) { suspendNexus(); } else { restoreNexus(); }
	} 
}

function deTilt(scale) {
	scale = scale || dragplate.scale;
	dragplate.style.webkitTransitionDuration = ".333s";
	dragplate.style.webkitTransform = "scale(" + scale + ")";
	unbindTiltDrag();
	dragplate.tilt = 0; // During the scale, we also reset the tilt back to zero.
	hideHUD("down");
	setTimeout(function () { 
		dragplate.style.webkitTransitionDuration = "0s";
	}, 666);
}

function reTilt() {
	dragplate.style.webkitTransitionDuration = ".333s";
	dragplate.style.webkitTransform = "scale(" +	dragplate.scale +")";
//	doTilt(); // Since the transitionDuration is still in effect, this will animate back to the accelerometer-tilted position.
	setTimeout(function () { 
		dragplate.style.webkitTransitionDuration = "0s";
		bindTiltDrag();
	}, 333);
}
/*
function invokeChrome () {
	$("#screenFrame").trigger("chromeinvoked");
	addClass(frame,"chromeState-viewport");
	addClass(frame,"transitioning");
	deTilt(0.666);
	setTimeout(function () { 
		removeClass(frame,"transitioning");
	}, 333);
}
  
function dismissChrome () {
	$("#screenFrame").trigger("chromedismissed");
	addClass(frame,"transitioning");
	removeClass(frame,"chromeState-viewport");
	reTilt();
	setTimeout(function () { 
	$("#contextShifter > .nexusmap .nexusfield").show();
		removeClass(frame,"transitioning");
	}, 333);
}
*/

function suspendNexus() {
	var nexusState;
	if (hasClass(frame,"browserOpen")) {
		nexusState = "browser";
		exitRing();
		setTimeout(exitNexus, 666);
	} else if (hasClass(frame,"serverState-expanded")) {
		nexusState = "spindle";
		exitRing();
		setTimeout(exitNexus, 666);
	} else {
		nexusState = "galaxy";
		exitNexus();
	}
	shifter.setAttribute("data-state", nexusState);
}

function restoreNexus() {
	enterNexus();
	var nexusState = shifter.getAttribute("data-state");
	switch(nexusState) {
		case "galaxy":
			// Eventually we'll transition from the central hub to full galaxy view.
			$("#contextShifter").one("click", ".nexusmap .nexusring", enterRing);
		break;
		case "spindle":
		setTimeout(enterRing, 1333);
		break;
		case "browser":
		setTimeout(enterRing, 1333);
		break;
		default:
		break;
	}
}

function enterNexus () {
	if (hasClass(conversation,"active")) { return false; } // <- This listener should really be suppressed when conversation is active...
	$("#screenFrame").trigger("nexusentered");
	rRad = "-1.5708rad"; // 90deg
	deTilt();
	$("#sceneScrutiny").removeClass("active").addClass("inactive");
	dragplate.style.webkitTransitionDuration = ".666s";
	dragplate.style.webkitTransform = "scale(.125)"; // rotateX(" + rRad + ") translateY(-240px) translateZ(-240px)";	
	shifter.style.top = "-320px";
	setTimeout(function () { 
		addClass(frame,"nexusState-active");
		addClass(frame,"transitioning");
	}, 222);
	setTimeout(function () { 
		removeClass(frame,"transitioning");
	}, 666);
}
  
function exitNexus () {
	$("#screenFrame").trigger("nexusexited");
//	GUIchrome.style.top = "0px";
//	dragplate.style.display = "block";
//	$("#sceneScrutiny").show();
	$("#contextShifter").off("click", ".nexusmap .nexusring", enterRing);
//	$("#contextShifter > .nexusmap .nexusfield").fadeOut(555);
	addClass(frame,"transitioning");
	setTimeout(function () { 
		dragplate.style.webkitTransitionDuration = ".666s";
		dragplate.style.webkitTransform = "scale(1.333)";	
	}, 222);
	setTimeout(function () { 
		removeClass(frame,"transitioning");
		removeClass(frame,"nexusState-active");
		$("#sceneScrutiny").addClass("active").removeClass("inactive");
	}, 444);
	setTimeout(function () { 
		shifter.style.top = "";
		reTilt();
	}, 888);
}

function enterRing () {
	$("#screenFrame").trigger("ringentered");
	addClass(frame,"zoomLevel-1");
	addClass(frame,"zooming");
	setTimeout(function () { 
		spindle.style.webkitTransitionDuration = ".666s, .666s";
		adjustSpindle();
		addClass(frame,"serverState-expanded");
		setTimeout(function () { 
			spindle.style.webkitTransitionDuration = "";
		}, 666);
	}, 111);
	setTimeout(function () { 
		removeClass(frame,"zooming");
	}, 333);
	setTimeout(function () { 
		bindNexusDrag();
		addClass(browser,"active");
		bindBrowserDrag();
//		$("#contextShifter").on("click", ".nexusring .ringtitle", exitRing); // <- No longer works, due to the touch plates.
	}, 999);
}
  
function exitRing () {
	$("#screenFrame").trigger("ringexited");
	if (hasClass(frame,"browserOpen")) { exitBrowser(); }
	unbindNexusDrag();
	removeClass(browser,"active");
	unbindBrowserDrag();
	$("#contextShifter").off("click", ".nexusring .ringtitle", exitRing);
	nexusMap.style.webkitTransitionDuration = ".333s";
	removeClass(frame,"serverState-expanded");
	spindle.style.webkitTransitionDuration = ".666s, .666s";
	spindle.style.webkitTransform = "";
	setTimeout(function () { 
		removeClass(frame,"zoomLevel-1");
		addClass(frame,"zooming");
		setTimeout(function () { 
			removeClass(frame,"zooming");
			nexusMap.style.webkitTransitionDuration = "";
		}, 333);
	}, 222);
	setTimeout(function () { 
		spindle.style.webkitTransitionDuration = "";
//		$("#contextShifter").one("click", ".nexusmap .nexusring", enterRing); // <- No longer works, due to the touch plates.
	}, 666);

}

function enterBrowser () {
//	$("#contextShifter").off("click", ".nexusring .nexusbrowser", enterBrowser);
	addClass(frame,"browserOpen");
	unbindNexusDrag();
//	$("#spindlePlate").on("click", exitBrowser);
	setTimeout(function () { 
		$("#screenFrame").trigger("browserentered");
		var currentBrowserPage = $("#contextShifter ul.browsercopy > li.active").attr("data-browser");
		$("#screenFrame").trigger("browseractive-" + currentBrowserPage);
	}, 666);
}

function exitBrowser () {
//	$("#contextShifter").off("click", ".nexusmap .nexusring .servers, .nexusring .spindleplate", exitBrowser);
//	$("#contextShifter").on("click", ".nexusring .nexusbrowser", enterBrowser);
	browser.style.webkitTransitionDuration = "";
	browsercontent.style.webkitTransitionDuration = "";
	stack.style.webkitTransitionDuration = "";
	spindle.style.webkitTransitionDuration = "";
	activering.style.webkitTransitionDuration = "";
	browser.style.webkitTransform = "";
	browsercontent.style.opacity = "";
	stack.style.webkitTransform = "";
	spindle.style.opacity	= "";
	activering.style.opacity = "";
	removeClass(frame,"browserOpen");
	bindNexusDrag();
//	$("#spindlePlate").off("click", exitBrowser);
	setTimeout(function () { 
		$("#screenFrame").trigger("browserexited");
	}, 666);
}

function showHelp (name) {
	unbindTiltDrag();
	addClass(frame,"helpOpen");
	addClass(help,"activeHelp-" + name);
	help.setAttribute("data-active", name);
}

function hideHelp () {
	removeClass(frame,"helpOpen");
	var activeHelp = help.getAttribute("data-active");
	removeClass(help,"activeHelp-" + activeHelp);
	help.removeAttribute("data-active");
}

function showPuzzle (name) {
	puzzle.style.top = "0px";
	addClass(frame,"puzzleActive");
	setTimeout(function () { 
		addClass(puzzle,"activePuzzle-" + name);
		puzzle.setAttribute("data-active", name);
		bindPageDrag("#" + name + " .puzzleRules", "#puzzleField", "#" + name);
	}, 500);
}

function hidePuzzle () {
	$(puzzle).off("click", ".puzzleUnit button[name='solve']");
	unbindPageDrag();
	var activePuzzle = puzzle.getAttribute("data-active");
	removeClass(puzzle,"activePuzzle-" + activePuzzle);
	addClass(frame,"dismiss");
	setTimeout(function () { 
		removeClass(frame,"puzzleActive");
		removeClass(frame,"dismiss");
		puzzle.removeAttribute("data-active");
		puzzle.style.top = "-360px";
		scrollColumn.style.webkitTransform = "translateY(0px)";
	}, 500);
}
