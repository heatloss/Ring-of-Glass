var convo = {}; // <- Holds all conversation-related metadata
//convo.trees = {};
injectTrees(convo,"js/convo.json"); // generates convo.trees

convo.chars = {
	declan : {},
	minicomp : {},
	frank : {},
	victoria : {},
	cyrus : {}
};

convo.chars.declan.remote = true;
convo.chars.minicomp.remote = true;

convo.chars.declan.posesources = {
	default : "images/sprite_Declan-default.png",
	grim : "images/sprite_Declan-default.png", // What are we going to do about "grim?"
	pondering : "images/sprite_Declan-pondering.png",
	analyzing : "images/sprite_Declan-analyzing.png",
	wtf : "images/sprite_Declan-wtf.png",
	slowburn : "images/sprite_Declan-slowburn.png",
	shocked : "images/sprite_Declan-shocked.png",
	surprised : "images/sprite_Declan-surprised.png",
	wondering : "images/sprite_Declan-wondering.png",
	smirk : "images/sprite_Declan-smirk.png",
	squint : "images/sprite_Declan-squint.png",
	unsure : "images/sprite_Declan-unsure.png",
	confirming : "images/sprite_Declan-confirming.png",
	waitaminute : "images/sprite_Declan-waitaminute.png",
	facepalm : "images/sprite_Declan-facepalm.png",
	wince : "images/sprite_Declan-wince.png",
	retort : "images/sprite_Declan-retort.png",
	dark : "images/sprite_Declan-dark.png"
};

convo.chars.frank.posesources = {
	default : "images/sprite_Frank-scowl.png",
	sulk : "images/sprite_Frank-sulk.png",
	yelling : "images/sprite_Frank-yelling.png",
	shouting : "images/sprite_Frank-yelling.png", // Maybe don't use both shouting and yelling?
	thinking : "images/sprite_Frank-thinking.png"
};

convo.chars.minicomp.posesources = {
	default : "images/dot.png"
};

var gamedata = {};

gamedata.window = document.getElementById("gameWindow");

gamedata.eventregistry = {
}; // <- Holds arbitrary functions bound to particular events, for self-removing listeners.

gamedata.contextStack = [ "enviro" ]; // <- tracks the layering order of each game "context" e.g. environment, conversation, nexus.

gamedata.convoqueue = {
	frank : "talktoguard",
	phone : "lookatphone",
	desktop : "lookatcomputer",
	readout : "lookatdataroom",
	printer : "lookatprinter"
}; // <- Holds all interactive-object-related metadata. This will surely need to be a nested tree before too long.

gamedata.eventconvoqueue = {
}; // <- Holds conversation titles bound to particular events.

gamedata.readtally = {
}; // <- Holds all playcount-related metadata; starts game as empty.

gamedata.nexus = {
	state: {
		on: false,
		active: false,
		last: "galaxy",
		activepath: {node: "wetware", subserver: 3, browser: 1},
		ringdata: { subservers: [] }
	},
	help: {
		active: false,
	},
	rings: {
		wetware: {
			subservers: ["misc", "tools", "manuals", "welcome", "hyperlinks", "photos", "music"]
		}
	}
};

gamedata.locks = {
	seePoliceStation : true,
	seeHUD : true,
	missionAccessPhone : true,
	missionHelpGuard : true,
	missionManualHunt : true,
	activateNexus : true,
	deactivateNexus : true
}; // <- Holds all lock-related metadata.

gamedata.conditions = {
	playthrough : function (cReq, cOp){
		// cReq is an integer.
		if (playCount(convo.dialog.title) + 1 === cReq) { // Note: Playcount starts at 0, but playthrough starts at 1. 
			return true;
		}
	},
	read : function(cReq, cOp) {
		// cReq is an array of required-read titles.
		var i = 0, readTally = 0;
		for (; i < cReq.length; i++) {
			if (playCount(cReq[i]) > 0) {
				readTally++;
			}
		}
		var readAll = cOp === "all" ? true : false;
		if ((!readAll && readTally > 0) || (readAll && readTally === cReq.length)) { 
			return true;
		}
	},
	unread : function(cReq, cOp) {
		// cReq is an array of required-unread titles.
		var i = 0, readTally = 0;
		for (; i < cReq.length; i++) {
			if (playCount(cReq[i]) > 0) {
				readTally++;
			}
		}
		var unreadAll = cOp === "all" ? true : false;
		if ((!unreadAll && readTally < cReq.length) || (unreadAll && readTally === 0)) { 
			return true;
		}
	},
	locked : function(cReq, cOp) {
		// cReq is an array of required locks. For the time being, we're assuming there's just one.
		if (isLocked(cReq[0])) {
			return true;
		}
	},
	unlocked : function(cReq, cOp) {
		// cReq is an array of required not-locks. For the time being, we're assuming there's just one.
		if (!isLocked(cReq[0])) {
			return true;
		}
	}
}; 

