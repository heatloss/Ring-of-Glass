var portraitVictoria = new charPort("Victoria", 6000);
var portraitFrank = new charPort("Frank", 9000);

function charPort (charName, charBlink) {
	var self = this;
	self.$charObj = $("#conversation .charProfile." + charName);
	self.$blinkFrame = self.$charObj.find(".charOverlay");
	self.blinkInterval = charBlink;
	self.blinkDuration = 150;
}

charPort.prototype.blink = function () {
	var $bFrame = this.$blinkFrame;
	var duration = this.blinkDuration;
	this.blinkTimer = setInterval(function() {
		$bFrame.show();
		this.blinkDown = setTimeout(function(){
			$bFrame.hide();
		}, duration);
	}, this.blinkInterval);
};

charPort.prototype.blinkStop = function () {
	clearInterval(this.blinkTimer);
};

$.fn.typewrite = function ( options ) {
		var settings = {
				'selector': this,
				'extra_char': '',
				'delay':    10,
				'callback': null
		};
		if (options) { $.extend(settings, options); }

		/* This extra closure makes it so each element
		* matched by the selector runs sequentially, instead
		* of all at the same time. */
		function type_next_element(index) {
				var current_element = $(settings.selector[index]);
				var final_text = $.trim(current_element.text());
				current_element.html("").show();

				function type_next_character(element, i) {
						element.html( final_text.substr(0, i)+settings.extra_char );
						if (final_text.length >= i) {
								setTimeout(function() {
										type_next_character(element, i+1);
								}, settings.delay);
						}
						else {
								if (++index < settings.selector.length) {
										type_next_element(index);
								}
								else if (settings.callback) { settings.callback(); }
						}
				}
				type_next_character(current_element, 0);
		}
		type_next_element(0);
};

	function openDialogWindow(conv) {
		var convoToLoad = conv || $("#conversation").attr("data-convoqueue");
		$("#conversation").addClass("active transitioning");
		$("#dialog .convoThread").animate({ opacity: 1 },200, function(){ $("#conversation").removeClass("transitioning"); });
		loadDialog(convoToLoad);
		if (!$("#screenFrame").hasClass("nexusState-active")) {
			unbindTiltDrag();
			unbindPinchRotate();
			deTilt();
			$("#sceneScrutiny").removeClass("active").addClass("inactive");
				portraitFrank.blink();
		}
	}
	
	function closeDialogWindow() {
		$("#conversation").addClass("transitioning").removeClass("active");
		$(".convoThread").animate({ opacity: 0 },200, function(){ $("#conversation").removeClass("transitioning"); });
		if (!($("#screenFrame").hasClass("nexusState-active")) && !($("#screenFrame").hasClass("helpOpen"))) {
			bindTiltDrag();
			bindPinchRotate();
			reTilt();
			$("#sceneScrutiny").removeClass("inactive").addClass("active");
			portraitFrank.blinkStop();		
		}
	}
	
	function parseTree(treeObj, decisionPoint) {
		var dialogTree = treeObj.clone();
		var treeName = dialogTree.data("ident");
		dialogTree.find("li").filter(":has(ol)").each(function () {
			var listNode = $(this);
			if (listNode.hasClass("playthrough")) {
				if (listNode.data("reqplay") === playCount(treeName) + 1) {
					listNode.children().first().addClass("unwrap");
				} else {
					listNode.children(".otherwise").addClass("unwrap");
				}
				listNode.addClass("remove");
			}
			if (listNode.hasClass("read")) {
				var readReqList = listNode.attr("data-reqread");
				var readReqArray = readReqList.split(",");
				var readActual = 0;
				for (var i=0; i<readReqArray.length; i++) {
					otherTreeName = readReqArray[i];
					if (playCount(otherTreeName) > 0) {
						readActual++;
					}
				}
				if ((listNode.data("reqtype") === "or" && readActual > 0) || (listNode.data("reqtype") === "and" && readActual === readReqArray.length)) {
					listNode.children().first().addClass("unwrap");
				} else {
					listNode.children(".otherwise").addClass("unwrap");
				}
				listNode.addClass("remove");
			}
			if (listNode.hasClass("unread")) {
				var unreadReqList = listNode.attr("data-requnread");
				var unreadReqArray = unreadReqList.split(",");
				var unreadActual = 0;
				for (var i=0; i<unreadReqArray.length; i++) {
					var otherTreeName = unreadReqArray[i];
					if (playCount(otherTreeName) === 0) {
						unreadActual++;
					}
				}
				if ((listNode.data("reqtype") === "or" && unreadActual > 0) || (listNode.data("reqtype") === "and" && unreadActual === unreadReqArray.length)) {
					listNode.children().first().addClass("unwrap");
//					listNode.before(childList);
				} else {
					listNode.children(".otherwise").addClass("unwrap");
//					listNode.before(altList);
				}
				listNode.addClass("remove");				
			}
			if (listNode.hasClass("locked")) {
				if (isLocked(listNode.attr("data-reqlocked")) === true) {
					listNode.children().first().addClass("unwrap");
				} else {
					listNode.children(".otherwise").addClass("unwrap");
				}
				listNode.addClass("remove");
			}		
			if (listNode.hasClass("unlocked")) {
				if (isLocked(listNode.attr("data-requnlocked")) === false) {
					listNode.children().first().addClass("unwrap");
				} else {
					listNode.children(".otherwise").addClass("unwrap");
				}
				listNode.addClass("remove");
			}		
		});
		dialogTree.find(".remove").before(function() {
			return $(this).children(".unwrap").contents();
		});
		dialogTree.find(".remove").remove();
		if (decisionPoint !== undefined) { 
			dialogTree.find("li[data-decision='" + decisionPoint + "']").prevAll().remove(); 
		}
		var dialogLines = dialogTree.find("li");
		dialogLines.filter("[data-speaker],[data-ref]").contents().filter(function(){
			return this.nodeType === 3;
		}).filter(function(){
			return $.trim($(this).text()) !== '';
		}).wrap("<p />");
		dialogLines.filter("[data-ref]").each(function(){
			var listNode = $(this);
			var refIdent = listNode.attr("data-ref");
			if (branchDepleted(listNode)) {
				listNode.addClass("refIsRead");
			}			
		});
		dialogLines.filter(".decision").addClass("speaker-declan");
		return dialogTree;
	}		
	
	function playCount(treeName) {
		var playdata = $("#convoRepo > .root." + treeName).attr("data-playcount");
		var plays = (playdata > 0) ? playdata : 0;
		return plays;		
	}
	
	function isLocked(lockName) {
		if ($("#screenFrame").hasClass("locked-" + lockName)) {
			return true;
		} else {
			return false;
		}
	}
	
	function appendAttribute(jObj,datName,datVal) {
	
/*

var condition = document.getElementsByTagName('div')[ 0 ].getAttribute('data-condition'),
    arr = condition.split( /['"],\s?/ ),
    or_values = [];

arr.forEach( function( str ) {
    var and_values = [],
        tmp;
    str = str.replace( /(^\[|')|('|\]$)/g, '');
    
    tmp = str.split( /,\s?/ );
    
    tmp.forEach( function( str ) {
        and_values.push( str );
    } );
    
    or_values.push( and_values );
} );

console.log( or_values );
​
*/
		if(jObj.is("[data-" + datName + "]")) {
			var attrArray = jObj.attr("data-" + datName).split(",");
			attrArray.push(datVal);
			jObj.attr("data-" + datName, attrArray.join(","));
		} else {
			jObj.attr("data-" + datName, datVal);
		}
	}

	function removeLastAttribute(jObj,datName) {
		var attrArray = jObj.attr("data-" + datName).split(",");
		attrArray.pop();
		if (attrArray.length === 0) {
			jObj.removeAttr("data-" + datName);
		} else {
			jObj.attr("data-" + datName, attrArray.join(","));
		}
	}

	function returnLastAttribute(jObj,datName) {
		var attrArray = jObj.attr("data-" + datName).split(",");
		var lastIndex = attrArray.length - 1;
		return attrArray[lastIndex];
	}

	function exitDialog(currentTree) {
		var envWindow = $("#conversation, #ssEnviroWindow");
		var listenerName = envWindow.attr("data-currentlistener");
		var currentPose = envWindow.attr("data-currentpose");
		var currentPoseListener = envWindow.attr("data-currentposelistener");
		markAsRead(currentTree);
		$("#dialog").removeClass(function() {
				return "speaking-" + $(this).attr('data-currentspeaker');
			}).removeAttr('data-currentspeaker');
		envWindow.removeClass("listener-" + listenerName + " pose-" + currentPose + " poselistener-" + currentPoseListener).removeAttr("data-currentlistener data-currentpose data-currentposelistener");
		$("#dialog .convoThread").removeAttr("data-predecessor data-decision").empty();
		closeDialogWindow();
	}
		
	function decisionMode(decisionNode) {
		$("#conversation").addClass("decisionMode");
		if (decisionNode.is("[data-pose]")) {
			decisionNode.attr("data-speaker","declan"); // <- This is a bit hacky. We should probably hardcode the speaker attribute on all decision nodes.
			updatePose(decisionNode);
		}
		var prevNode = decisionNode.prev();
		if (prevNode.hasClass("decision")) { // For now, this should return true only when the user has arrived via a "return to previous" decision.
			prevNode.removeClass("active");
			var lastWords = prevNode.find("li.return p").text();
//			console.log(prevNode.find("li.return p").text());
			var thisDecision = decisionNode.attr("data-decision");
//			console.log(decisionNode.prevAll("[data-decision='" + thisDecision + "']").first().prev());
			var originalPrompt = decisionNode.prevAll("[data-decision='" + thisDecision + "']").last().prev().addClass("mark").text(); // Using last() instead of first() because prevAll() indexes backwards.
				decisionNode.before("<li class='speaker-declan reminder'><p>" + originalPrompt + "</p></li>");
		} else {
			if (decisionNode.prev().length > 0) {
				prevNode.addClass("reminder").removeClass("active");
			} else {
				decisionNode.before("<li class='speaker-none reminder'><p /></li>");
			}
		}
		decisionNode.addClass("active");
		$("#dialog").removeClass("speaking-" + $("#dialog").attr("data-currentspeaker")).addClass("speaking-declan");
	}

	function markAsRead (treeName) {
		$("#convoRepo .root." + treeName).attr("data-playcount", playCount(treeName) + 1);
//		appendAttribute($("#dialog .convoThread"),"predecessor",treeName);		
	}
	
	function loadDialog(treeName,dPoint) {
		var treeObj = $("#convoRepo .root." + treeName);
		var parsedTree = dPoint !== undefined ? parseTree(treeObj, dPoint).html() : parseTree(treeObj).html();
		var convoThread = $("#dialog .convoThread");
		convoThread.append(parsedTree).attr("data-ident", treeName);
		var resumeNode = convoThread.find("li.active").next();
		if (resumeNode.length === 0) { 
			resumeNode = $("#dialog .convoThread > li").first();
		}
		speakDialog(resumeNode);
	}
	
	function speakDialog(listObj) {
		if (listObj.hasClass("decision")) {
			decisionMode(listObj);
		} else {
			var envWindow = $("#conversation, #ssEnviroWindow");
			if (listObj.is("[data-pose]")) {
				updatePose(listObj);
			}
			if (listObj.is("[data-listener]")) {
				var currentListenerName = envWindow.attr("data-currentlistener");
				var newListenerName = listObj.attr("data-listener");
				envWindow.removeClass("listener-" + currentListenerName).addClass("listener-" + newListenerName).attr("data-currentlistener",newListenerName);
			}
			var prevSpeaker = $("#dialog").attr("data-currentspeaker");
			var thisSpeaker = listObj.attr("data-speaker");
			listObj.addClass("speaker-" + thisSpeaker);
			if (prevSpeaker !== thisSpeaker) {
				$("#dialog").addClass("speaking-" + thisSpeaker).removeClass("speaking-" + prevSpeaker).attr("data-currentspeaker",thisSpeaker);
			}
			listObj.prev().removeClass("active");
			listObj.addClass("active").find("p").typewrite();
		}
	}

	function panelOps(panel) {
		if ($("#sceneScrutiny").is(".active")) {
			if ($("#screenFrame").is(":not(.locked-seeHUD)")) {
				event.stopPropagation();
				var myConvo = panel.attr("data-convoqueue");
				openDialogWindow(myConvo);
			}
		}
	}

	function evalEvents(requestedEvent) {
		switch(requestedEvent) {
			case "seehud":
				$(frame).removeClass("locked-seeHUD");
				updateGoal("Minicomp active.");
			break;
			case "showjail":
				$(frame).removeClass("locked-seePoliceStation");
				updateGoal("Look around; figure out what's going on.");
			break;
			case "missionphonecall":
				updateGoal("Convince the guard to let you have a phone call.");
//				$("#cube div.scenePanel.frank").attr("data-convoqueue","iwantthatcall");				
			break;
			case "invokechrome":
				invokeChrome();
			break;
			case "dismisschrome":
				dismissChrome();
			break;
			case "displayhelp":
				showHelp();
			break;
			case "displayenternexushelp":
				showHelp("invokeNexus");
				bindPinchRotate();
				$("#screenFrame").one("nexusentered", function(){ 
					hideHelp();
					setTimeout(function () { 
						openDialogWindow("meetyournexus");
					}, 1333);
				});
				$("#screenFrame").on("browseractive-manuals", function(){ openDialogWindow("whichmanual"); });
			break;
			case "needmoreformanual":
				updateGoal("Gather more info about the systems in the precinct.");
				$("#cube div.scenePanel.frank").attr("data-convoqueue","notalkingwithoutreport");
			break;
			case "displayexitnexushelp":
				showHelp("dismissNexus");
				$("#screenFrame").one("nexusexited", hideHelp);
			break;
			case "deducemanual":
				showPuzzle("whichmanual");
				$(puzzle).one("click", "#whichmanual button[name='solve']", function(){ evalEvents("solvepuzzle1"); } );
			break;
			case "compilethis":
				showPuzzle("compileahack");
				$(puzzle).one("click", "#compileahack button[name='solve']", function(){ evalEvents("solvepuzzle2"); } );
			break;
			case "solvepuzzle1":
				hidePuzzle();
				$("#screenFrame").off("browseractive-manuals");
				$("#cube div.scenePanel.frank").attr("data-convoqueue","solveerror84");
				updateGoal("Help the guard reboot the print server.");
				setTimeout(function () { 
					openDialogWindow("afterpuzzle1solve");	
				}, 500);
			break;
			case "failpuzzle1":
				hidePuzzle();
				$("#cube div.scenePanel.frank").attr("data-convoqueue","failerror84");
				setTimeout(function () { 
					openDialogWindow("afterpuzzle1fail");	
				}, 500);
			break;
			case "solvepuzzle2":
				hidePuzzle();
				$("#screenFrame").off("browseractive-tools");
				$("#cube div.scenePanel.frank").attr("data-convoqueue","typethisforme");
				updateGoal("Have Frank type in your text string.");
				setTimeout(function () { 
					openDialogWindow("afterpuzzle2solve");	
				}, 500);
			break;
			case "whatsyourpassword":
				updateGoal("Figure out the guard's login and password.");
				$("#cube div.scenePanel.frank").attr("data-convoqueue","whatsyourpassword");
			break;
			case "planyourhack":
				updateGoal("Revisit the gridphone; figure out a way to hack it.");
				$("#cube div.scenePanel.phone").attr("data-convoqueue","planyourhack");
			break;
			case "timetoobfuscate":
				updateGoal("Search the Nexus for a stealthy way to reset a password.");
				$("#cube div.scenePanel.phone").attr("data-convoqueue","hackplanned");
				$("#cube div.scenePanel.frank").attr("data-convoqueue","lookingforpassword");
				$("#screenFrame").on("browseractive-tools", function(){ openDialogWindow("letsobfuscate"); });
			break;
			case "tothephone":
				updateGoal("Hack the phone; call someone who can help.");
				$("#container").fadeOut(1000, function(){ alert("To be continued..."); });
			break;
			default:
			break;
		}
	}

