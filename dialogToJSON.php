<?php set_include_path('inc'); ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Dialog conversion test</title>
</head>
<body>
<?php include 'convoRepo.php'; ?>
<script src="js/jquery-1.9.1.min.js" type="text/javascript"></script>
<!-- 
<script src="js/JSON2leaves.js" type="text/javascript"></script> 
 -->
<script src="js/html2JSON.js" type="text/javascript"></script> 
<script type="text/javascript">
$(document).ready(function(){

 	var allConvos = "{\n\n";
	$("#convoRepo ol.root").each(function(){
		myID = $(this).attr("data-ident");
		var out = [];
		$(this).children("li").each(function() {
			out.push(processOneLi($(this)));
		});
		allConvos += '"' + myID + '" : ' + JSON.stringify(out) + ',\n\n';
	});
	allConvos = allConvos.slice(0, -3); // removes trailing comma
	allConvos += "\n\n}"
 
 	$("body").empty().append("<pre>" + allConvos + "</pre>");//.text(allConvos);
// 	var sampleJSON = JSON.stringify(out);
// 	console.log(sampleJSON);
// 	
// 	flattenJSON(out);

});


</script>
</body>
</html>
