$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null){
		return null;
	}
	else{
		return results[1] || 0;
	}
}

createjs.CSSPlugin.install();

var path = $.urlParam("datafile");
var datafile = decodeURI(path);

/* this is only used for embedding images into the page html via CSS; we'll probably use Habitat's CSS
// add image CSS
var path = datafile.substr(0, datafile.indexOf("/"));

var css;
if (window.location.hostname == "localhost")
	css = "/Prototype1.5/" + path + "/pages/images.css";
else
	css = path + "/pages/images.css";

$('head').append('<link rel="stylesheet" href="' + css + '" type="text/css" />');
*/

React.render(<PlayerApp source={datafile}/>, document.getElementById("playerApp"));
