var broadcastCustomEvent, carouselController, navController, boxController;

function broadcastCustomEvent(theEvent, theElement) {
  var e = document.createEvent("Events");
  e.initEvent(theEvent, true, true);
  theElement.dispatchEvent(e);
}

function enviroController (envObj, enviroConfig) {
  var self = this;
  self.element = envObj;
  self.scrollWindow = (typeof enviroConfig.boundingBox != "undefined") ? this.element.parentNode.parentNode.parentNode.querySelector(enviroConfig.boundingBox) : this.element.parentNode.parentNode;
  self.env = new boxController(navObj, navConfig);
  self.env.element.addEventListener('boxstop', function(e){ self.storePosition(); }, true);
//  self.env.element.addEventListener("orientationchange", function(e){ self.nav.initDimensions(self.nav); }, true);
  
}

enviroController.prototype = {    
  storePosition: function() {
    if (this.env.xData.draggable) {
      localStorage["dmmobile-NavPositionX"] = this.nav.getX();
    }   
    if (this.env.yData.draggable) {
      localStorage["dmmobile-NavPositionY"] = this.nav.getY();
    }   
  }
}

function boxController(boxObj, boxConfig) {
  var self = this;
  this.config = boxConfig;
  this.element = boxObj;
  this.clickhold = (boxConfig.clickhold) ? true : false;
  this.inertial = (boxConfig.inertia === false) ? false : true;
  this.containerOffsetPercent = (typeof boxConfig.boundingOffset != "undefined") ? boxConfig.boundingOffset : 0;
  this.unitOffsetPercent = (typeof boxConfig.unitOffset != "undefined") ? boxConfig.unitOffset : 0;
  this.scrollCycleTime = 0.1; /* <- this the setInterval value used for inertial scrolling */
  var subUnits = this.element.querySelectorAll(boxConfig.subUnits);
  this.subUnits = [].filter.call(subUnits, function(node){ return node.style ? node.style.display !== 'none' : false; });
  // Remove from the nodelist any elements that are set to display: none, since their presence will screw up the calculations.
  this.friction = 20 * this.scrollCycleTime; 
  this.flipping = (boxConfig.flipping) ? true : false;
  this.snapIndex = 0;
  this.snapped = false;
  this.tapped = false;
  this.posXY('0,0');
  this.listenerMoveCounter = 0;
  this.initDimensions(self);
  this.element.addEventListener("orientationchange", function(e){ self.initDimensions(self); }, true);

  self._touchStart = function (e) {
    self.onTouchStart(e);
  };

  if (self.xData.draggable || self.yData.draggable) {
    self.element.addEventListener('touchstart', self._touchStart, true);
  }

  if (this.clickhold) {
    this.element.addEventListener('touchstart', function (e) { return self.startHold(e); }, true);
  }

}

