var nexus = {};

function initNexus() {
  //	var nexus = document.getElementById("activeNode");
  nexus.map = document.getElementById("nexusmap");
  nexus.node = document.getElementById("activeNode");
  nexus.browser = nexus.map.querySelector(".nexusbrowser");
  nexus.browsercontent = nexus.browser.querySelector(".browsercontent");
  nexus.browserplate = document.getElementById("browserPlate");
  nexus.stack = nexus.map.querySelector(".serverStack");
  nexus.spindle = nexus.stack.querySelector(".servers");
  nexus.spindleplate = document.getElementById("spindlePlate");
  nexus.activering = nexus.stack.querySelector(".activering");
  nexus.serverList = nexus.spindle.querySelectorAll("li");
  nexus.browserList = nexus.browser.querySelectorAll(".browsercopy > li");
  nexus.serverTitleList = nexus.spindle.querySelectorAll("li > p");
  //  nexus.scrollPage = document.querySelector(".scrollable");
  nexus.serverSpans = [];
  nexus.spindle.x = 0;
  nexus.spindle.y = 0;
  nexus.spindle.z = 0;

  gamedata.nexus.state.activeservertitle = getBrowserTitle();
  gamedata.nexus.state.ringdata = gamedata.nexus.rings[gamedata.nexus.state.selectedring]; // This is a convenience cache of the selected ring's data.
  nexus.startSpindleFunc = function(e) {
    if (window.DeviceMotionEvent) {
      if (e.targetTouches.length !== 1) {
        return false; // Don't track motion when multiple touches are down in this element (that's a gesture)
      }
    }
    var evtData = enviro.parseEventData(e);
    nexus.spindle.x = evtData.pageX;
    nexus.spindle.y = evtData.pageY;
    nexus.spindleplate.addEventListener(enviro.moveEvent, nexus.moveSpindleFunc, false);
    nexus.spindleplate.addEventListener(enviro.endEvent, nexus.endSpindleFunc, false);
    nexus.spindleplate.tapped = true;
    // 		if (!(gamedata.nexus.state.last === "browser")) {
    // 			removeClass(nexus.browser, "active");
    // 		}
  };

  nexus.moveSpindleFunc = function(e) {
    e.preventDefault();
    e.stopPropagation();
    var evtData = enviro.parseEventData(e);
    var xPos = evtData.pageX;
    var yPos = evtData.pageY;
    var xDelta = nexus.spindle.x - xPos;
    var yDelta = nexus.spindle.y - yPos;
    nexusController(xDelta, yDelta);
    nexus.spindle.x = xPos;
    nexus.spindle.y = yPos;
    nexus.spindleplate.tapped = false;
  };

  nexus.endSpindleFunc = function() {
    nexus.spindleplate.removeEventListener(enviro.moveEvent, nexus.moveSpindleFunc, false);
    nexus.spindleplate.removeEventListener(enviro.endEvent, nexus.endSpindleFunc, false);
    snapServer();
    if (nexus.spindleplate.tapped) {
      triggerEvent("touchtap", nexus.spindleplate);
    }
  };
  // 	$("#nexusmap .servers > li > p").wrapInner("<span />");
}

function bindNexusDrag() {
  var i = 0,
    j = nexus.serverList.length;
  for (; i < j; i++) {
    nexus.serverSpans[i] = matrixToArray(window.getComputedStyle(nexus.serverList[i])['-webkit-transform'])[14] || 0;
  }
  nexus.spindleplate.addEventListener(enviro.startEvent, nexus.startSpindleFunc, false);
}

function unbindNexusDrag() {
  nexus.spindleplate.removeEventListener(enviro.startEvent, nexus.startSpindleFunc, false);
}

function nexusController(x, y) {
  var nexusSpaceY = y * 1.2;
  nexus.spindle.z += nexusSpaceY;
  highlightServer();
  adjustSpindle();
}

function restoreNexus() {
  enterNexus();
  triggerEvent("nexusrestoring");
  gamedata.nexus.state.active = true;
  var nexusState = gamedata.nexus.state.last || "galaxy";
  switch (nexusState) {
  case "galaxy":
    // Eventually we'll transition from the central hub to full galaxy view.
    nexus.node.addEventListener("click", enterRing);
    break;
  case "spindle":
    setTimeout(enterRing, 1333);
    break;
  case "browser":
    setTimeout(enterRing, 1333);
    setTimeout(enterBrowser, 1666);
    break;
  default:
    break;
  }
}

