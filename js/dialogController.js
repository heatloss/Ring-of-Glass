function initConvo() {
	convo.window = document.getElementById("conversation");
	convo.window.dialogField = document.getElementById("dialog");
	convo.window.textField = document.getElementById("convoThread");
	convo.window.charFields = {
		"locals" : document.getElementById("portraits"),
		"avatars" : document.getElementById("avatars")
	};
}

String.prototype.replaceAt = function(index, char) {
	return this.substr(0, index) + char + this.substr(index+char.length);
};

function typeOut(string) {
	alert(string.replaceAt(3, "a"));
}

function openDialogWindow() {
	addClass(convo.window,"active");
}

function closeDialogWindow() {
	removeClass(convo.window,"active");
	// animate out the dialog window
	// hide the characters; stop blinking
}

function isNodeList(nodes) {
	var result = Object.prototype.toString.call(nodes);
	// modern browser such as IE9 / firefox / chrome etc.
	if (result === '[object HTMLCollection]' || result === '[object NodeList]') {
			return true;
	}
	// detect length and item 
	if (!('length' in nodes) || !('item' in nodes)) {
			return false;
	}
	return false;
}

function playCount(treeName) {
	var numPlays = gamedata.readtally[treeName] || 0;
	return numPlays;		
}

function markAsRead(treeName) {
	gamedata.readtally[treeName] = playCount(treeName) + 1;
}

function unLock(lockName) {
	gamedata.locks[lockName] = false;
}
	
function isLocked(lockName) {
	var locked = gamedata.locks[lockName] || false;
	return locked;
}
	
function fireEvent(eventName) {
	if (gamedata.events.hasOwnProperty(eventName)) { // <- Why would this ever be false?
		gamedata.events[eventName]();
	}
}
	
function updateGoal(goaltext) {
	console.log(goaltext); // <- Need to add a goal readout before we can use this.
}
	
function decisionMode(decisionNode) {
	var newPose = convo.dialog.pendingleaf.decision.pose || "default"; // Prepping a pose variable to serve various swap/fade scenarios.
	if (convo.participants.avatars[0].character !== "declan") { // If the previous speaker wasn't Declan, add his avatar now.
		convo.participants.avatars[0] = {"character":"declan","pose":newPose,"transition":"swap"};
		queueChar(convo.participants.avatars[0],["avatars",0]);
	} else if (convo.dialog.pendingleaf.hasOwnProperty("pose")) { // The pose on the decision point can be optionally specified.
		if (newPose !== convo.participants.avatars[0].pose) { // If a pose has been specified, and it's different from the existing pose…
			convo.participants.avatars[0].pose = newPose; // …replace it.
			convo.participants.avatars[0].transition = "repose";
			queueChar(convo.participants.avatars[0],["avatars",0]);
		}
	}
	
	addClass(convo.window,"decisionMode");
	var remindLine = convo.window.textField.querySelector("li");
	addClass(remindLine,"reminder");
    
	bindDecisionHandling();
}

function exitDecisionMode() {
	unbindDecisionHandling();
	removeClass(convo.window,"decisionMode");
	var poseDecision = setTimeout(scrubDecision, 200);
}

function parseDecision(dLeaf){
	var decList = dLeaf.branch, i = 0, dLnth = decList.length, parsedList = []; // <- Do decision leafs ALWAYS have a branch?
	for (; i < dLnth; i++) { // Loop through the choices array.
		if (decList[i].hasOwnProperty("condition")) { // If one of the decision's choices is a conditional…
			thisChoice = getConditional(decList[i]); // …retrieve the conditionally returned array of choices…
			if (typeof thisChoice !== "undefined") { // …and if it's not empty…
				parsedList = parsedList.concat(thisChoice); // …splice the results onto the new array.
			}
		} else {
			parsedList.push(decList[i]); // Otherwise, push this round's node onto the new array.
		}
	}
	return parsedList;
}

function scrubDecision() {
	var oldElems = convo.window.querySelectorAll("#convoThread li.reminder, #convoThread li.decision");
	DOMRemove(oldElems);
	bindDialogHandling();
}

