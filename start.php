<?php set_include_path('inc'); ?>
<!DOCTYPE html>
<html>
<head>
	<title>Ring of Glass: tech demo</title>
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="viewport" content="width=960, user-scalable=no">
	<link rel="stylesheet" media="all" type="text/css" href="css/reset.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/poster.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/gameEnv.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/cube2.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/sceneObjects.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/nexus2.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/add2home.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/engine.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/saxMono-fontfacekit/stylesheet.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/CartoGothic-Pro-fontfacekit/stylesheet.css">
	<link rel="stylesheet" media="all" type="text/css" href="css/McMurdo-fontfacekit/stylesheet.css">
	<!-- <link rel="stylesheet" media="all" type="text/css" href="css/DejaVu-Sans-fontfacekit/stylesheet.css"> -->
	<link rel="apple-touch-icon-precomposed" href="/demos/images/RoG-icon.png" />
<!-- 	<link href='http://fonts.googleapis.com/css?family=VT323' rel='stylesheet' type='text/css'> -->
</head>
<body>
<div id="screenFrame">
	<div id="gameWindow" class="blind">
		<div id="sceneScrutiny">
<?php include 'cube2.php'; ?>
		</div>
<?php include 'nexus.php'; ?>
<?php include 'helpscreen.php'; ?>
<?php include 'visor.php'; ?>
<?php include 'touchplates.php'; ?>
<?php include 'conversation2.php'; ?>
<?php include 'poster.php'; ?>
	</div>
</div>
<script src="js/jquery-1.9.1.min.js" type="text/javascript"></script>
<script src="js/convoImport.js" type="text/javascript"></script>
<script src="js/global.js" type="text/javascript"></script>
<script src="js/gamedata.js" type="text/javascript"></script>
<script src="js/dialogController.js" type="text/javascript"></script>
<script src="js/enviroController.js" type="text/javascript"></script>
<script src="js/nexusController2.js" type="text/javascript"></script>
<script src="js/browserController.js" type="text/javascript"></script>
</body>
</html>
