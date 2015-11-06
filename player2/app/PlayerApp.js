define(["./Task"], function (Task) {
	function PlayerApp (el, datafile) {
		var path;

		this.values = {};

		if (window.location.hostname == "localhost")
			path = "../../Prototype1.5/" + datafile;
		else
			path = "../" + datafile;

		var json = $.getJSON(path, $.proxy(this.initialize, this, el));

		var mode = $.urlParam("mode");
		if (mode == undefined) mode = "try";

		this.mode = mode;
		this.title = undefined;
		this.steps = undefined;
		this.size = { width: undefined, height: undefined };

		this.listeners = [];

		// Captivate emulator
		window.cpAPIInterface = this;
		window.cpAPIEventEmitter = this;
	}

	PlayerApp.prototype = {
		constructor: PlayerApp,

		initialize: function (el, data) {
			this.el = $(el);
			this.title = data.title;
			this.steps = data.steps;

			$(window).resize($.proxy(this.onResize, this));

			this.createDOM();

			this.onResize();
		},

		createDOM: function () {
			var div = $("<div>", { class: "que-player" } );

			var task = new Task( { player: this, mode: this.mode, steps: this.steps } );
			div.append(task.getDOM());
			this.task = task;

			var playbar = $("<div>", { class: "playbar "} );
			div.append(playbar);

			var btn;
			btn = $("<button>", { class: "btn btn-success" }).append($("<i>", { class: "fa fa-backward" }));
			btn.click($.proxy(this.onClickPrevious, this));
			playbar.append(btn);
			btn = $("<button>", { class: "btn btn-info" }).append($("<i>", { class: "fa fa-play" }));
			btn.click($.proxy(this.onClickPause, this));
			this.playButton = btn;
			playbar.append(btn);
			btn = $("<button>", { class: "btn btn-success" }).append($("<i>", { class: "fa fa-forward" }));
			btn.click($.proxy(this.onClickNext, this));
			playbar.append(btn);

			this.el.append(div);
		},

		refresh: function () {
			if (this.getValue("started")) {
				$("body").css("background-color", "rgba(0, 0, 0, 0)");
			} else {
				//$("body").css("background-color", "black");
			}

			this.refreshPlayButton();
		},

		onResize: function () {
			var wh = $(window).outerHeight() - 50;
			var qp = $(".que-player");

			// assuming 4:3
			var ww = (wh * (4/3));

			// NOTE: not sure about this sizing logic
			qp.height(wh).width("100%");

			this.setSize( { width: ww, height: wh } );

			// THEORY: when the screen changes, pause (so the audio doesn't re-start itself; user has to click play to resume)
			this.pause();
		},

		setSize: function (obj) {
			this.size.width = obj.width;
			this.size.height = obj.height;
		},

		refreshPlayButton: function () {
			if (this.playButton) {
				if (this.paused || !this.getValue("started")) {
					this.playButton.find("i").removeClass("fa-pause").addClass("fa-play");
				} else {
					this.playButton.find("i").removeClass("fa-play").addClass("fa-pause");
				}
			}
		},

		onClickPrevious: function (evt) {
			this.task.onClickPreviousStep();
		},

		onClickPause: function (evt) {
			if (!this.getValue("started")) {
				this.start();

				this.refresh();
			} else {
				this.togglePause();
			}
		},

		onClickNext: function (evt) {
			this.task.onClickNextStep();
		},

		getValue: function (key) {
			return this.values[key];
		},

		setValue: function (key, value) {
			this.values[key] = value;

			switch (key) {
				case "started":
					if (this.task) {
						this.task.setValue("started", value);
					}
					break;
				case "finished":
					if (this.task) {
						this.task.setValue("finished", value);
					}
					break;
			}
		},

		start: function () {
			this.setValue("started", true);
			this.setValue("finished", false);

			this.paused = false;

			this.task.setCurrentStep(0);
			this.task.play();

			this.refresh();
		},

		togglePause: function () {
			this.paused = !this.paused;

			if (!this.paused) {
				this.task.play();
			} else {
				this.task.pause();
			}

			this.refresh();
		},

		pause: function () {
			this.paused = true;

			if  (this.task)
				this.task.pause();

			this.refresh();
		},

		onComplete: function () {
			this.trigger("QUE_COMPLETE");

			this.pause();
		},

		trigger: function (event, params) {
			for (var i = 0; i < this.listeners.length; i++) {
				var l = this.listeners[i];
				if (l.event == event) {
					l.callback(params);
				}
			}
		},

		addEventListener (event, callback) {
			this.listeners.push( { event: event, callback: callback } );
		},

		onClickRepeat: function () {
			this.start();
		}
	};

	return PlayerApp;
});
