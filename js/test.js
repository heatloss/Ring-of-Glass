
$(document).ready(function() {

	function parseTree(treeObj) {
		var dialogTree = treeObj.clone();
		var treeName = dialogTree.data("ident");
		dialogTree.find("li[data-speaker],li[data-ref]").wrapInner("<p />");
		dialogTree.find("li.decision").addClass("speaker-declan");
		dialogTree.find("li").each(function () {
			listNode = $(this);
			if (listNode.is("[data-ref]")) {
				var refIdent = listNode.attr("data-ref");
				if (playCount(refIdent) > 0) {
					listNode.addClass("refIsRead")
				}
			}
			if (listNode.hasClass("playthrough")) {
				if (listNode.data("reqplay") == playCount(treeName) + 1) {
					var childList = listNode.children(":first").html();
					listNode.before(childList);
				} else {
					var altList = listNode.children(".otherwise").html();
					listNode.before(altList);
				}
				listNode.remove();
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
				if ((listNode.data("reqtype") == "or" && readActual > 0) || (listNode.data("reqtype") == "and" && readActual == readReqArray.length)) {
					var childList = listNode.children(":first").html();
					listNode.before(childList);
				} else {
					var altList = listNode.children(".otherwise").html();
					listNode.before(altList);
				}
				listNode.remove();
			}
			if (listNode.hasClass("unread")) {
				var unreadReqList = listNode.attr("data-requnread");
				var unreadReqArray = unreadReqList.split(",");
				var unreadActual = 0;
				for (var i=0; i<unreadReqArray.length; i++) {
					otherTreeName = unreadReqArray[i];
					if (playCount(otherTreeName) == 0) {
						unreadActual++;
					}
				}
				if ((listNode.data("reqtype") == "or" && unreadActual > 0) || (listNode.data("reqtype") == "and" && unreadActual == unreadReqArray.length)) {
					var childList = listNode.children(":first").html();
					listNode.before(childList);
				} else {
					var altList = listNode.children(".otherwise").html();
					listNode.before(altList);
				}
				listNode.remove();
			}
		});
		return dialogTree;
	}		
		
	function playCount(treeName) {
		playdata = $("#convoRepo > .root." + treeName).attr("data-playcount");
		plays = (playdata > 0) ? playdata : 0;
		return plays;		
	}


	function markAsRead (treeName) {
		$("#convoRepo > .root." + treeName).attr("data-playcount", playCount(treeName) + 1);
		$("#dialog .convoThread").attr("data-predecessor",treeName);		
	}
	
	function loadDialog(treeName) {
		var treeObj = $("#convoRepo > .root." + treeName);
		var parsedTree = parseTree(treeObj).html();
		$("#conversation").addClass("participant-" + treeObj.attr("data-participant"));
		$("#dialog .convoThread").append(parsedTree).attr("data-ident", treeName);
		var resumePoint = $("#dialog .convoThread").find("li.active").next();
		if (resumePoint.length == 0) { resumePoint = $("#dialog .convoThread > li").first() };
	}


	$("#convoRepo").one("click", function(event){
		if ($("#screenFrame").is(":not(.locked-seeHUD)")) {
//			openDialogWindow();
			loadDialog("talktoguard");
		}
	});

	  

});
 