boxController.prototype = {

  initDimensions: function (self) {
    self.containerWidth = (typeof self.config.boundingBox != "undefined") ? self.element.parentNode.parentNode.parentNode.querySelector(self.config.boundingBox).offsetWidth : self.element.parentNode.offsetWidth;
    self.containerHeight = (typeof self.config.boundingBox != "undefined") ? self.element.parentNode.parentNode.parentNode.querySelector(self.config.boundingBox).offsetHeight : self.element.parentNode.offsetHeight;
    self.width = self.element.offsetWidth;
    self.height = self.element.offsetHeight;
  
    self.xData = {
      draggable: (self.config.dragX === false) ? false : true,
      dragMin: (self.width > self.containerWidth) ? self.containerWidth - self.width : 0,
      dragMax: 0,
      dragWindowSpan: self.containerWidth,
      snapping: (self.config.snappingX && self.width > self.containerWidth) ? true : false
    };
  
    if (self.xData.snapping) {
      self.xData.snapUnits = self.subUnits;
      self.xData.dragMin = (self.width > self.containerWidth) ? self.containerWidth - self.width - ((self.xData.dragWindowSpan * self.containerOffsetPercent) - (self.xData.snapUnits[self.xData.snapUnits.length-1].offsetWidth * self.unitOffsetPercent)) : 0;
      self.xData.dragMax = ((self.xData.dragWindowSpan * self.containerOffsetPercent) - (self.xData.snapUnits[0].offsetWidth * self.unitOffsetPercent));
      self.forceSnap(self.xData, self.snapIndex);
    }

  
    self.yData = {
      draggable: (self.config.dragY === false) ? false : true,
      dragMin: (self.height > self.containerHeight) ? self.containerHeight - self.height : 0,
      dragMax: 0,
      dragWindowSpan: self.containerHeight,
      snapping: (self.config.snappingY && self.height > self.containerHeight) ? true : false
    };
  
    if (self.yData.snapping) {
      self.yData.snapUnits = self.subUnits;
      self.yData.dragMin = (self.width > self.containerHeight) ? self.containerHeight - self.width - ((self.yData.dragWindowSpan * self.containerOffsetPercent) - (self.yData.snapUnits[self.yData.snapUnits.length-1].offsetHeight * self.unitOffsetPercent)) : 0;
      self.yData.dragMax = ((self.yData.dragWindowSpan * self.containerOffsetPercent) - (self.yData.snapUnits[0].offsetHeight * self.unitOffsetPercent));
      self.forceSnap(self.yData, self.snapIndex);
    }
      
  },
  
  posXY: function(pos) {
    this._position = pos;
    var components = pos.split(',');

    var x = components[0];
    var y = components[1];
    this.element.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';
  },
  
 rotXY: function(pos) {
    this._position = pos;
    var components = pos.split(',');

    var x = components[0];
    var y = components[1];
    
    angle = Math.atan(x/240);
		document.getElementById("cube").style.webkitTransform = "rotateY("+ -1*angle + "deg)";
  },
  
  setX: function(xPos) {
    var comps = this._position.split(',');
    comps[0] = xPos;
    this.rotXY(comps.join(','));
  },
  
  setY: function(yPos) {
    var comps = this._position.split(',');
    comps[1] = yPos;
    this.rotXY(comps.join(','));
  },
  
  getX: function() {
    return parseInt(this._position.split(',')[0], 10);
  },
  
  getY: function() {
    return parseInt(this._position.split(',')[1], 10);
  },
  
  onTouchStart: function (e) {

    if (e.targetTouches.length !== 1) {
      return false;
    }
    
    this.stopScrolling();

    var self = this;
    this._touchMove = function (e) {
      self.onTouchMove(e);
    };
    this._touchEnd = function (e) {
      self.onTouchEnd(e);
    };

    this.startX = e.targetTouches[0].clientX;
    this.startY = e.targetTouches[0].clientY;
    this.virtualX = this.getX(); /* <- store the x position in a buffer */
    this.virtualY = this.getY(); /* <- store the y position in a buffer */

    this.element.addEventListener('touchmove', self._touchMove, true);
    this.element.addEventListener('touchend', self._touchEnd, true);

  this.listenerMoveCounter++;

    broadcastCustomEvent("boxtouchstart", this.element);
    broadcastCustomEvent("unsnap", this.element);

    this.tapped = true;
    return false; 
  },

  onTouchMove: function (e) {
    // Don't track motion when multiple touches are down in this element (that's a gesture)
    if (e.targetTouches.length != 1) {
      return false;
    }

    var leftDelta = (e.targetTouches[0].clientX - this.startX);
    var topDelta = (e.targetTouches[0].clientY - this.startY);
    
    if (this.xData.draggable) {
      var newLeft = (this.virtualX) + leftDelta;
      this.virtualX = newLeft;
      if (this.inertial || (this.xData.dragMin <= this.virtualX && this.virtualX <= this.xData.dragMax)) {
        this.setX(this.virtualX);
      }
      this.startX = e.targetTouches[0].clientX;
      this.xData.velocity = leftDelta;
    }

    if (this.yData.draggable) {
      var newTop = (this.virtualY) + topDelta;
      this.virtualY = newTop;
      if (this.inertial || (this.yData.dragMin <= this.virtualY && this.virtualY <= this.yData.dragMax)) {
        this.setY(this.virtualY);
      }
      this.startY = e.targetTouches[0].clientY;
      this.yData.velocity = topDelta;
    }

      /* This allows (or rather, declines to prevent) default window dragging within a Box if and only if the user is primarily dragging in a "disallowed" direction. */
      if ((!(this.xData.draggable) && Math.abs(leftDelta) < Math.abs(topDelta)) || (!(this.yData.draggable) && Math.abs(topDelta) < Math.abs(leftDelta))) {
        e.preventDefault();
        e.stopPropagation();
      }

    this.snapped = false;
    this.tapped = false;
    broadcastCustomEvent("boxmove", this.element);

    return false;
  },

  onTouchEnd: function (e) {
    var self = this;

    e.preventDefault();
    if (e.targetTouches.length > 0) {
      return false;
    }

    if (this.inertial) {
      this.switchToInertia();
    }

    this.element.removeEventListener('touchmove', self._touchMove, true);
    this.element.removeEventListener('touchend', self._touchEnd, true);

  this.listenerMoveCounter--;

    return false;
  },

  switchToInertia: function () {
    var self = this;
    this.xData.pos = this.getX();
    this.yData.pos = this.getY();
    this.animationtimer = setInterval(function () {
      self.updateBoxPosition();
    }, self.scrollCycleTime);
 },

  updateBoxPosition: function () {
  
   broadcastCustomEvent("boxmove", this.element);

   if (this.xData.draggable) {
      this.xData.pos = this.getX();
      this.xData.velocity = this.applyFriction(this.xData);
      this.setX(Math.round(this.xData.pos + this.xData.velocity + this.calcVelocityForce(this.xData)));
    }

    if (this.yData.draggable) {
      this.yData.pos = this.getY();
      this.yData.velocity = this.applyFriction(this.yData);
      this.setY(Math.round(this.yData.pos + this.yData.velocity + this.calcVelocityForce(this.yData)));
    }

    if (this.checkStopStatus(this.xData) && this.checkStopStatus(this.yData)) {
      var snapIndex;
      broadcastCustomEvent("boxstop", this.element);
      if (this.xData.snapping) {
        snapIndex = this.calcClosestSnapIndex(this.xData, this.getX());
        this.forceSnap(this.xData, snapIndex);
      } else if (this.yData.snapping) {
        snapIndex = this.calcClosestSnapIndex(this.yData, this.getY());
        this.forceSnap(this.yData, snapIndex);
      }
      this.stopScrolling();
    }

  },

  forceSnap: function(vector, snapIndex) {

//var nearestIndex = this.snapIndex;

    if (this.xData.snapping) {
      this.setX(-1*(this.getSnapUnitOffset(snapIndex)));
    } else if (this.yData.snapping) {
      this.setY(-1*(this.getSnapUnitOffset(snapIndex)));
    }

    this.snapIndex = snapIndex;
    this.snapped = true;
    broadcastCustomEvent("boxsnap", this.element);
  },

  applyFriction: function (vector) {
    var vPosNeg = (vector.velocity < 0) ? -1 : 1, theVelocity, newVelocity;
    if (vector.pos < vector.dragMin || vector.pos > vector.dragMax) { 
      theVelocity = this.capVelocity(vector.velocity); // <- Check to see if the box is out of bounds; if so, cap its velocity.
    } else if (vector.snapping) {
      theVelocity = this.capVelocity(vector.velocity); 
//      theVelocity = 0;
    } else {
      theVelocity = vector.velocity;
    }

    newVelocity = (Math.abs(theVelocity) >= this.friction) ? (theVelocity - vPosNeg * this.friction) : 0; // <- keep reducing the velocity by the friction each cycle, until it gets close to 0.
    return newVelocity;
  },
    
  checkStopStatus: function (vector) {  
    if ((Math.abs(this.calcVelocityForce(vector)) < this.friction && (Math.abs(vector.velocity) < 1)) || vector.draggable === false) {
      return true;
    } else {
      return false;
    }
  },

  stopScrolling: function () {
    clearInterval(this.animationtimer);
    this.animationtimer = null;
  },

  capVelocity: function (velocity) {
    var vPosNeg = (velocity !== 0) ? Math.abs(velocity) / (velocity) : 1;
    if (Math.abs(velocity) > this.friction / this.scrollCycleTime) {
      velocity = vPosNeg * this.friction / this.scrollCycleTime;
    }
    return velocity;
  },

  getSnapUnitOffset: function (num) {
    var theOffset;
    if (this.xData.snapping) {
      theOffset = this.xData.snapUnits[num].offsetLeft;
    } else if (this.yData.snapping) {
      theOffset = this.yData.snapUnits[num].offsetTop;
    } else {
      theOffset = (this.xData.snapUnits[num].offsetLeft +  this.yData.snapUnits[num].offsetTop) / 2;
      // Note: If snapping is off, this function should not be called.
    }
    return theOffset;
  },

  getSnapUnitSpan: function (num) {
    var theSpan;
    if (this.xData.snapping) {
      theSpan = this.xData.snapUnits[num].offsetWidth;
    } else if (this.yData.snapping) {
      theSpan = this.yData.snapUnits[num].offsetHeight;
    } else {
      theSpan = (this.xData.snapUnits[num].offsetWidth +  this.yData.snapUnits[num].offsetHeight) / 2;
      // Note: If snapping is off, this function should not be called.
    }
    return theSpan;
  },

  calcStopPoint: function(vector) {
    var theVel = vector.velocity;
    var vPosNeg = (theVel < 0) ? -1 : 1;
    var calcPos = vector.pos;
    var cappedPos;
    while (Math.abs(theVel) > this.friction) { // calculate where the box is going to come to rest
      theVel -= vPosNeg * this.friction;
      calcPos += theVel;
    }
    if (calcPos < vector.dragMin) { // make sure the snap node isn't beyond the draggable boundaries
      cappedPos = vector.dragMin;
    } else if (calcPos > vector.dragMax) {
      cappedPos = vector.dragMax;
    } else {
      cappedPos = calcPos;
    }
    return cappedPos;
  },

  calcClosestSnapIndex: function(vector, position) {
    var i = 0, j = vector.snapUnits.length-1, distanceToThisIndex, distanceToNextIndex, thisSpanHalf, targetSnapIndex;
    for (; i < j; i++) {
      distanceToThisIndex = Math.abs(position + this.getSnapUnitOffset(i));
      distanceToNextIndex = Math.abs(position + this.getSnapUnitOffset(i+1));
      thisSpanHalf = this.getSnapUnitSpan(i) / 2;
      if (distanceToThisIndex < thisSpanHalf) {
        targetSnapIndex = i;
        break;
      } else if (distanceToNextIndex < thisSpanHalf) {
        targetSnapIndex = i+1;
        break;
      }
    }
    return targetSnapIndex;
  },

  calcSnapDistance: function (vector) {
    var stopPoint = this.calcStopPoint(vector);
    var oldSnapIndex = this.snapIndex;
    var targetSnapIndex = this.calcClosestSnapIndex(vector, stopPoint);
    var spanToTravel = -1*(this.getSnapUnitOffset(targetSnapIndex)) - stopPoint;
  
    if (this.flipping) {
      if (targetSnapIndex < oldSnapIndex) {
        targetSnapIndex = (oldSnapIndex-1);
      } else if (targetSnapIndex > oldSnapIndex) {
        targetSnapIndex = (oldSnapIndex+1);
      } else if (Math.abs(spanToTravel) > vector.dragWindowSpan*0.1) {
        if (spanToTravel < 0 && oldSnapIndex > 0) {
          targetSnapIndex = (oldSnapIndex-1);
        } else if (spanToTravel > 0 && oldSnapIndex < vector.snapUnits.length - 1) {
          targetSnapIndex = (oldSnapIndex+1);
        }
      }
    }

    var targetNode = -1*(this.getSnapUnitOffset(targetSnapIndex));

   return targetNode;
  },

  calcVelocityForce: function (vector) {
  	var vectorForce;
    if (vector.pos < vector.dragMin) {
//      vector.target = vector.dragMin;
      vectorForce = this.calcCounterForce(vector,vector.dragMin);
    } else if (vector.pos > vector.dragMax) {
//      vector.target = vector.dragMax;
      vectorForce = this.calcCounterForce(vector,vector.dragMax);
    } else if (vector.snapping) {
      vectorForce = this.calcCounterForce(vector,this.calcSnapDistance(vector));
    } else {
      vectorForce = 0;
    }   
    return vectorForce;
  },

  calcCounterForce: function (vector, target) {
    var theForce = (target - vector.pos) * this.scrollCycleTime * this.friction;
/*    
    if (theForce > 0 && theForce < Math.max(this.friction, 1)) {
      theForce = Math.max(this.friction, 1)
    };
    if (theForce < 0 && theForce > Math.min(-1 * this.friction, -1)) {
      theForce = Math.min(-1 * this.friction, -1)
    };
*/
    return theForce;
  },
    
  startHold: function () {
    var self = this;
    this.holdBuffer = setTimeout(function () {
      self.showHold();
    }, 500);

    this.element.addEventListener('boxmove', self.stopHold, true);
    this.element.addEventListener('boxtouchend', self.stopHold, true);
  },
  
  showHold: function () {
  },

  stopHold: function () {
    clearTimeout(this.holdBuffer);
  }

};

window.addEventListener('DOMContentLoaded', function(){
  var env = document.querySelector('header .touchNav');
	new enviroController(env, {
		dragX: nav.getAttribute('data-drag-x') == 'false' ? false : true,
		dragY: nav.getAttribute('data-drag-y') == 'true' ? true : false,
		boundingBox: nav.getAttribute('data-bounding-box') || 'nav'
	});
}, true);