function isDepleted(treeName) { // Checks the "read" condition of a given branch, and all decision-referenced branches. Returns true only if all are read.
	var isNodeRead = gamedata.conditions.read([treeName]) || false, depleted = true, thisLeaf;
	if (!isNodeRead) {
//		depleted = false;
		return false; // If the current referenced node is unread, then we can quit early. Otherwise, loop through the decision-referenced branches, looking for unread ones.
	} else {
		var i = 0, tlnth = convo.trees[treeName].length;
		for (; i < tlnth; i++) {
			thisLeaf = convo.trees[treeName][i];
			if (thisLeaf.hasOwnProperty("decision")) {
				thisLeaf.choices = parseDecision(thisLeaf); // Return all conditionally valid choices associated with this decision.
				var j = 0, clnth = thisLeaf.choices.length;
				for (; j < clnth; j++) {
					if (!isDepleted([thisLeaf.choices[j].line.reference])) { // If this choice's referenced branch is NOT depleted… 
//						depleted = false;
						return false; // …then we're done.
					}
				}
			}
		}
	}
	return depleted; // Loop has failed to quit early upon finding any unread branches; thus we assume they're all read.
}

function endDialogBranch() {
	if (convo.dialog.hasOwnProperty("buffer")) {
		clearTimeout(convo.dialog.buffer.timer); // Stop any typing currently in progress.
	}
	markAsRead(convo.dialog.title);
	if (typeof convo.dPoint === "undefined") {
		unloadConversation();
	} else {
		loadConversation(convo.dPoint[0], convo.dPoint[1]);
		delete convo.dPoint;
	}
}

function debugConversation(treeName, lineNum) {
	disableTiltDrag();
	convo.participants = {};
	convo.participants.locals = [{ "character": "noone" },{ "character": "noone" }];
	convo.participants.avatars = [{ "character": "noone" },{ "character": "noone" }];
	openDialogWindow();
	bindDialogHandling();
	convo.dialog = makeDialog(treeName);
	convo.line = lineNum || 0;
	showThisLine();
}

function initConversation(treeName) {
	disableTiltDrag();
	convo.participants = {};
	convo.participants.locals = [{ "character": "noone" },{ "character": "noone" }];
	convo.participants.avatars = [{ "character": "noone" },{ "character": "noone" }];
	openDialogWindow();
	loadConversation(treeName);
	bindDialogHandling();
}

function makeDialog(name) {
	var dialog = JSON.parse(JSON.stringify(convo.trees[name])); // Clones the whole branch. We'll be flattening it as we traverse. 
	dialog.title = name; // We need to know the name of the loaded conversation tree in order to check/increment its playcount.
	dialog.insertBranch = function (branch, linenum) { 
		Array.prototype.splice.apply(this, [linenum, 1].concat(branch)); // I only dimly understand how this works.
	};
	dialog.getLeaf = function (line) {
		var thisLeaf = this[line], thisBranch;
		if (typeof thisLeaf !== "undefined") {
			if (thisLeaf.hasOwnProperty("condition")) { // Check to see if this is a conditional branch.
				thisBranch = getConditional(thisLeaf); // If so, get the resulting branch.
				if (typeof thisBranch === "undefined") { // If the conditional branch returns nothing…
					this.splice([line],1); // …remove the parent branch.
				} else { // Otherwise…
					this.insertBranch(thisBranch, line); // …absorb the conditional branch into the main dialog.
				} 
				return dialog.getLeaf(line); // …and try again.
			} else {
				return thisLeaf;
			}
		}
	};
	dialog.findDecision = function(dTitle) {
		var i = 0, startPoint = 0, testLeaf = dialog.getLeaf(i);
		while (typeof testLeaf !== "undefined") {
			if (testLeaf.hasOwnProperty("decision")) {
				if (testLeaf.decision.title === dTitle) { // Requested decision found.
					startPoint = i;
					break;
				}
			}
			i++;
			testLeaf = dialog.getLeaf(i);
		}
		return startPoint;
	}
	return dialog;
};

function loadConversation(treeName,decisionName) {
	convo.dialog = makeDialog(treeName);
//	convo.dialog = JSON.parse(JSON.stringify(convo.trees[treeName])); // Clones the whole branch. We'll be flattening it as we traverse. 
//	convo.dialog.title = treeName; // We need to know the name of the loaded conversation tree in order to check/increment its playcount.
	convo.line = typeof decisionName !== "undefined" ? convo.dialog.findDecision(decisionName) : 0; // Determine whether to start at line 0 or at some arbitrary previous-decision point.
	showThisLine();
}

function unloadConversation() {
	delete convo.dPoint;
	enableTiltDrag();
	closeDialogWindow();
	var conversationCleaner = setTimeout(scrubConversation, 500);
}

