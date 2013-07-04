function injectTrees(masterVar,theUrl) {

  var mygetrequest=new XMLHttpRequest();
  mygetrequest.open("GET", theUrl, true);
  mygetrequest.send(null);
  
  mygetrequest.onreadystatechange = function() {
   if (mygetrequest.readyState === 4) {
    if (mygetrequest.status === 200 || window.location.href.indexOf("http") === -1) {
     masterVar.trees = JSON.parse(mygetrequest.responseText); //retrieve result as an JavaScript object
		 triggerEvent("convotrees");
    } else {
     alert("Error " + mygetrequest.status);
    }
   }
  }

}