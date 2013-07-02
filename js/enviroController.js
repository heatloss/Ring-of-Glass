var enviro = {};

window.addEventListener('DOMContentLoaded', initEnviro, true);

function initEnviro() {
	enviro = {
		"dragplate" : document.getElementById("dragplate"),
		"cube" : document.getElementById("cube"),
		"screen" : document.getElementById("gameWindow"),
		"help" : document.getElementById("helpScreen"),
		"shifter" : document.getElementById("contextShifter"),
		"todo" : document.getElementById("todo"),
		"todoplate" : document.getElementById("todoPlate"),
		"todotext" : document.querySelector("#todoPlate .todoReadout .todo"),
		"touch" : false,
		"radius" : 480,
		"rotation" : 0,
		"gyrotation" : 0,
		"viewTop" : 0.523598776, // 30
		"viewBottom" : -0.523598776, // -30
		"adjustedTilt" : 0
	};
	
		enviro.dragplate.tilt = 0;
		enviro.dragplate.scale = 1;
		enviro.dragplate.gyrotilt = 0;
		enviro.dragplate.tiltSum = 0;
		enviro.screen.x = 0;
		enviro.screen.y = 0;

		if (window.DeviceMotionEvent) {
		document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });
		setTimeout(function () {
			window.scrollTo(0, 1);
		}, 1000);
		
		enviro.startEvent = "touchstart";
		enviro.moveEvent = "touchmove";
		enviro.endEvent = "touchend";
		enviro.tapEvent = "touchtap";
		
		enviro.parseEventData = function(e) {
			return e.targetTouches[0];
		};
	} else {
		window.focus();
		enviro.startEvent = "mousedown";
		enviro.moveEvent = "mousemove";
		enviro.endEvent = "mouseup";
		enviro.tapEvent = "touchtap";

		enviro.parseEventData = function(e) {
			return e;
		};
	}
	
	enviro.startFunc = function (e) {
		if (window.DeviceMotionEvent) {
			if (e.targetTouches.length !== 1) {
				return false; // Don't track motion when multiple touches are down in this element (that's a gesture)
			}
		}
		var evtData = enviro.parseEventData(e);
		enviro.screen.x = evtData.pageX;
		enviro.screen.y = evtData.pageY;
		enviro.screen.addEventListener(enviro.moveEvent, enviro.moveFunc, false); 
		enviro.screen.addEventListener(enviro.endEvent, enviro.endFunc, false);
	};

	enviro.moveFunc = function (e) {
//			if (e.targetTouches.length !== 1) {
//				return false; // Don't track motion when multiple touches are down in this element (that's a gesture)
//			}
		e.preventDefault();
		e.stopPropagation();
		var evtData = enviro.parseEventData(e);
		var xPos = evtData.pageX;
		var yPos = evtData.pageY;
		var xDelta = enviro.screen.x - xPos;
		var yDelta = enviro.screen.y - yPos;
		if (Math.abs(xDelta) + Math.abs(yDelta) < 99) { // <- should hopefully prevent misfiring two-finger touches
			enviroController(xDelta,yDelta);
			enviro.screen.x = xPos;
			enviro.screen.y = yPos;
		}
	};

	enviro.endFunc = function () {
		enviro.screen.removeEventListener(enviro.moveEvent, enviro.moveFunc, false); 
		enviro.screen.removeEventListener(enviro.endEvent, enviro.endFunc, false);
	};

	var panelsArray = document.querySelectorAll("#cube .scenePanel");
	var i = 0, pLnth = panelsArray.length;
	for (; i < pLnth; i++) {
		panelsArray[i].addEventListener("click", plateHandler);
	}  

	enableTiltDrag();

}

function enableTiltDrag () {
	if (window.DeviceMotionEvent) {
		harmonizeForAccel();
	} else {
		enviro.screen.addEventListener(enviro.startEvent, enviro.startFunc, false);
	}
}

function disableTiltDrag () {
	if (window.DeviceMotionEvent) {
		window.removeEventListener('deviceorientation', deviceOrientationHandler, false);
	}
	enviro.screen.removeEventListener(enviro.startEvent, enviro.startFunc, false);
	enviro.screen.removeEventListener(enviro.moveEvent, enviro.moveFunc, false); 
	enviro.screen.removeEventListener(enviro.endEvent, enviro.endFunc, false);
}

function deviceOrientationHandler (eventData) {
	var LR = eventData.gamma;
	var FB = eventData.beta;
	var DIR = eventData.alpha;
	enviro.gyrotation = -1*DIR*Math.PI/180;
	enviro.adjustedTilt = -1*LR*Math.PI/180 - 1.57079633;
	doTurn();
	var radianDeltaLR = enviro.dragplate.gyrotilt - enviro.adjustedTilt;
	if(tiltFilter(radianDeltaLR)) { 
		enviro.dragplate.gyrotilt -= radianDeltaLR;
		doTilt();
	}
}

