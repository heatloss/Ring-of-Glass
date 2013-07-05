/*global gamedata, enviro, isLocked, initConversation, isNodeList, closestIndex */

function initGame() {
	var startTimer;
	if (!window.DeviceMotionEvent) {
		// rewrite helpscreens
		document.querySelector("code.invokeNexus p:first-of-type").innerHTML = "To launch and enter the Nexus environment, perform a &#8220;push&#8221; motion using your DataGlove or your keyboard&#8217;s space bar.";
		var help2 = document.querySelector("code.dismissNexus p:first-of-type").innerHTML = "To exit the Nexus and return to your original context, perform a &#8220;push&#8221; motion using your DataGlove or your keyboard&#8217;s space bar.";
		document.querySelector("code.invokeNexus pre.instructional").innerHTML = " >>> PUSH / SPACE <<< ";
		document.querySelector("code.dismissNexus pre.instructional").innerHTML = " >>> PUSH / SPACE <<< ";
	}
	if (isLocked("seePoliceStation")) {
		addClass(document.getElementById("gameWindow"), "blind");
		//			startTimer = setTimeout(startTheGame, 3000);
		gamedata.window.addEventListener("click", startTheGame);
	}
	function startTheGame() {
		clearTimeout(startTimer);
		gamedata.window.removeEventListener("click", startTheGame);
		var thePoster = document.getElementById('poster');
		if (thePoster !== null) { 
			gamedata.window.removeChild(thePoster); 
		}
		initConversation("intro");
	}
}


function triggerEvent(theEvent, theElement) {
	var e = document.createEvent("Events");
	var element = theElement || gamedata.window;
	e.initEvent(theEvent, true, true);
	element.dispatchEvent(e);
}

function addClass(ele, cls) {
	if (typeof ele !== 'undefined' && ele !== null) {
		ele.classList.add(cls);
	}
}

function removeClass(ele, cls) {
	if (typeof ele !== 'undefined' && ele !== null) {
		if (isNodeList(ele)) {
			var i = 0,
				nlnth = ele.length;
			for (; i < nlnth; i++) {
				ele[i].classList.remove(cls);
			}
		} else {
			ele.classList.remove(cls);
		}
	}
}

function hasClass(ele, cls) {
	if (typeof ele !== 'undefined' && ele !== null) {
		var r = new RegExp('\b' + cls + '\b');
		return r.test(ele.className);
	} else {
		return false;
	}
}

function singleUseListener(evt, func) {
	gamedata.eventregistry[evt] = function() {
		func();
		gamedata.window.removeEventListener(evt, gamedata.eventregistry[evt]);
	};
	gamedata.window.addEventListener(evt, gamedata.eventregistry[evt]);
}

/*
function hitch (scope, fn) { // Hitch allows you to attach the scope at bind time rather than at execution time.
	return function(){
		return fn.apply(scope, arguments);
	};
}
*/

function matrixToArray(matrix) {
	return matrix.substr(7, matrix.length - 8).split(', ');
}

function getClosestIndex(num, ar) {
	var i = 0,
		closest, closestDiff, currentDiff;
	if (ar.length) {
		closest = ar[0];
		closestIndex = 0;
		for (i; i < ar.length; i++) {
			closestDiff = Math.abs(num - closest);
			currentDiff = Math.abs(num - ar[i]);
			if (currentDiff < closestDiff) {
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

function showAddToHome() {
	var addMe = document.createElement('div');
	addMe.setAttribute('id', 'addToHomeScreen');
	addMe.innerHTML = 'The <strong>Ring of Glass</strong> demo is designed to be played in full-screen mode. Please tap <span class="addToHomeShare"></span>, select <strong>Add to Home Screen</strong>, then launch the game via its icon on the home screen.<span class="addToHomeArrow"></span>';
	addClass(addMe, 'addToHomeIphone');
	enviro.screen.appendChild(addMe);
	//	$("#screenWindow").append('<div id="addToHomeScreen" class="addToHomeIphone">The <strong>Ring of Glass</strong> demo is designed to be played in full-screen mode. Please tap <span class="addToHomeShare"></span>, select <strong>Add to Home Screen</strong>, then launch the game via its icon on the home screen.<span class="addToHomeArrow"></span></div>');
}

window.addEventListener('DOMContentLoaded', initGame, true);
