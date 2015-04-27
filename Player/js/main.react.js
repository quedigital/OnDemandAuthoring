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
var datafile = decodeURI(path)

React.render(<PlayerApp source={datafile}/>, document.getElementById("playerApp"));