function enviroController (x,y) {
	var radianDeltaX = Math.atan(x/(enviro.radius*enviro.dragplate.scale));
	var radianDeltaY = Math.atan(y/(enviro.radius*enviro.dragplate.scale));
	enviro.rotation = enviro.rotation + radianDeltaX;
	doTurn();
	if(tiltFilter(radianDeltaY)) { 
		enviro.dragplate.tilt -= radianDeltaY;
		doTilt();
	}
}

function tiltFilter (arcDelta) {
	arcDelta = arcDelta || 0;
	var tiltSum = enviro.dragplate.tilt + enviro.dragplate.gyrotilt - arcDelta;
	if (tiltSum > enviro.viewBottom && tiltSum < enviro.viewTop) {
		return true;		
	} else {
		return false;
	}
}

function harmonizeForAccel () {
	window.addEventListener('deviceorientation', harmonizeAccelEvents, false);
}

function harmonizeAccelEvents (eventData) {
	var LR = eventData.gamma;
	enviro.adjustedTilt = -1*LR*Math.PI/180 - 1.57079633;
	enviro.dragplate.tilt = -1*enviro.adjustedTilt;
	enviro.dragplate.gyrotilt = enviro.adjustedTilt;

	window.removeEventListener('deviceorientation', harmonizeAccelEvents, false);

	window.addEventListener('deviceorientation', deviceOrientationHandler, false);
	enviro.screen.addEventListener(enviro.startEvent, enviro.startFunc, false);
	enviro.screen.addEventListener("gesturestart", enviro.endFunc, false);// <- This might reduce flickering during two-finger operations.
}

function doTilt () {
// 	var deg10 = 0.174532925;
// 	var deg15 = 0.261799388;
// 	var deg30 = 0.523598776;
// 	var deg45 = 0.785398163;
// 	var deg60 = 1.04719755;
	var tiltSum = enviro.dragplate.tilt + enviro.dragplate.gyrotilt;
	enviro.dragplate.style.webkitTransform = "scale(" + enviro.dragplate.scale + ") rotateX("+ tiltSum + "rad) translateY(" + Math.sin(tiltSum)*enviro.radius + "px) translateZ(" + (Math.cos(tiltSum)*enviro.radius - enviro.radius) + "px)";	
	enviro.todoplate.style.webkitTransform = "scale(" + enviro.dragplate.scale + ") rotateX("+ tiltSum + "rad) translateY(" + Math.sin(tiltSum)*enviro.radius + "px) translateZ(" + (Math.cos(tiltSum)*enviro.radius - enviro.radius) + "px)";
}

function doTurn () {
	var turnSum = enviro.rotation + enviro.gyrotation;
	enviro.cube.style.webkitTransform = "translateX(" + -1*Math.sin(turnSum)*enviro.radius + "px) translateZ(" + (enviro.radius - Math.cos(turnSum)*enviro.radius) + "px) rotateY("+ turnSum + "rad)";
}

function enablePinchRotate () {
	if (window.DeviceMotionEvent) {
		enviro.screen.addEventListener("gesturechange", touchGesture, false);
	} else {
		document.addEventListener("keydown", keyHandler, false);
	} 
}

function disablePinchRotate () {
	if (window.DeviceMotionEvent) {
		enviro.screen.removeEventListener("gesturechange", touchGesture, false);
	} else {
		document.removeEventListener("keydown", keyHandler, false);
	}
}

function touchGesture (event) {
	event.stopPropagation(); // <- this might reduce flickering on two-finger events
	if (event.scale < 0.75) { // pinch, pull out
		if (hasClass(enviro.screen, "nexusState-active")) { suspendNexus(); } else { restoreNexus(); }
	} else if (event.scale > 1.25) { // zoom, dive in
		if (hasClass(enviro.screen, "nexusState-active")) { suspendNexus(); } else { restoreNexus(); }
	}
}

function keyHandler (event) {
	if (event.keyCode === 32) { 
		if (hasClass(enviro.screen, "nexusState-active")) { suspendNexus(); } else { restoreNexus(); }
	} 
}

function deTilt(scale) {
	scale = scale || enviro.dragplate.scale;
	enviro.dragplate.style.webkitTransitionDuration = ".333s";
	enviro.dragplate.style.webkitTransform = "scale(" + scale + ")";
	disableTiltDrag();
	enviro.dragplate.tilt = 0; // During the scale, we also reset the tilt back to zero.
//	hideHUD("down");
	setTimeout(function () { 
		enviro.dragplate.style.webkitTransitionDuration = "0s";
	}, 666);
}

function reTilt() {
	enviro.dragplate.style.webkitTransitionDuration = ".333s";
	enviro.dragplate.style.webkitTransform = "scale(" + enviro.dragplate.scale +")";
//	doTilt(); // Since the transitionDuration is still in effect, this will animate back to the accelerometer-tilted position.
	setTimeout(function () { 
		enviro.dragplate.style.webkitTransitionDuration = "0s";
		enableTiltDrag();
	}, 333);
}

function showTray() {
	addClass(enviro.tray,"active");
}

function hideTray() {
	removeClass(enviro.tray,"active");
}

