/*global gamedata, enviro, unbindBrowserDrag, triggerEvent, hasClass, addClass, removeClass, matrixToArray, deTilt, reTilt, singleUseListener, dragplate, bindBrowserDrag, unbindBrowserDrag, disableTiltDrag, getClosestIndex, addContextStack, removeContextStack */

var visor = {};

function initVisor() {
	visor.moder = document.getElementById("modeSwitcher");
	visor.modeList = visor.moder.querySelector("ul.modes");
	visor.modeListModes = visor.modeList.querySelectorAll("li");
	visor.moder.x = 0;
	visor.moder.y = 0;
	visor.moder.z = 0;

// 	visor.modeList.snaps = [0, -524];
	visor.modeList.x = 0;
	visor.modeList.y = 0;
	visor.modeList.z = 0;

	visor.moveVisorFunc = function(e) {
		e.preventDefault();
		e.stopPropagation();
		var evtData = enviro.parseEventData(e);
		var xPos = evtData.pageX;
		var yPos = evtData.pageY;
		var xDelta = enviro.screen.x - xPos;
		var yDelta = enviro.screen.y - yPos;
		visorController(xDelta, yDelta);
		enviro.screen.x = xPos;
		enviro.screen.y = yPos;
	};

	visor.endVisorFunc = function() {
		enviro.screen.removeEventListener(enviro.moveEvent, visor.moveVisorFunc, false);
		enviro.screen.removeEventListener(enviro.endEvent, visor.endVisorFunc, false);
		snapVisionMode();
		hideVisionSwitcher();
	};

	function visorController(x, y) {
		visor.modeList.y -= y;
	// 	highlightVisionMode();
		adjustVisionList();
	}
	
}

function getModeSpans() {
	var i = 0,
		j = visor.modeListModes.length,
		spans = [];
	for (; i < j; i++) {
			spans[i] = visor.modeListModes[i].offsetTop || 0; 
			if (hasClass(visor.modeListModes[i], "disabled")) { spans[i] = 9999; } // THIS HACK WILL NOT STAND 
	}
	return spans;
}

function showVisionSwitcher() {
	addClass(enviro.screen, "visionSwitch");
	visor.moder.style.left = (enviro.screen.mousex -31 + "px");
	visor.moder.style.top = (enviro.screen.mousey -16 + "px");
	removeClass(visor.moder, "inactive");
	addContextStack("visor");
	triggerEvent("showvisionswitcher");
	visor.moder.x = enviro.screen.x;
	visor.moder.y = enviro.screen.y;
	enviro.screen.addEventListener(enviro.moveEvent, visor.moveVisorFunc, false);
	enviro.screen.addEventListener(enviro.endEvent, visor.endVisorFunc, false);
}

function hideVisionSwitcher() {
	var currentmode = gamedata.visor.state.visionmode;
	removeClass(enviro.screen, "visionSwitch");
	addClass(visor.moder, "inactive");
	removeContextStack("visor");
	triggerEvent("hidevisionswitcher");
}

function switchVisionMode(newmode) {
	var currentmode = gamedata.visor.state.visionmode;
// 	Initiate the vision swap animation
// 	var primeFaces = enviro.cube.querySelector(".face.prime");
// 	var bufferFaces = enviro.cube.querySelector(".face.buffer");
	addClass(enviro.cubebuffer, "transition");
	addClass(enviro.cubebuffer, newmode);
	addClass(enviro.environment, "visionIn");
	deTilt();
	enviro.cubebuffer.addEventListener("webkitAnimationEnd", startVisionSwitch);
	function startVisionSwitch() {
		enviro.cubebuffer.removeEventListener("webkitAnimationEnd", startVisionSwitch);
		addClass(enviro.cubeprime, newmode);
		removeClass(enviro.cubeprime, currentmode);
		addClass(enviro.environment,"visionOut");
		removeClass(enviro.environment,"visionIn");
		enviro.cubebuffer.addEventListener("webkitAnimationEnd", completeVisionSwitch);
	}
	function completeVisionSwitch() {
		enviro.cubebuffer.removeEventListener("webkitAnimationEnd", completeVisionSwitch);
		removeClass(enviro.environment,"visionOut");
		removeClass(enviro.cubebuffer, newmode);
		removeClass(enviro.cubebuffer, "transition");
		gamedata.visor.state.visionmode = newmode;
	}
}

function adjustVisionList() {
	visor.modeList.style.webkitTransform = "translateY(" + visor.modeList.y + "px)";
}

function snapVisionMode() {
	var vSpans = getModeSpans()
	var nearestModeIndex = getClosestIndex(-1 * visor.modeList.y, vSpans);
	console.log(vSpans[nearestModeIndex]);
	if (nearestModeIndex !== gamedata.visor.state.activemodeindex) {
		gamedata.visor.state.activemodeindex = nearestModeIndex;
	}
	visor.modeList.y = -1 * vSpans[nearestModeIndex];
	adjustVisionList();
}