function suspendNexus() {
  triggerEvent("nexussuspending");
  gamedata.nexus.state.active = false;
  var nexusState = gamedata.nexus.state.last || "galaxy";
  switch (nexusState) {
  case "galaxy":
    exitNexus();
    break;
  case "ring":
    exitRing();
    setTimeout(exitNexus, 666);
    break;
  case "browser":
    exitBrowser(); // Might speed up the exiting process by not exiting the browser.
    exitRing();
    setTimeout(exitNexus, 666);
    break;
  default:
    break;
  }
}

function enterNexus() {
  if (hasClass(conversation, "active")) {
    return false;
  } // <- The invoking listener should really be suppressed when conversation is active...
  triggerEvent("nexusinvoked");
  rRad = "-1.5708rad"; // 90deg
  deTilt();
  $("#sceneScrutiny").removeClass("active").addClass("inactive"); // <- We need a global modeSwitch function...
  dragplate.style.webkitTransitionDuration = ".666s";
  dragplate.style.webkitTransform = "scale(.125)"; // rotateX(" + rRad + ") translateY(-240px) translateZ(-240px)"; 
  // enviro.shifter.style.top = "-320px";
  setTimeout(function() {
    addClass(enviro.screen, "nexusState-active");
    addClass(enviro.screen, "transitioning");
  }, 222);
  setTimeout(function() {
    removeClass(enviro.screen, "transitioning");
  }, 666);
  setTimeout(function() {
    triggerEvent("nexusentered");
  }, 1333);
}

function exitNexus() {
  triggerEvent("nexusdismissed");
  //	$("#contextShifter").off("click", "#nexusmap .nexusring", enterRing);
  addClass(enviro.screen, "transitioning");
  //	setTimeout(function () { 
  //		dragplate.style.webkitTransitionDuration = ".666s";
  //		dragplate.style.webkitTransform = "scale(1.333)"; 
  //	}, 222);
  setTimeout(function() {
    removeClass(enviro.screen, "transitioning");
    removeClass(enviro.screen, "nexusState-active");
    $("#sceneScrutiny").addClass("active").removeClass("inactive");
  }, 444);
  setTimeout(function() {
    reTilt();
    triggerEvent("nexusexited");
  }, 555);
}

function enterRing() {
  triggerEvent("ringinvoked");
  gamedata.nexus.state.last = "ring";
  nexus.node.removeEventListener("click", enterRing);
  addClass(enviro.screen, "zoomLevel-1");
  addClass(enviro.screen, "zooming");
  setTimeout(function() {
    nexus.spindle.style.webkitTransitionDuration = ".666s, .666s";
    adjustSpindle();
    addClass(enviro.screen, "serverState-expanded");
    setTimeout(function() {
      nexus.spindle.style.webkitTransitionDuration = "";
    }, 666);
  }, 111);
  setTimeout(function() {
    removeClass(enviro.screen, "zooming");
  }, 333);
  setTimeout(function() {
    bindNexusDrag();
    addClass(nexus.browser, "active");
    bindBrowserDrag();
    triggerEvent("ringentered");
  }, 999);
}

function exitRing() {
  triggerEvent("ringexited");
  if (gamedata.nexus.state.last === "browser") {
    exitBrowser();
  }
  gamedata.nexus.state.last = "galaxy";
  unbindNexusDrag();
  removeClass(nexus.browser, "active");
  unbindBrowserDrag();
  $("#contextShifter").off("click", ".nexusring .ringtitle", exitRing);
  nexus.map.style.webkitTransitionDuration = ".333s";
  removeClass(enviro.screen, "serverState-expanded");
  nexus.spindle.style.webkitTransitionDuration = ".666s, .666s";
  nexus.spindle.style.webkitTransform = "";
  setTimeout(function() {
    removeClass(enviro.screen, "zoomLevel-1");
    addClass(enviro.screen, "zooming");
    setTimeout(function() {
      removeClass(enviro.screen, "zooming");
      nexus.map.style.webkitTransitionDuration = "";
    }, 333);
  }, 222);
  setTimeout(function() {
    nexus.spindle.style.webkitTransitionDuration = "";
  }, 666);

}