function updatePose (listObj) {
	var envWindow = $("#conversation, #ssEnviroWindow");
	var newPose = listObj.attr("data-pose");
	if (listObj.attr("data-speaker") === "declan") {
		var currentPose = envWindow.attr("data-currentpose") || "default";
		envWindow.removeClass("pose-" + currentPose).addClass("pose-" + newPose).attr("data-currentpose",newPose);
	} else {
		var currentLPose = envWindow.attr("data-currentposelistener") || "default";
		envWindow.removeClass("poselistener-" + currentLPose).addClass("poselistener-" + newPose).attr("data-currentposelistener",newPose);
	}
}

function returnToParentDecision () {
	var convoThread = $("#dialog .convoThread");
	var parentTree = returnLastAttribute(convoThread,"predecessor");
	var decisionPoint = returnLastAttribute(convoThread,"decision");
	removeLastAttribute(convoThread,"predecessor");
	removeLastAttribute(convoThread,"decision");
	loadDialog(parentTree,decisionPoint);
}

function updateGoal(newmission) {
	visorGoal.innerHTML = newmission;
}

function branchDepleted(listNode) {
	var refIdent = listNode.attr("data-ref");

	var childDecisionRefs = $("#convoRepo > .root." + refIdent).find("li.decision > ol > li:not(.exit, .return)");
	var decNum = childDecisionRefs.length;
	if (decNum === 0) {
		if (playCount(refIdent) > 0) {
			return true;
		} else {
			return false;
		}		
	} else {
		var readActual = 0;
		for (var i=0; i<decNum; i++) {
			var thisNode = childDecisionRefs.eq(i);
			if (thisNode.is("[data-ref]")) {
				var thisRef = thisNode.attr("data-ref");
				if (playCount(thisRef) > 0) {
					readActual++;
				}
			}
		}
		if (readActual === decNum) {
			return true;
		} else {
			return false;
		}		
		
	}

}

