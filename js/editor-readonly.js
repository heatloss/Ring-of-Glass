function parseConvo() {
	var dialogTrees = $("#convoRepo ol.root");
	var dialogLines = dialogTrees.find("li");
	dialogLines.filter("[data-speaker],[data-ref]").addClass(function(){ 
		return $(this).attr("data-speaker"); 
	}).contents().filter(function(){
		return this.nodeType === 3;
	}).filter(function(){
		return $.trim($(this).text()) != '';
	}).wrap("<p />");
	$("#convoRepo ol.root").each(function(){
		node = $(this);
		rootTitle = node.data("ident");
		node.before("<h3 class='title'>#"+rootTitle+"</h3>");
	});

	$("#convoRepo ol.root li.decision").each(function(){
		var node = $(this);
		var dtitle = node.data("decision");
		node.prepend("<h4 class='conditional'>Decision #"+dtitle+":</h4>");
		node.append("<h4 class='conditional'>---end decision <span class='endcontext'>#"+dtitle+"</span></h4>");
		node.find("li[data-ref]").each(function(){
			var subnode = $(this);
			var branch = subnode.data("ref");
			subnode.append("<h5 class='branch'>(links to <span class='ident'>#"+branch+"</span>)</h5>")
		});
	});

	$("#convoRepo ol.root li[data-requnread]").each(function(){
		var node = $(this);
		var reqs = node.data("requnread").replace(/,/g, ", #");
		var isAre = (reqs.indexOf(",") != -1)? "Are" : "Is";
		node.addClass("unread");
		node.prepend("<h4 class='conditional'>" + isAre + " <span class='req'>#" + reqs + "</span> unread?</h4>");
		node.append("<h4 class='conditional'>---end unread</h4>");
		node.children("ol.otherwise").before("<h4 class='conditional'>Otherwise <span class='endcontext'>(if not unread)</span>:</h4>");
	});

	$("#convoRepo ol.root li[data-reqread]").each(function(){
		var node = $(this);
		var reqs = node.data("reqread").replace(/,/g, ", #");
		var isAre = (reqs.indexOf(",") != -1)? "Are" : "Is";
		node.addClass("read");
		node.prepend("<h4 class='conditional'>" + isAre + " <span class='req'>#" + reqs + "</span> read?</h4>");
		node.append("<h4 class='conditional'>---end read</h4>");
		node.children("ol.otherwise").before("<h4 class='conditional'>Otherwise <span class='endcontext'>(if not read)</span>:</h4>");
	});

	$("#convoRepo ol.root li.playthrough").each(function(){
		var node = $(this);
		var reqs = node.data("reqplay");
		node.prepend("<h4 class='conditional'>Is this playthrough <span class='req'>" + reqs + "</span>?</h4>");
		node.append("<h4 class='conditional'>---end playthrough <span class='endcontext'>"+reqs+"</span></h4>");
		node.children("ol.otherwise").before("<h4 class='conditional'>Otherwise <span class='endcontext'>(if not playthrough "+reqs+")</span>:</h4>");
	});

	$("#convoRepo ol.root li[data-reqlocked]").each(function(){
		var node = $(this);
		var reqs = node.data("reqlocked");
		node.addClass("locked");
		node.prepend("<h4 class='conditional'>Is <span class='req'>" + reqs + "</span> locked?</h4>");
		node.append("<h4 class='conditional'>---end locked</h4>");
		node.children("ol.otherwise").before("<h4 class='conditional'>Otherwise <span class='endcontext'>(if "+reqs+" is unlocked)</span>:</h4>");
	});

	$("#convoRepo ol.root li[data-requnlocked]").each(function(){
		var node = $(this);
		var reqs = node.data("requnlocked");
		node.addClass("unlocked");
		node.prepend("<h4 class='conditional'>Is <span class='req'>" + reqs + "</span> unlocked?</h4>");
		node.append("<h4 class='conditional'>---end unlocked</h4>");
		node.children("ol.otherwise").before("<h4 class='conditional'>Otherwise <span class='endcontext'>(if "+reqs+" is locked)</span>:</h4>");
	});

}		

function nestBlock(node){
	var blockSet = $(node).prevUntil(".ghostblockstart").andSelf().add(".ghostblockstart");
	blockSet.removeClass("ghostblockstart ghostblockhover ghostblockinner ghostblockend").wrapAll("<li class='newblock'><ol></ol></li>").parent().before("<h4 class='conditional'>Unclassified block</h4>").after("<h4 class='conditional'>---end</h4>");
	enableEditing();
}

function panelUpdate(){
	var panel = $("#panel")
	var activeNode = panel.data("active");
	var speaker = activeNode.data("speaker");
	var listener = activeNode.closest("ol.root").data("listener");
	if (activeNode.is("[listener]")) {
		var listener = activeNode.data("listener");
	} else {
		var pointerNode = activeNode;
		var i = 0, j = activeNode.prevAll().length, distanceToThisIndex, distanceToNextIndex, thisSpanHalf, targetSnapIndex;
		for (; i < j; i++) {
			if(pointerNode.prev().is("[listener]")) {
				listener = pointerNode.prev().data("listener");
				break;
			}
		}
	}
	var pose = activeNode.data("pose");
	panel.find(".dialogSettings dt.speaker + dd").text(speaker);
	panel.find(".dialogSettings dt.listener + dd").text(listener);
	panel.find(".dialogSettings dt.pose + dd").text(pose);
}

$(document).ready(function(){
		
});
 
