$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null){
		return null;
	}
	else{
		return results[1] || 0;
	}
}

var PlayerApp = React.createClass({
	gotData: function (data) {
		if (this.isMounted()) {
			this.setState({ title: data.title, tasks: data.tasks });
		}
	},

	getInitialState: function () {
		var mode = $.urlParam("mode");
		if (mode == undefined) mode = "try";

		return {
			title: null,
			tasks: null,
			currentTask: "0",
			mode: mode,
			started: false
		};
	},

	componentDidMount: function () {
		this.taskRefs = [];

		var json = $.getJSON("que-interactive.txt", this.gotData);

		// Captivate emulator
		window.cpAPIInterface = this;
		window.cpAPIEventEmitter = this;

		$(window).resize(this.onResize);

		this.paused = false;

		this.onResize();
	},

	onResize: function () {
		var wh = $(window).outerHeight();
		var qp = $(".que-player");

		// assuming 4:3
		var ww = (wh * (4/3));

		qp.height(wh).width(ww);

		this.setState( { size: { width: ww, height: wh } } );
	},

	componentWillMount: function () {
		this.listeners = [];
	},

	componentDidUpdate: function () {
		if (this.state.started) {
			$("body").css("background-color", "rgba(0, 0, 0, 0)");
		} else {
			$("body").css("background-color", "black");
		}
	},

	createTask: function (item, index) {
		return <Task {...item} key={index}></Task>
	},

	onRef: function (task) {
		this.taskRefs[task.props.myKey] = task;
	},

	showCurrentTask: function () {
		if (this.state.tasks) {
			var item = this.state.tasks[this.state.currentTask];

			return <Task {...item} ref={this.onRef} myKey={this.state.currentTask} key={this.state.currentTask} mode={this.state.mode} onComplete={this.onTaskComplete} onTogglePause={this.onTogglePause} started={this.state.started}></Task>;
		} else {
			return <p>Loading</p>;
		}
	},

	render: function () {
		return (
			<div className="que-player">
				{ this.showCurrentTask() }
			</div>
		);
	},

	onTaskComplete: function () {
		this.trigger("QUE_COMPLETE");
	},

	onTogglePause: function () {
		if (this.paused) {
			this.play();
		} else {
			this.pause();
		}
	},

	trigger: function (event) {
		for (var i = 0; i < this.listeners.length; i++) {
			var l = this.listeners[i];
			if (l.event == event) {
				l.callback(event);
			}
		}
	},

	// **** Captivate emulation:

	pause: function () {
		var task = this.taskRefs[this.state.currentTask];
		if (task) {
			task.pause();
		}

		this.paused = true;
	},

	start: function () {
		this.setState( { started: true } );
	},

	play: function () {
		var task = this.taskRefs[this.state.currentTask];
		if (task) {
			task.resume();
		}

		this.paused = false;
	},

	addEventListener (event, callback) {
		this.listeners.push( { event: event, callback: callback } );
	},

	getCurrentSlideIndex: function ()  {
		var task = this.taskRefs[this.state.currentTask];
		if (task) {
			return task.getCurrentStepIndex();
		}

		return undefined;
	},

	getNumberOfSlides: function () {
		var task = this.taskRefs[this.state.currentTask];
		if (task) {
			return task.getNumberOfSteps();
		}

		return undefined;
	}
});