$(document).ready(function(){

if (!window.DeviceMotionEvent || window.navigator.standalone) {
	var startTimer;
	if ($("#screenFrame").hasClass("locked-seePoliceStation")) { 
		startTimer = setTimeout(startTheGame, 4000);
		$("#ssEnviroWindow").on("click", startTheGame);
	}
} else {
	$("#screenWindow").append('<div id="addToHomeScreen" class="addToHomeIphone">The <strong>Ring of Glass</strong> demo is designed to be played in full-screen mode. Please tap <span class="addToHomeShare"></span>, select <strong>Add to Home Screen</strong>, then launch the game via its icon on the home screen.<span class="addToHomeArrow"></span></div>')
}
//	$(".locked-seePoliceStation #ssEnviroWindow, .locked-seeHUD #ssEnviroWindow").one("click", openDialogWindow); 
	
	function startTheGame() {
		clearTimeout(startTimer);
		$("#ssEnviroWindow").off("click", startTheGame);
		openDialogWindow("intro");
	}
	
	$("#dialog").on("click", ".convoThread > li:not(.decision)", function(event){
		event.stopPropagation();
		var speechUnit = $(this);
		var nextUnit = speechUnit.next();
		var convoThread = $("#dialog .convoThread");
		var currentTree = convoThread.attr("data-ident");
		if (speechUnit.is("[data-unlock]")) {
			var unlockItem = speechUnit.attr("data-unlock");
			$("#screenFrame").removeClass("locked-"+unlockItem);
		}
		if (speechUnit.is("[data-event]")) {
			var requestedEvent = speechUnit.attr("data-event");
			evalEvents(requestedEvent);
		}
		if (speechUnit.hasClass("exit")) {
			exitDialog(currentTree);
			return false;
		}
		if (speechUnit.is(":last-child")) {
			if ($("#dialog .convoThread").is("[data-predecessor]")) {
				var parentTree = returnLastAttribute(convoThread,"predecessor");
				markAsRead(currentTree);
				if (convoThread.is("[data-decision]")) {
					returnToParentDecision();
				} else {
					loadDialog(parentTree);
				}
			} else {
				exitDialog(currentTree);
				return false;
			}
		} else {
			speakDialog(nextUnit);
		}
	});
	
	$("#dialog").on("click", ".convoThread > li.decision li", function(event){
		event.stopPropagation();
		var decisionNode = $(this);
		var decisionIdent = decisionNode.data("ref") || "";
		var convoThread = $("#dialog .convoThread");
		var treeName = convoThread.attr("data-ident");
		$("#conversation").removeClass("decisionMode");
		var decisionParent = decisionNode.closest("li.decision");
		var decisionParentIdent = decisionParent.attr("data-decision");
		decisionParent.prev().removeClass("reminder");
		if (decisionNode.is("[data-event]")) {
			var requestedEvent = decisionNode.attr("data-event");
			evalEvents(requestedEvent);
		}
		if (decisionNode.hasClass("exit")) {
			exitDialog(treeName);			
		} else if (decisionNode.hasClass("return")) {
			returnToParentDecision();			
		} else if (decisionNode.children("ol").length > 0 ) {
			decisionNode.children("ol").contents("li").insertAfter(decisionParent);
			speakDialog(decisionParent.next());
		} else {
			markAsRead(treeName);
			appendAttribute(convoThread,"predecessor",treeName);		
			appendAttribute(convoThread,"decision",decisionParentIdent);
			loadDialog(decisionIdent);
		}
	});
	
	$("#container").on("click", ".rotator > .face .scenePanel", function(){ panelOps($(this)); });

	$("#contextShifter").on("click", ".nexusmap .nexusicon", enterNexus);
	
//	$("#contextShifter").on("click", ".nexusring .nexusbrowser", enterBrowser);
/*
	$("#screenFrame").on("browserentered", function(){ 
		if ($("#contextShifter li.manuals").hasClass("active")) {
			openDialogWindow("whichmanual"); 
		}
	});
*/
});
 