function advanceLine() {
	var clickedLeaf = convo.dialog[convo.line]; // This is the currently visible line of dialog.

	if (clickedLeaf.hasOwnProperty("unlock")) {
		unLock(clickedLeaf.unlock);
	}
	
	if (clickedLeaf.hasOwnProperty("event")) {
		fireEvent(clickedLeaf.event);
	}
	
	if (clickedLeaf.hasOwnProperty("operation")) {
		if (clickedLeaf.operation === "exit") { // Check to see if we're on an exit node.
			delete convo.dPoint; // We're not going to revert back to the previous decision.
			endDialogBranch();
			return false;
		}
	} else {
		convo.line++; // increment leaf pointer variable
		showThisLine();
	}
}

function showThisLine() {
	convo.dialog.pendingleaf = convo.dialog.getLeaf(convo.line);
	
	if (typeof convo.dialog.pendingleaf === "undefined") { // Check to see if we've run out of dialog.
		endDialogBranch();
		return false;
	} else if (convo.dialog.pendingleaf.hasOwnProperty("decision")) { // Check to see if we've hit a decision point.
		decisionMode();
		return false;
	}

	getParticipants();
	updateCharImages();
	updateText();

	addClass(convo.window, "advanceLine");
	var lineTransition = setTimeout(scrubTransition, 200);
	var restoreDialogListener = setTimeout(bindDialogHandling, 200); // <- This is super-hacky.
}

function scrubConversation(){
	var convElems = convo.window.querySelectorAll("#avatars .character, #portraits .character, #convoThread li");
	DOMRemove(convElems);
	delete convo.dialog;
}

function scrubTransition(){
	var oldElems = convo.window.querySelectorAll("#avatars .character.oldCharacter, #avatars .character.oldPose, #portraits .character.oldCharacter, #portraits .character.oldPose, #convoThread li.outgoing");
	var newElems = convo.window.querySelectorAll("#avatars .character.pending, #portraits .character.pending, #convoThread li.pending");
	DOMRemove(oldElems);
	removeClass(newElems,"pending");
	removeClass(newElems,"newCharacter");
	removeClass(newElems,"newPose");
	removeClass(convo.window, "advanceLine");
}

function parseLeafSlot(activeSlotNode,pendingSlotName) {
	var priorPose = activeSlotNode.pose || "default"; // Grab the last specified pose for this character, if any. Otherwise, default.
	if (convo.dialog.pendingleaf.hasOwnProperty(pendingSlotName)) { // Is there any new stream data on this line?
		var leafNode = convo.dialog.pendingleaf[pendingSlotName];
		if (leafNode.character !== activeSlotNode.character) { // Does it contain a new character for that slot?
			activeSlotNode.character = leafNode.character; // If so, overwrite the character and pose slots.
			activeSlotNode.pose = leafNode.pose || priorPose; // If no pose is available, use the previous specified pose.
			activeSlotNode.transition = "swap"; // Add a flag to allow for the appropriate transition.
		} else if (leafNode.hasOwnProperty("pose")) { // Otherwise, is there a pose specified?
			if (leafNode.pose !== activeSlotNode.pose) { // Is it a new pose?
				activeSlotNode.pose = leafNode.pose; // If so, update the pose data.
				activeSlotNode.transition = "repose";
			} 
		}
	}
	return activeSlotNode;
}

function locateParticipant(charName) {
	for (var i in convo.participants) {
		var j = 0, slots = convo.participants[i].length;
		for (; j < slots; j++) {
			if (convo.participants[i][j].character === charName) {
				var locationArray = [i,j];
				return locationArray;
			}
		}
	} 
}

function updateCharImages() {
	for (var i in convo.participants) {
		var j = 0, slots = convo.participants[i].length;
		for (; j < slots; j++) {
			if (convo.participants[i][j].transition === "swap" || convo.participants[i][j].transition === "repose") {
				queueChar(convo.participants[i][j],[i,j]);
			}
		}
	} 
}

function zeroTransitions() {
	for (var i in convo.participants) {
		var j = 0, slots = convo.participants[i].length;
		for (; j < slots; j++) {
			convo.participants[i][j].transition = "none";
		}
	}
}

