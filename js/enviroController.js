/*global gamedata, singleUseListener, hasClass, addClass, removeClass, plateHandler, suspendNexus, restoreNexus, pauseNexus, unpauseNexus, enableTodos, disableTodos */

var enviro = {};

window.addEventListener('DOMContentLoaded', initEnviro, true);

function initEnviro() {
	enviro = {
		dragplate : document.getElementById("dragplate"),
		cube : document.getElementById("cube"),
		cubeprime : document.querySelector(".cube .textureset.prime"),
		cubebuffer : document.querySelector(".cube .textureset.buffer"),
		screen : document.getElementById("gameWindow"),
		environment : document.getElementById("sceneScrutiny"),
		scenePanels : document.querySelectorAll(".cube .scenePanel"),
		help : document.getElementById("helpScreen"),
		shifter : document.getElementById("contextShifter"),
		todo : document.getElementById("todoAnchor"),
		todoplate : document.getElementById("todoPlate"),
		todotext : document.querySelector("#todoPlate .todoReadout .todo"),
		visionswitcher : document.getElementById("modeSwitcher"),
		touch : false,
		radius : 480,
		rotation : 0,
		gyrotation : 0,
		viewTop : 0.523598776, // 30
		viewBottom : -0.523598776, // -30
		adjustedTilt : 0
	};
	
		enviro.dragplate.tilt = 0;
		enviro.dragplate.scale = 1;
		enviro.dragplate.gyrotilt = 0;
		enviro.dragplate.tiltSum = 0;
		enviro.screen.x = 0;
		enviro.screen.y = 0;

		if ('ontouchstart' in document.documentElement) {
		document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });
		setTimeout(function () {
			window.scrollTo(0, 1);
		}, 1000);
		
		enviro.startEvent = "touchstart";
		enviro.moveEvent = "touchmove";
		enviro.endEvent = "touchend";
		enviro.tapEvent = "touchtap";
		enviro.holdEvent = "touchhold";

		enviro.parseEventData = function(e) {
			return e.targetTouches[0];
		};
	} else {
		window.focus();
		enviro.startEvent = "mousedown";
		enviro.moveEvent = "mousemove";
		enviro.endEvent = "mouseup";
		enviro.tapEvent = "mousetap";
		enviro.holdEvent = "mousehold";

		enviro.parseEventData = function(e) {
			return e;
		};
	}
	
	enviro.startFunc = function (e) {
		if ('ontouchstart' in document.documentElement) {
			if (e.targetTouches.length !== 1) {
				return false; // Don't track motion when multiple touches are down in this element (that's a gesture)
			}
		}
		var evtData = enviro.parseEventData(e);
		enviro.screen.tapped = true;
		enviro.screen.holdTimer = setTimeout(enviro.holdFunc, 1000);
		enviro.screen.x = evtData.pageX;
		enviro.screen.y = evtData.pageY;
		enviro.screen.mousex = evtData.pageX - enviro.screen.offsetParent.offsetLeft;
		enviro.screen.mousey = evtData.pageY - enviro.screen.offsetParent.offsetTop; 
// 		enviro.screen.evtD = evtData;
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
		enviro.screen.tapped = false;
		window.clearTimeout(enviro.screen.holdTimer);
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
	  if (enviro.screen.tapped) { triggerEvent(enviro.tapEvent, enviro.screen); }
		enviro.screen.removeEventListener(enviro.moveEvent, enviro.moveFunc, false); 
		enviro.screen.removeEventListener(enviro.endEvent, enviro.endFunc, false);
		window.clearTimeout(enviro.screen.holdTimer);
	};

	enviro.holdFunc = function () {
	  triggerEvent(enviro.holdEvent, enviro.screen);
// 		if (gamedata.visionmode.state === "precinct") { switchVisionMode("holdingcell"); } else { switchVisionMode("precinct"); }
		showVisionSwitcher();
	};

	enableScenePanels();
	enableTiltDrag();

}

function enableScenePanels() {
	var i = 0, pLnth = enviro.scenePanels.length;
	for (; i < pLnth; i++) {
		enviro.scenePanels[i].addEventListener("click", plateHandler);
	}  
}

function disableScenePanels() {
	var i = 0, pLnth = enviro.scenePanels.length;
	for (; i < pLnth; i++) {
		enviro.scenePanels[i].removeEventListener("click", plateHandler);
	}  
}

function enableTiltDrag () {
	if ('ontouchstart' in document.documentElement) {
		harmonizeForAccel();
	} else {
		enviro.screen.addEventListener(enviro.startEvent, enviro.startFunc, false);
	}
}

