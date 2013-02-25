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
</head>
<body>
<?php include 'headerbar.php'; ?>
<?php include 'filebrowser.php'; ?>
<div id="editor" class="browsing">
	<div id="dialog">
<?php /* include 'convoRepo.php'; */ ?>
	</div>
</div>
<div id="panel">
	<h2>
		Settings and options
	</h2>
<div class="dialogSettings">
	<dl>
	<dt class="speaker">Speaker:</dt>
		<dd></dd>
	<dt class="listener">Listener:</dt>
		<dd></dd>
	<dt class="pose">Pose:</dt>
		<dd></dd>
</dl>
<div class="dialogOps">
	<button id="deleteline">Delete Line</button>
	<button id="setblock">Start Block</button>
</div>

</div>
</div>
<script src="js/jquery-1.9.1.min.js" type="text/javascript"></script> <script src="js/editor.js" type="text/javascript"></script> 
</body>
</html>
