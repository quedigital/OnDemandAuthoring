requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.3.min",
		"jquery.ui": "jquery-ui.min",
		"jquery-json": "jquery.json.min",
		app: "../app"
	},

	shim: {
		"jquery": {
			export: "$"
		},
		"jquery.ui": {
			export: "$"
		},
		"jquery-json": {
			export: "$",
			deps: ['jquery']
		}
	}
});

requirejs(['app/main']);

/*
require(["domready", "PlayerApp"], function (domReady, PlayerApp) {
	$.urlParam = function(name) {
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results==null){
			return null;
		}
		else{
			return results[1] || 0;
		}
	};

	createjs.CSSPlugin.install();

	var path = $.urlParam("datafile");
	var datafile = decodeURI(path);

	console.log(PlayerApp);

	//var p = new PlayerApp();
	//p.run();

	function initialize () {
		var path;

		if (window.location.hostname == "localhost")
			path = "../../Prototype1.5/" + datafile;
		else
			path = "../" + datafile;

		var json = $.getJSON(path, gotData);

		// Captivate emulator
		//window.cpAPIInterface = this;
		//window.cpAPIEventEmitter = this;
	}

	function gotData (data) {
		console.log("here with data");
		console.log(data);
	}

	domReady(initialize);

//	React.render(<PlayerApp source={datafile}/>, document.getElementById("playerApp"));
});
*/