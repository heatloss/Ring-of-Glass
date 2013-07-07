
function processOneLi(node) { 
     
var retVal = {};

if (node.is("[data-reqplay],[data-reqread],[data-requnread],[data-reqlocked],[data-requnlocked]")) {
  if (node.is("[data-reqplay]")) {
    retVal.condition = "playthrough";
    retVal.required = parseInt(node.attr("data-reqplay"),10);
  } else if (node.is("[data-reqread]")) {
    retVal.condition = "read";
    retVal.required = node.attr("data-reqread").split(",");
  } else if (node.is("[data-requnread]")) {
    retVal.condition = "unread";
    retVal.required = node.attr("data-requnread").split(",");
  } else if (node.is("[data-reqlocked]")) {
    retVal.condition = "locked";
    retVal.required = node.attr("data-reqlocked").split(",");
  } else if (node.is("[data-requnlocked]")) {
    retVal.condition = "unlocked";
    retVal.required = node.attr("data-requnlocked").split(",");
  }
  if (node.attr("data-reqtype") === "and") {
  	retVal.operator = "all"; // For the time being we're defaulting to any, and overriding only if "all" is specified.
  }
} else if (node.is("[data-decision]")) {
    retVal.decision = {
      "title": node.attr("data-decision"),
      "pose": node.attr("data-pose")
    };
} else {
  retVal = {
    "unlock": node.attr("data-unlock"),
    "event": node.attr("data-event")
  };
  if (node.is("[data-speaker]")){ // Decision branches have no speaker.
    retVal.speaker = {
      "character": node.attr("data-speaker"),
      "pose": node.attr("data-pose")
    };
  }
  if (node.is("[data-listener]") || node.is("[data-listener-pose]")) {
    retVal.listener = {
      "character": node.attr("data-listener"),
      "pose": node.attr("data-listener-pose"), // This value is not yet in use.
      "position": 1
    };
  }
  if (node.is("[data-listener2]") || node.is("[data-listener2-pose]")) {
    retVal.listener2 = {
      "character": node.attr("data-listener2"),
      "pose": node.attr("data-listener2-pose"),
      "position": 2
    };
  }

  var justThisLi = node.clone().children().remove().end().filter(function(){
		return $.trim($(this).text()) !== ''; // Strips out nested <ol>s and <li> tags that don't have any text in them.
  });
  
  retVal.line = {
    "text": $.trim(justThisLi.text()),
    "reference": node.attr("data-ref"), // This is for decision links
    "refdecision": node.attr("data-dec") // This is for loopbacks to earlier decisions
  };
  if (node.hasClass("thinking")) { retVal.line.delivery = "thinking"; }

  if (node.hasClass("exit")) { retVal.operation = "exit"; }

  if (node.hasClass("loopback")) { retVal.operation = "loopback"; }
}

  node.find("> ol:not(.otherwise) > li").each(function() {
      if (!retVal.hasOwnProperty("branch")) {
          retVal.branch = [];
      }
      retVal.branch.push(processOneLi($(this)));
  });

  node.find("> ol.otherwise > li").each(function() {
      if (!retVal.hasOwnProperty("elsebranch")) {
          retVal.elsebranch = [];
      }
      retVal.elsebranch.push(processOneLi($(this)));
  });

  return retVal;
}