gamedata.events = {
	gamelaunch : function () {
		makeBlind();
	},
	showhud : function () {
		activateHUD();
	},
	showtodos : function () {
		updateGoal("Create a to-do list.");
		initializeTodos();
	},
	showjail : function () {
		unLock("seePoliceStation");
		removeClass(enviro.environment, "paused"); // Just this once.	
		makeUnblind();
	},
	missionphonecall : function () {
		updateGoal("Convince the guard to let you have a phone call.");
		unLock("missionAccessPhone");
		setConvoQ("frank", "talktoguard");
	},
	offerhelpwithcomputer : function () {
		updateGoal("Offer to help the guard with his computer.");
		unLock("missionHelpGuard");
	},
	displayenternexushelp : function () {
		showHelp("invokeNexus");
		initNexus();
		enablePinchRotate();
		singleUseListener("nexusinvoked", hideHelp)
// 		gamedata.window.addEventListener("nexusinvoked", hideHelp);
// 		gamedata.window.addEventListener("hidehelp", function(){
// 			gamedata.window.removeEventListener("nexusinvoked", hideHelp);		
// 		});
		bindConvoQ("nexusentered","meetyournexus");
		bindConvoQ("browserpagetitle-manuals","whichmanual", false);
		setConvoQ("frank", "notalkingwithoutreport");
	},
	needmoreformanual : function () {
		updateGoal("Find out more about the hardware around here.");
	},
	displayexitnexushelp : function () {
		showHelp("dismissNexus");
		singleUseListener("nexussuspending", hideHelp)
// 		gamedata.window.addEventListener("nexusinvoked", hideHelp);
	},
	deducemanual : function () {
		showPuzzle("whichmanual");
	},
	compilethis : function () {
		showPuzzle("compileahack");
	},
	solvepuzzle1 : function () {
		hidePuzzle();
		setConvoQ("frank", "solveerror84");
		updateGoal("Help the guard reboot the print server.");
		setTimeout(function () { 
			startConversation("afterpuzzle1solve");	
		}, 500);
	},
	missionManualHunt : function () {
		unLock("missionManualHunt");
		setConvoQ("frank", "solveerror84");
		updateGoal("Help the guard reboot the print server.");
	},
	failpuzzle1 : function () {
		hidePuzzle();
		setConvoQ("frank", "failerror84");
		setTimeout(function () { 
			startConversation("afterpuzzle1fail");	
		}, 500);
	},
	solvepuzzle2 : function () {
		hidePuzzle();
		setConvoQ("frank", "typethisforme");
		updateGoal("Have Frank type in your text string.");
		setTimeout(function () { 
			startConversation("afterpuzzle2solve");	
		}, 500);
	},
	whatsyourpassword : function () {
// 		updateGoal("Figure out the guard's login and password.");
		makeBlind();
		setTimeout(deTilt, 666);
		enviro.todo.querySelector(".todoReadout h4").innerHTML = "That's the end of the demo (for now). To be continued...";
		addClass(enviro.todo, "init");
// 		setConvoQ("frank", "whatsyourpassword");
	},
	filtertools : function () {
	},
	planyourhack : function () {
		updateGoal("Revisit the gridphone; figure out how to hack it.");
		setConvoQ("phone", "planyourhack");
	},
	timetoobfuscate : function () {
		updateGoal("Search the Nexus for a stealthy way to reset a password.");
		setConvoQ("phone", "hackplanned");
		setConvoQ("frank", "lookingforpassword");
	},
	tothephone : function () {
		updateGoal("Hack the phone; call someone who can help.");
// 		$("#container").fadeOut(1000, function(){ alert("To be continued..."); });
	}
		
}; 