function disableTiltDrag () {
	if ('ontouchstart' in document.documentElement) {
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
	var tiltSum = enviro.dragplate.tilt + enviro.dragplate.gyrotilt;
	enviro.dragplate.style.webkitTransform = "scale(" + enviro.dragplate.scale + ") rotateX("+ tiltSum + "rad) translateY(" + Math.sin(tiltSum)*enviro.radius + "px) translateZ(" + (Math.cos(tiltSum)*enviro.radius - enviro.radius) + "px)";	
	enviro.todoplate.style.webkitTransform = "scale(" + enviro.dragplate.scale + ") rotateX("+ tiltSum + "rad) translateY(" + Math.sin(tiltSum)*enviro.radius + "px) translateZ(" + (Math.cos(tiltSum)*enviro.radius - enviro.radius) + "px)";
}

function doTurn () {
	var turnSum = enviro.rotation + enviro.gyrotation;
	enviro.cube.style.webkitTransform = "translateX(" + -1*Math.sin(turnSum)*enviro.radius + "px) translateZ(" + (enviro.radius - Math.cos(turnSum)*enviro.radius) + "px) rotateY("+ turnSum + "rad)";
}

function enablePinchRotate () {
	if ('ontouchstart' in document.documentElement) {
		enviro.screen.addEventListener("gesturechange", touchGesture, false);
	} else {
		document.addEventListener("keydown", keyHandler, false);
	} 
}

function disablePinchRotate () {
	if ('ontouchstart' in document.documentElement) {
		enviro.screen.removeEventListener("gesturechange", touchGesture, false);
	} else {
		document.removeEventListener("keydown", keyHandler, false);
	}
}

function touchGesture (event) {
	event.stopPropagation(); // <- this might reduce flickering on two-finger events
	if (event.scale < 0.75 || event.scale > 1.25) { // pinch, pull out || push, dive in
		if (gamedata.nexus.state.active) {
			disablePinchRotate();
			suspendNexus();
			singleUseListener("nexusexited", enablePinchRotate);
		} else { 
			disablePinchRotate();
			restoreNexus(); 
			singleUseListener("nexusentered", enablePinchRotate);
		}
	}
}

function keyHandler (event) {
	if (event.keyCode === 32) { 
		if (gamedata.nexus.state.active) { suspendNexus(); } else { restoreNexus(); }
	} 
// 	if (event.keyCode === 86) { 
// 		if (gamedata.visionmode.state === "precinct") { switchVisionMode("holdingcell"); } else { switchVisionMode("precinct"); }
// 	} 
}

function deTilt(scale) {
	scale = scale || enviro.dragplate.scale;
	enviro.dragplate.style.webkitTransitionDuration = ".333s";
	enviro.dragplate.style.webkitTransform = "scale(" + scale + ")";
	enviro.dragplate.tilt = 0; // During the scale, we also reset the tilt back to zero.
	setTimeout(function () { 
		enviro.dragplate.style.webkitTransitionDuration = "0s";
	}, 666);
}

function reTilt() {
	enviro.dragplate.style.webkitTransitionDuration = ".333s";
	enviro.dragplate.style.webkitTransform = "scale(" + enviro.dragplate.scale +")";
	setTimeout(function () { 
		enviro.dragplate.style.webkitTransitionDuration = "0s";
	}, 333);
}

function pauseEnvironment() {
	addClass(enviro.environment,"paused");
	disableTiltDrag();
	disableScenePanels();
	disableTodos();
}

function unpauseEnvironment() {
	removeClass(enviro.environment,"paused");
	enableTiltDrag();
	setTimeout(enableScenePanels, 1000); // This is HORRIBLE. But I haven't found any other way of preventing clicks from propagating.
	enableTodos();
}


function addContextStack(layername) {
	var lastContextIndex = gamedata.contextStack.length - 1;
	var lastContextName = gamedata.contextStack[lastContextIndex];
	// deactivate the current topmost context
 switch (lastContextName) {
	case "enviro":
		pauseEnvironment();
		break;
	case "conversation":
		// can't pause dialog.
		break;
	case "nexus":
		pauseNexus();
		break;
	case "help":
		// dismiss help
		break;
	default:
		break;
	}
	if (layername === "conversation") {
		disablePinchRotate();
	}
	gamedata.contextStack.push(layername);
	return lastContextName;
}

function removeContextStack(layername) {
	var i = gamedata.contextStack.indexOf(layername);
	if(i !== -1) {
		gamedata.contextStack.splice(i, 1);
	}
	var lastContextIndex = gamedata.contextStack.length - 1;
	var lastContextName = gamedata.contextStack[lastContextIndex];
	// activate the new topmost context
	switch (lastContextName) {
		case "enviro":
			unpauseEnvironment();
			break;
		case "conversation":
			// can't pause dialog.
			break;
		case "nexus":
			unpauseNexus();
			break;
		case "help":
			// reactivate help
			break;
		default:
			break;
	}
	if (layername === "conversation") {
		if (gamedata.nexus.state.on) {
			enablePinchRotate();
		}
	}
	return lastContextName;
}