function getParticipants() {
	zeroTransitions(); // Reset all transition flags at the start of the round.
	// First, update the portraits with the corresponding listener data in the dialog stream, if any.
	convo.participants.locals = [parseLeafSlot(convo.participants.locals[0],"listener"), parseLeafSlot(convo.participants.locals[1],"listener2")];
	var speakerChar = convo.dialog.pendingleaf.speaker.character, speakerLocationData;
	// Regardless of the speaker's location, update the avatar to reflect any changes.
		speakerLocationData = locateParticipant(speakerChar) || ["avatars",0]; // Find out if the speaker is already in an avatar slot. If not, assign them slot zero.
		convo.participants.avatars[speakerLocationData[1]] = parseLeafSlot(convo.participants.avatars[speakerLocationData[1]],"speaker"); // ...and write the speaker's data into the appropriate avatar slot.
	// If the speaker is local, add him or her to the locals slot, and void the character data in the avatar slots.
	if (!isRemote(speakerChar)) { // In the event that the speaker is local...
		speakerLocationData = locateParticipant(speakerChar);
		if (typeof speakerLocationData !== 'undefined') { // Find out if the speaker is already represented in a listener slot.
			convo.participants.locals[speakerLocationData[1]] = parseLeafSlot(convo.participants.locals[speakerLocationData[1]],"speaker"); // If so, write the speaker's data into the appropriate listener slot.
		} else { // If not, write all character data into listener slot 0.
			convo.participants.locals[0] = parseLeafSlot(convo.participants.locals[0],"speaker");
		}
		convo.participants.avatars[0].character = "noone"; // Wipe out the avatars whenever a local speaker is talking.
		convo.participants.avatars[1].character = "noone";
	}
}

function updateText() {
	var oldLine = convo.window.textField.querySelector("li");
	addClass(oldLine,"outgoing");
	var pendingLi = document.createElement("li");
	pendingLi.p = document.createElement("p");
	pendingLi.appendChild(pendingLi.p);
	convo.dialog.buffer = {};
	convo.dialog.buffer.text = convo.dialog[convo.line].line.text;
	convo.dialog.buffer.inc = 1;
	convo.dialog.buffer.bspan = document.createElement("span");
	convo.dialog.buffer.tspan = document.createElement("span");
	addClass(convo.dialog.buffer.bspan,"buffer");
	addClass(convo.dialog.buffer.tspan,"typeout");
	addClass(convo.dialog.buffer.tspan,"typing");
	pendingLi.p.appendChild(convo.dialog.buffer.tspan);
	pendingLi.p.appendChild(convo.dialog.buffer.bspan);
	addClass(pendingLi,"pending");
	addClass(pendingLi,"speaker-" + convo.dialog.pendingleaf.speaker.character);
	if (convo.dialog.pendingleaf.line.hasOwnProperty("delivery")){
		addClass(pendingLi,"delivery-" + convo.dialog.pendingleaf.line.delivery); // <- Applying the delivery directly as a class may prove limiting later on.
	} 
	convo.window.textField.appendChild(pendingLi);
	typeText();
}

function typeText() {
	convo.dialog.buffer.tspan.innerHTML = convo.dialog.buffer.text.slice(0,convo.dialog.buffer.inc);
	convo.dialog.buffer.bspan.innerHTML = convo.dialog.buffer.text.slice(convo.dialog.buffer.inc, convo.dialog.buffer.text.length);
	if (convo.dialog.buffer.inc < convo.dialog.buffer.text.length) {
		convo.dialog.buffer.inc = convo.dialog.buffer.inc + 1;
		convo.dialog.buffer.timer = setTimeout(typeText, 10);
	} else {
		removeClass(convo.dialog.buffer.tspan,"typing");
	}
}

function queueChar(charNode,locationArray) {
	var targetField = convo.window.charFields[locationArray[0]];
	var locationStamp = "pos-" + locationArray[1];
	var oldCharacterDiv = targetField.querySelector("." + locationStamp);
	var pendingDiv = document.createElement("div");
	var pendingChar = charNode.character;
	if (pendingChar !== "noone" && pendingChar !== "minicomp") { // <- Need a better way of handling invisible characters.
		addClass(pendingDiv, "pending");
		addClass(pendingDiv, "character");
		var pendingPose = charNode.pose || "default"; // <- There should always be a pose specified if the avatar is getting updated, right?
		var pendingImg = document.createElement("img");
		pendingImg.src = convo.chars[pendingChar].posesources[pendingPose];
		pendingDiv.appendChild(pendingImg);
		addClass(pendingDiv, locationStamp);
		targetField.appendChild(pendingDiv);
	}
	if (charNode.transition === "swap") {
		addClass(pendingDiv, "newCharacter");
		addClass(oldCharacterDiv, "oldCharacter");
	} else if (charNode.transition === "repose") {
		addClass(pendingDiv, "newPose");
		addClass(oldCharacterDiv, "oldPose");
	}
}

