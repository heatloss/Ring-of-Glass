var Carousel = function () {
  this.carousels = $(".fxCarousel");

    var self = this;
    if (this.carousels.length > 0) {
      $.each(this.carousels, function (i, val) {
        var carInstance = Object.create(self);
        carInstance.initCarousel(val);
      });
    }
  };
  
  Carousel.prototype = {
  
    initCarousel: function (carousel) {
      this.carousel = $(carousel);
      this.slides = this.carousel.children(".hedSumm.imgType-video");
      this.snaps = this.getSnapPoints(this.slides);
      this.snaps.lastIndex = this.snaps.length - 1;
      if (window.DeviceMotionEvent) {
        this.startEvent = "touchstart";
        this.moveEvent = "touchmove";
        this.endEvent = "touchend";
        this.parseEventData = function (e) {
          return e.originalEvent.targetTouches[0];
        };
      } else {
        this.startEvent = "mousedown";
        this.moveEvent = "mousemove";
        this.endEvent = "mouseup";
        this.parseEventData = function (e) {
          return e;
        };
      }
      this.drag = 0;
      this.x = 0;
      this.y = 0;
      this.previndex = 0;
      if (this.snaps.lastIndex > 0) {
        this.carousel.on(this.startEvent, $.proxy(this.startDragFunc, this));
        $(window).on("orientationchange", $.proxy(this.initSnaps, this));
        this.pageDots = document.createElement("canvas");
        $(this.pageDots).addClass("dots").insertAfter(this.carousel).wrap("<div class='fxPagination' />");
        this.updatePagination();
      }            
    },
    
    unbindCarouselDrag: function () {
      this.carousel.off(this.startEvent, $.proxy(this.startDragFunc, this));
    },

    getSnapPoints: function (obj) {
      var snapsArray = [];
      var transformArray = this.getTransformArray(obj[0]);
      obj.each(function () {
        var myWidth = $(this).position().left * -1 + parseInt(transformArray[4], 10);
        snapsArray.push(myWidth);
      });
      return snapsArray;
    },

    initSnaps: function (obj) {
      this.snaps = this.getSnapPoints(this.slides);
      this.snaps.lastIndex = this.snaps.length - 1; 
      this.snapCarousel();
    },

    startDragFunc: function (e) {
      if (window.DeviceMotionEvent) {
        if (e.originalEvent.targetTouches.length !== 1) {
          return false; // Don't track motion when multiple touches are down in this element (that's a gesture)
        }
      }
//       e.preventDefault();
//       e.stopPropagation();
      var evtData = this.parseEventData(e);
      this.x = evtData.pageX;
      this.y = evtData.pageY;
      this.carousel.primaryDir = "";
      this.carousel.on(this.moveEvent, $.proxy(this.moveDragFunc, this));
      $(window).on(this.endEvent, $.proxy(this.endDragFunc, this));
      this.carousel.addClass("dragging");
    },

    moveDragFunc: function (e) {
      if (this.carousel.primaryDir !== "y") {
        var evtData = this.parseEventData(e);
        var xPos = evtData.pageX;
        var yPos = evtData.pageY;
        var xDelta = xPos - this.x;
        var yDelta = yPos - this.y ;
        if (Math.abs(xDelta) > Math.abs(yDelta)) {
          e.preventDefault();
          e.stopPropagation();
          this.slidesController(xDelta, yDelta);
          this.x = xPos;
          this.y = yPos;
          this.carousel.primaryDir = "x";
        } else {
          this.carousel.primaryDir = "y";      
        }
      }
    },

    endDragFunc: function () {
      this.carousel.off(this.moveEvent, $.proxy(this.moveDragFunc, this));
      $(window).off(this.endEvent, $.proxy(this.endDragFunc, this));
      this.carousel.removeClass("dragging");
      this.calcSnap();
    },

    slidesController: function (x, y) {
      this.drag += x;
      this.dir = x === 0 ? 0 : x / Math.abs(x);
      this.slides.css("-webkit-transform", "translateX(" + this.drag + "px)");
    },
  
    getClosestIndex: function (num, ar) {
      var i = 0,
        closest, closestIndex, closestDiff, currentDiff;
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
    },
  
    calcSnap: function () {
      var closestIndex = this.getClosestIndex(this.drag, this.snaps);
      var snapIndex = closestIndex;
      var goalIndex = Math.min(Math.max(this.previndex - this.dir, 0), this.snaps.lastIndex);          
      if (closestIndex !== goalIndex) {
        var dragDistance = this.drag - this.snaps[this.previndex];
        var spanDistance = this.snaps[goalIndex] - this.snaps[closestIndex];
        var dragPercent = dragDistance / spanDistance;
       if (dragPercent > 0.1) {
          snapIndex = goalIndex;
        }
      }
      this.snapCarousel(snapIndex);
    },
    
    snapCarousel: function (targetIndex) {
      var snapIndex = typeof targetIndex !== "undefined" ? targetIndex : this.previndex;
      this.drag = this.snaps[snapIndex];
      this.previndex = snapIndex;
      this.slides.css("-webkit-transform", "translateX(" + this.drag + "px)");
      this.updatePagination();
    },
    
    updatePagination: function () {
      this.pageDots.setAttribute("height", this.pageDots.offsetHeight); /* <- set the canvas' height attribute to its own CSS height */
      var dotSpace = this.pageDots.height;
      var pageCount = this.snaps.length;
      var dotsContext = this.pageDots.getContext("2d");
      this.pageDots.width = pageCount * dotSpace;
      this.pageDots.style.width = this.pageDots.width + "px";
      var i = 0, j = pageCount;
      for (; i < j; i++) {
        dotsContext.beginPath();
        dotsContext.arc((i * dotSpace) + (dotSpace / 2), dotSpace / 2, dotSpace / 5, 0, Math.PI * 2, false);
        dotsContext.closePath();
        if (this.previndex === i) {
          dotsContext.fillStyle = '#666666';
        } else {
          dotsContext.fillStyle = '#b6b6b6';
        }
        dotsContext.fill();
        dotsContext.lineWidth = 3;
      }
    },
    
    getTransformArray: function (obj) {
      var transformString = $(obj).css("-webkit-transform");
      var transformArray = transformString !== "none" ? transformString.substr(7, transformString.length - 8).split(', ') : [0, 0, 0, 0, 0,0 ];
      return transformArray;
    }
    

  };

window.addEventListener('DOMContentLoaded', function () { new Carousel; });

