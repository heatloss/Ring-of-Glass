	$('#choiceGrid tbody > tr > td').attr("data-suppress", 0);
	$("#choiceGrid").on("click","tbody > tr > td:not(.suppressed)", function(){
		var chkBox = $(this);
		
		var chkBoxIndex = chkBox.closest("tr").find("td").has(".checked").index(chkBox);

		if (!chkBox.hasClass("checked") && !chkBox.hasClass("struck")) {
			chkBox.siblings().has(".checked").each(function(){
				var me = $(this);
				var newVal = parseInt(me.attr("data-suppress")) + 1;
				me.attr("data-suppress", newVal);
			});
			chkBox.closest("tbody").find("tr").not(chkBox.closest("tr")).each(function(){
				var me = $(this).find("td").eq(chkBoxIndex);
				var newVal = parseInt(me.attr("data-suppress")) + 1;
				me.attr("data-suppress", newVal);
			});
			$('#choiceGrid tr > td').each(function(){
				var me = $(this);
				if (parseInt(me.attr("data-suppress")) > 0) {
					me.addClass("suppressed");
				} 
			});
		} else if (chkBox.hasClass("checked")) {
			chkBox.siblings().has(".checked").each(function(){
				var me = $(this);
				var newVal = parseInt(me.attr("data-suppress")) - 1;
				me.attr("data-suppress", newVal);
			});
			chkBox.closest("tbody").find("tr").not(chkBox.closest("tr")).each(function(){
				var me = $(this).find("td").eq(chkBoxIndex);
				var newVal = parseInt(me.attr("data-suppress")) - 1;
				me.attr("data-suppress", newVal);
			});
			$('#choiceGrid tr > td').each(function(){
				var me = $(this);
				if (parseInt(me.attr("data-suppress")) === 0) {
					me.removeClass("suppressed");
				} 
			});
		}
		
		if (chkBox.hasClass("checked")) {
			chkBox.removeClass("checked").addClass("struck");
		} else if (chkBox.hasClass("struck")) {
			chkBox.removeClass("struck");
		} else {
			chkBox.addClass("checked");
		}

	});
	
	
// 	var b, a;
// 	b = a = Math.atan2(mx - x, -(my - y - opt.width / 2));
// 	(a < 0) && (b = a + PI2);
// 	nv = Math.round(b * (opt.max - opt.min) / PI2) + opt.min;
// 	return (nv > opt.max) ? opt.max : nv;