function enterBrowser() {
  triggerEvent("browserinvoked");
  addClass(enviro.screen, "browserOpen");
  gamedata.nexus.state.last = "browser";
  unbindNexusDrag();
  setTimeout(function() {
    gamedata.nexus.state.last = "browser";
    gamedata.nexus.state.browserpage = getBrowserTitle();
    triggerEvent("browserentered");
    triggerEvent("browsertitle-" + gamedata.nexus.state.browserpage);
 		nexus.browser.style.webkitTransitionDuration = "";
 }, 666);
}

function exitBrowser() {
  triggerEvent("browserdismissed");
  removeClass(enviro.screen, "browserOpen");
  gamedata.nexus.state.last = "ring";
  bindNexusDrag();
  setTimeout(function() {
    triggerEvent("browserexited");
		nexus.browser.style.webkitTransitionDuration = "";
  }, 666);
}

function showHelp(name) {
  disableTiltDrag();
  addClass(enviro.screen, "helpOpen");
  addClass(enviro.help, "activeHelp-" + name);
  enviro.help.setAttribute("data-active", name);
  gamedata.nexus.help.active = true;
  triggerEvent("showhelp");
}

function hideHelp() {
  removeClass(enviro.screen, "helpOpen");
  var activeHelp = enviro.help.getAttribute("data-active");
  removeClass(enviro.help, "activeHelp-" + activeHelp);
  enviro.help.removeAttribute("data-active");
  gamedata.nexus.help.active = false;
  triggerEvent("hidehelp");
}

function showPuzzle(name) {
  puzzle.style.top = "0px";
  addClass(enviro.screen, "puzzleActive");
  setTimeout(function() {
    addClass(puzzle, "activePuzzle-" + name);
    puzzle.setAttribute("data-active", name);
    bindPageDrag("#" + name + " .puzzleRules", "#puzzleField", "#" + name);
  }, 500);
}

function hidePuzzle() {
  $(puzzle).off("click", ".puzzleUnit button[name='solve']");
  unbindPageDrag();
  var activePuzzle = puzzle.getAttribute("data-active");
  removeClass(puzzle, "activePuzzle-" + activePuzzle);
  addClass(enviro.screen, "dismiss");
  setTimeout(function() {
    removeClass(enviro.screen, "puzzleActive");
    removeClass(enviro.screen, "dismiss");
    puzzle.removeAttribute("data-active");
    puzzle.style.top = "-360px";
    scrollColumn.style.webkitTransform = "translateY(0px)";
  }, 500);
}

function highlightServer() {
  nearestServerIndex = getClosestIndex(-1 * nexus.spindle.z, nexus.serverSpans);
  var i = 0,
    j = nexus.serverList.length;
  for (; i < j; i++) {
    removeClass(nexus.serverList[i], "active");
    removeClass(nexus.browserList[i], "active");
  }
  addClass(nexus.serverList[nearestServerIndex], "active");
  addClass(nexus.browserList[nearestServerIndex], "active");
}

function snapServer() {
  nearestServerIndex = getClosestIndex(-1 * nexus.spindle.z, nexus.serverSpans);
  if (nearestServerIndex !== gamedata.nexus.state.activeserverindex) {
    gamedata.nexus.state.activeserverindex = nearestServerIndex;
    gamedata.nexus.state.browserpage = getBrowserTitle();
    if (gamedata.nexus.state.last === "browser") {
      triggerEvent("browsertitle-" + gamedata.nexus.state.browserpage);
    }
  }
  nexus.spindle.z = -1 * nexus.serverSpans[nearestServerIndex];
  adjustSpindle();
}

function adjustSpindle() {
  nexus.spindle.style.webkitTransform = "translateZ(" + nexus.spindle.z + "px)";
}

function getBrowserTitle(index) {
  var browserindex = index || gamedata.nexus.state.activeserverindex; // Allows an optional index parameter to be passed.
  var activeServerTitle = gamedata.nexus.state.ringdata.servers[browserindex];
  return activeServerTitle;
}

function makeBlind() {
	addClass(enviro.screen,"blind");
}

function makeUnblind() {
	removeClass(enviro.screen,"blind");
}

function activateHUD() {
}

function updateGoal(newmission) {
//	visorGoal.innerHTML = newmission;
}