function DOMRemove(nodes) {
	if (typeof nodes !== 'undefined') {
		var i = 0, nlnth = nodes.length;
		for (; i < nlnth; i++) {
			nodes[i].parentNode.removeChild(nodes[i]); 
		}
	}
}

function isRemote(character) {
	var remoteness = convo.chars[character].remote === true ? true : false;
	return remoteness;
}

function getConditional(node) {
	var thisCondition = gamedata.conditions[node.condition](node.required, node.operator) || false;
	if (thisCondition) {
		return node.branch;
	} else if (node.hasOwnProperty("elsebranch")) {
		return node.elsebranch;
	}
}

function plateHandler() {
	event.stopPropagation();
	panelName = this.getAttribute("data-name");
	var thisConvo = gamedata.convoqueue[panelName];
	initConversation(thisConvo);
}

function setConvoQ(object,title) {
	gamedata.convoqueue[object] = title;
}

function bindConvoQ(eventname,title) { // <- Consider merging this with setConvoQ by using an event-based click-on-object system.
	gamedata.eventconvoqueue[eventname] = function() { // <- Only one conversation will be bound to a given event.
		initConversation(title);
		gamedata.window.removeEventListener(eventname, gamedata.eventconvoqueue[eventname]);
	} 
	gamedata.window.addEventListener(eventname, gamedata.eventconvoqueue[eventname]);
}

function dialogHandler() {
	event.stopPropagation();
	unbindDialogHandling(); // Unbinding the listener on each firing should prevent scenarios in which click events stack up while the dialog is animating.
	advanceLine();
}

function decisionHandler() {
	event.stopPropagation();
	unbindDecisionHandling();
	exitDecisionMode();
	if (this.choicedata.hasOwnProperty("operation")) {
		if (this.choicedata.operation === "exit") { // Check to see if this choice simply exits the conversation.
			delete convo.dPoint; // We're not going to revert back to the previous decision.
			endDialogBranch();
			return false;
		}
	} else if (this.choicedata.hasOwnProperty("branch")) { // In the case of an inline decision, collapse it and proceed.
		convo.dialog.insertBranch(this.choicedata.branch, convo.line);
		showThisLine();
	} else {
		convo.dPoint = [convo.dialog.title, convo.dialog.pendingleaf.decision.title];
		loadConversation(this.choicedata.line.reference);
	}
}

function bindDialogHandling() {
	convo.window.dialogField.addEventListener("click", dialogHandler);
}

function unbindDialogHandling () {
	convo.window.dialogField.removeEventListener("click", dialogHandler);
}

function bindDecisionHandling() {
	var decisionLi = document.createElement("li");
	addClass(decisionLi,"decision");
	addClass(decisionLi,"speaker-declan");
	decisionLi.ul = document.createElement("ul");
	convo.dialog.pendingleaf.choices = parseDecision(convo.dialog.pendingleaf); // Flatten any conditions on the array of decision choices. 
	var i = 0, pStub, thisChoice;
	for (; i < convo.dialog.pendingleaf.choices.length; i++) { // The length of convo.dialog.pendingleaf.choices is dynamic; it changes if we snip out depleted choices.
		if (isDepleted(convo.dialog.pendingleaf.choices[i].line.reference)) {
			convo.dialog.pendingleaf.choices.splice([i],1); // If a choice's entire referenced tree is read, remove it from the array. 
			i--; // Having deleted a node, subtract one from the counter so we don't inadvertently skip the next node in the loop.
		} else { 
			convo.dialog.pendingleaf.choices[i].target = document.createElement("li");
			convo.dialog.pendingleaf.choices[i].target.choicedata = convo.dialog.pendingleaf.choices[i]; // Store the metadata associated with this choice in the markup for later retrieval.
			pStub = document.createElement("p");
			pStub.innerHTML = convo.dialog.pendingleaf.choices[i].target.choicedata.line.text;
			convo.dialog.pendingleaf.choices[i].target.appendChild(pStub);
			decisionLi.ul.appendChild(convo.dialog.pendingleaf.choices[i].target);
			convo.dialog.pendingleaf.choices[i].target.addEventListener('click', decisionHandler);
			decisionLi.appendChild(decisionLi.ul);
			convo.window.textField.appendChild(decisionLi);
		}
	}
}

function unbindDecisionHandling () {
	var i = 0, clnth = convo.dialog.pendingleaf.choices.length;
	for (; i < clnth; i++) {
    convo.dialog.pendingleaf.choices[i].target.removeEventListener('click', decisionHandler);
	}
}

window.addEventListener('DOMContentLoaded', initConvo);
