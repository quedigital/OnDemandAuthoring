var PlayerApp = React.createClass({
	gotData: function (data) {
		if (this.isMounted()) {
			this.setState({ title: data.title, steps: data.steps });
		}
	},

	getInitialState: function () {
		var mode = $.urlParam("mode");
		if (mode == undefined) mode = "try";

		var started = $.urlParam("started");
		if (started == undefined) started = false;
		else started = started == "true";

		return {
			title: null,
			mode: mode,
			started: started
		};
	},

	componentDidMount: function () {
		var path;
		if (window.location.hostname == "localhost")
			path = "../../Prototype1.5/" + this.props.source;
		else
			path = "../" + this.props.source;

		var json = $.getJSON(path, this.gotData);

		// Captivate emulator
		window.cpAPIInterface = this;
		window.cpAPIEventEmitter = this;

		$(window).resize(this.onResize);

		this.paused = false;

		this.onResize();
	},

	onResize: function () {
		var wh = $(window).outerHeight() - 50;
		var qp = $(".que-player");

		// assuming 4:3
		var ww = (wh * (4/3));

		// NOTE: not sure about this sizing logic
		qp.height(wh).width("100%");

		this.setState( { size: { width: ww, height: wh } } );
	},

	componentWillMount: function () {
		this.listeners = [];
	},

	componentDidUpdate: function () {
		if (this.state.started) {
			$("body").css("background-color", "rgba(0, 0, 0, 0)");
		} else {
			//$("body").css("background-color", "black");
		}

		this.refreshPlayButton();
	},

	showCurrentTask: function () {
		if (this.state.steps) {
			var item = this.state;

			return <Task {...item} ref="myTask"
				myKey={this.state.currentTask}
				key={this.state.currentTask}
				mode={this.state.mode}
				onComplete={this.onTaskComplete}
				onCurrent={this.onCurrentStep}
				onTogglePause={this.onTogglePause}
				onStart={this.start}
				started={this.state.started}></Task>;
		} else {
			return <p>Loading</p>;
		}
	},

	render: function () {
		return (
			<div className="que-player">
				{ this.showCurrentTask() }
				<div className="playbar">
					<button className="btn btn-success" onClick={this.onClickPrevious}><i className="fa fa-backward"></i></button>
					<button className="btn btn-info" onClick={this.onClickPause}><i ref="myPlayButton" className="fa fa-play"></i></button>
					<button className="btn btn-success" onClick={this.onClickNext}><i className="fa fa-forward"></i></button>
				</div>
			</div>
		);
	},

	onTaskComplete: function () {
		this.trigger("QUE_COMPLETE");
	},

	onCurrentStep: function (step_key) {
		if (this.state.started) {
			var params = {key: step_key};

			this.trigger("CPAPI_SLIDEENTER", params);
		}
	},

	onTogglePause: function () {
		if (this.paused) {
			this.play();
		} else {
			this.pause();
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

	// **** Captivate emulation:

	pause: function () {
		if (this.refs.myTask) {
			this.refs.myTask.pause();
		}

		this.paused = true;

		this.refreshPlayButton();
	},

	start: function () {
		this.paused = false;

		this.setState( { started: true } );
	},

	startOver: function () {
		this.setState( { started: false } );
	},

	play: function () {
		if (this.refs.myTask) {
			this.refs.myTask.resume();
		}

		this.paused = false;

		this.refreshPlayButton();
	},

	addEventListener (event, callback) {
		this.listeners.push( { event: event, callback: callback } );
	},

	getCurrentSlideIndex: function ()  {
		if (this.refs.myTask) {
			return this.refs.myTask.getCurrentStepIndex();
		}

		return undefined;
	},

	getNumberOfSlides: function () {
		if (this.refs.myTask) {
			return this.refs.myTask.getNumberOfSteps();
		}

		return undefined;
	},

	gotoSlide: function (key) {
		if (this.refs.myTask) {
			this.start();
			this.refs.myTask.gotoStep(key);
		}
	},

	onClickPrevious: function () {
		if (this.refs.myTask) {
			this.refs.myTask.onClickPrevStep();
		}
	},

	onClickNext: function () {
		if (this.refs.myTask) {
			this.refs.myTask.onClickNextStep();
		}
	},

	onClickPause: function () {
		if (!this.state.started) {
			this.start();
		} else {
			this.onTogglePause();
		}

		this.refreshPlayButton();
	},

	refreshPlayButton: function () {
		if (this.refs.myPlayButton) {
			var btn = $(this.refs.myPlayButton.getDOMNode());

			if (this.paused || !this.state.started) {
				btn.removeClass("fa-pause").addClass("fa-play");
			} else {
				btn.removeClass("fa-play").addClass("fa-pause");
			}
		}
	}
});