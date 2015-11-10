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

		this.setValue("interactedWith", false);

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
			this.playerDiv = div;

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
				if (this.getValue("paused") || !this.getValue("started")) {
					this.playButton.find("i").removeClass("fa-pause").addClass("fa-play");
				} else {
					this.playButton.find("i").removeClass("fa-play").addClass("fa-pause");
				}
			}
		},

		onClickPrevious: function (evt) {
			this.setValue("interactedWith", true);

			this.task.onClickPreviousStep();
		},

		onClickPause: function (evt) {
			if (!this.getValue("started")) {
				this.start();
			} else if (this.getValue("finished")) {
				this.start();
			} else {
				this.togglePause();
			}
		},

		onClickNext: function (evt) {
			this.setValue("interactedWith", true);

			this.task.onClickNextStep();
		},

		getValue: function (key) {
			return this.values[key];
		},

		setValue: function (key, value) {
			this.values[key] = value;

			switch (key) {
				case "paused":
					if (this.playerDiv) {
						if (value) {
							this.playerDiv.removeClass("paused").addClass("paused");
						} else {
							this.playerDiv.removeClass("paused");
						}
					}
					break;
				case "interactedWith":
					break;
			}
		},

		start: function () {
			this.setValue("interactedWith", true);

			this.setValue("started", true);
			this.setValue("finished", false);

			this.setValue("paused", false);

			this.task.setCurrentStep(0);
			this.task.play();

			this.onCurrentStep(this.getCurrentStepIndex());

			this.refresh();
		},

		togglePause: function () {
			this.setValue("paused", !this.getValue("paused"));

			if (!this.getValue("paused")) {
				this.task.play();
			} else {
				this.task.pause();
			}

			this.refresh();
		},

		pause: function () {
			this.setValue("paused", true);

			if  (this.task)
				this.task.pause();

			this.refresh();
		},

		play: function () {
			this.setValue("interactedWith", true);

			this.setValue("started", true);
			this.setValue("finished", false);

			this.setValue("paused", false)

			this.task.play();

			this.refresh();
		},

		onComplete: function () {
			this.setValue("finished", true);

			this.trigger("QUE_COMPLETE");

			this.pause();
		},

		onCurrentStep: function (step_key) {
			if (this.getValue("interactedWith")) {
				var params = {key: step_key};

				this.trigger("CPAPI_SLIDEENTER", params);

				return true;
			}
		},

		trigger: function (event, params) {
			for (var i = 0; i < this.listeners.length; i++) {
				var l = this.listeners[i];
				if (l.event == event) {
					l.callback(params);
				}
			}
		},

		addEventListener: function (event, callback) {
			this.listeners.push( { event: event, callback: callback } );
		},

		getCurrentStepIndex: function () {
			if (this.task) {
				return this.task.getCurrentStepIndex();
			}
		},

		gotoStep: function (index) {
			if (this.task) {
				this.setValue("interactedWith", true);
				this.setValue("finished", false);

				this.task.setCurrentStep(index);

				this.onCurrentStep(this.getCurrentStepIndex());
			}
		}
	};

	return PlayerApp;
});
