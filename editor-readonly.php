<?php set_include_path('inc'); ?>
<!DOCTYPE html>
<html>
<head>
	<title>Ring of Glass: dialog editor</title>
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<link rel="apple-touch-icon-precomposed" href="/demos/images/RoG-icon.png" />
	<link rel="stylesheet" media="all" type="text/css" href="css/reset.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/editor.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/CartoGothic-Pro-fontfacekit/stylesheet.css">
	<link href='http://fonts.googleapis.com/css?family=VT323' rel='stylesheet' type='text/css'>
</head>
<body>
<div id="editor">
	<div id="dialog">
<?php include 'convoRepo.php'; ?>
	</div>
</div>
<script src="js/jquery-1.9.1.min.js" type="text/javascript"></script>
<script src="js/editor-readonly.js" type="text/javascript"></script> 
<script type="text/javascript"> parseConvo(); </script> 
</body>
</html>
