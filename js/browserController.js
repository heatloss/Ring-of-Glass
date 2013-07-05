/*global gamedata, enviro, nexus, bindSpindleDrag, unbindSpindleDrag, addClass, removeClass, triggerEvent, userEnterBrowser, userExitBrowser  */

function bindBrowserDrag() {
  nexus.browserplate.addEventListener(enviro.startEvent, nexus.startBrowserFunc, false);
  nexus.browserplate.addEventListener(enviro.tapEvent, toggleBrowser, false);
}

function unbindBrowserDrag() {
  nexus.browserplate.removeEventListener(enviro.startEvent, nexus.startBrowserFunc, false);
  nexus.browserplate.removeEventListener(enviro.tapEvent, toggleBrowser, false);
}

nexus.startBrowserFunc = function(e) {
  if (window.DeviceMotionEvent) {
    if (e.targetTouches.length !== 1) {
      return false; // Don't track motion when multiple touches are down in this element (that's a gesture)
    }
  }
  unbindSpindleDrag();
  var evtData = enviro.parseEventData(e);
  nexus.browser.x = evtData.pageX;
  nexus.browser.y = evtData.pageY;
  nexus.browserplate.addEventListener(enviro.moveEvent, nexus.moveBrowserFunc, false);
  window.addEventListener(enviro.endEvent, nexus.endBrowserFunc, false);
  addClass(enviro.screen, "browserdragging"); // <- Shouldn't this class be able to zero out the below durations?
  nexus.browser.tapped = true;
};

nexus.moveBrowserFunc = function(e) {
  e.preventDefault();
  e.stopPropagation();
  var evtData = enviro.parseEventData(e);
  var xPos = evtData.pageX;
  var yPos = evtData.pageY;
  var xDelta = nexus.browser.x - xPos;
  var yDelta = nexus.browser.y - yPos;
  browserController(xDelta, yDelta);
  nexus.browser.x = xPos;
  nexus.browser.y = yPos;
  nexus.browser.tapped = false;
};

nexus.endBrowserFunc = function() {
  nexus.browserplate.removeEventListener(enviro.moveEvent, nexus.moveBrowserFunc, false);
  window.removeEventListener(enviro.endEvent, nexus.endBrowserFunc, false);
  removeClass(enviro.screen, "browserdragging");
  if (nexus.browser.tapped) {
    triggerEvent("touchtap", nexus.browserplate);
  } else {
    snapBrowser();
  }
  bindSpindleDrag();
};

function browserController(x, y) {
	nexus.browser.drag = parseDrag(x, nexus.browser);
  transitionBrowser(nexus.browser);
}

function parseDrag(amt, dragObj) {
	var newDrag = Math.max(Math.min(dragObj.drag - amt, 0), dragObj.snaps[1]);
	return newDrag;
}

function transitionBrowser(dragObj) {
  var perc = Math.abs(dragObj.drag) / Math.abs(dragObj.snaps[1]);
	nexus.browser.style.webkitTransform = "rotateX(" + (-70 + 16 * perc) + "deg) rotateY(" + (24 * perc) + "deg) rotateZ(" + (-3.5 - 2.25 * perc) + "deg) translateX(" + (775 - 525 * perc) + "px) translateY(" + (80 - 80 * perc) + "px)";
	nexus.stack.style.webkitTransform = "rotateX(" + (10 * perc) + "deg) rotateY(" + (5 * perc) + "deg) rotateZ(" + (-110 * perc) + "deg) translate3d(" + (220 * perc) + "px, " + (-360 * perc) + "px, " + (-140 * perc) + "px)";
	nexus.browsercontent.style.opacity = (0.5 + 0.5 * perc);
	nexus.spindle.style.opacity = (1 - 0.75 * perc);
	nexus.activering.style.opacity = (1 - 0.75 * perc);
	for (var i = 0; i < nexus.serverTitleList.length; i++) {
		nexus.serverTitleList[i].style.opacity = (1 - perc);
	}
}

function snapBrowser() {
  var perc = Math.abs(nexus.browser.drag) / Math.abs(nexus.browser.snaps[1]);
  if (gamedata.nexus.state.last === "browser") {
    if (perc < 0.8) {
      nexus.browser.style.webkitTransitionDuration = "0.333s";
      userExitBrowser();
    } else {
      nexus.browser.style.webkitTransitionDuration = "0.1s";
      nexus.browser.drag = nexus.browser.snaps[1];
    }
  } else {
    if (perc > 0.225) {
      nexus.browser.style.webkitTransitionDuration = "0.333s";
      userEnterBrowser();
    } else {
      nexus.browser.style.webkitTransitionDuration = "0.1s";
      nexus.browser.drag = nexus.browser.snaps[0];
    }
  }
  resetNexusStyles();
}

function resetNexusStyles() {
  nexus.browser.style.webkitTransform = "";
  nexus.browsercontent.style.opacity = "";
  nexus.stack.style.webkitTransform = "";
  nexus.spindle.style.opacity = "";
  nexus.activering.style.opacity = "";
  for (var i = 0; i < nexus.serverTitleList.length; i++) {
    nexus.serverTitleList[i].style.opacity = "";
  }
}

function toggleBrowser() {
  nexus.browser.style.webkitTransitionDuration = "";
  if (gamedata.nexus.state.last === "browser") {
    userExitBrowser();
  } else {
    userEnterBrowser();
  }
}
