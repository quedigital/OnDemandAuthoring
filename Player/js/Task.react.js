var Task = React.createClass({
	getInitialState: function () {
		var initialStep = this.getStepByIndex(0);

		return {
			currentStep: initialStep,
			finished: false
		};
	},

	// THEORY: storing references to steps here to update our state based on them (bad practice?)
	onRef: function (param) {
		if (param)
			this.refList[param.props.myKey] = param;
	},

	getCurrentStep: function () {
		return this.refList[this.state.currentStep];
	},

	createStep: function (item, index) {
//		var current = (index == this.state.currentStep) && (!this.state.finished);
		var current = (index == this.state.currentStep);

		return <Step {...item} myKey={index} ref={this.onRef} current={current} key={index} onAudioComplete={this.onAudioComplete} onStepComplete={this.onStepComplete} onCurrent={this.onCurrentStep} mode={this.props.mode} lastMouse={this.lastMouse} started={this.props.started} finished={this.state.finished}></Step>
	},

	componentWillUpdate: function () {
		this.stopAllAudio();
	},

	componentDidUpdate: function () {
		this.positionButton();

		// don't setup now; setup when we're "current"
		//this.setupForStep();
	},

	componentWillMount: function () {
		this.refList = [];

		// QUESTION: should these be states?
		this.lastMouse = { x: 0, y: 0 };
		this.awaitingCursor = false;
		this.awaitingAudio = false;
		this.cursorArrived = false;
		this.audioArrived = false;
	},

	componentDidMount: function () {
		var el = $(this.getDOMNode()).find(".step-holder");

		this.lastMouse = { x: el.width() * .5, y: el.height() * .5 };

		this.positionButton();

		//this.setupForStep();
	},

	render: function () {
		if (this.state.currentStep) {
			var controls;
			var step = this.props.steps[this.state.currentStep];
			if (!step.rect && !step.audio) {
				controls = (
					<button id="continue-button" className="btn btn-success" onClick={this.doAdvance}>Continue</button>
				);
			}
		}

		var hide = this.state.finished;

		var overlay_button;
		var classes = "btn " + this.props.mode;

		if (this.state.finished) {
			overlay_button = (
				<button id="overlay-button" className={classes} onClick={this.onClickRepeat}><i className="fa fa-3x fa-repeat"></i></button>
			)
		} else if (!this.props.started) {
			overlay_button = (
				<button id="overlay-button" className={classes} onClick={this.onClickPlay}><i className="fa fa-3x fa-play"></i></button>
			)
		}

		return (
			<div className="que-task">
				<div className="step-holder" onClick={this.onClickTask}>
					{ $.map(this.props.steps, this.createStep) }
				</div>
				{controls}
				<Mousetrail hidden={hide} ref="myMouse"></Mousetrail>
				{overlay_button}
				<img id="enter-key" src="images/enter-key.png"/>
				<audio ref="myClickSound"><source src="sounds/mouseclick.mp3"></source></audio>
			</div>
		);

		// debug buttons:
		//				<button className="btn btn-primary" onClick={this.onClickPrevStep}>Prev</button>
		//      		<button className="btn btn-success" onClick={this.onClickNextStep}>Next</button>
	},

	onClickTask: function () {
		if (this.props.mode == "watch") {
			this.props.onTogglePause();
		}
	},

	onClickRepeat: function () {
		var el = $(this.getDOMNode()).find(".step-holder");

		this.lastMouse = { x: el.width() * .5, y: el.height() * .5 };
		var myMouse = this.refs.myMouse;
		var cursor = $(myMouse.getDOMNode());
		cursor.css({ left: this.lastMouse.x, top: this.lastMouse.y });

		var step = this.getStepByIndex(0);
		if (step) {
			this.setState({ finished: false, currentStep: step });
		}
	},

	onClickPlay: function () {
		this.props.onStart();
	},

	pause: function () {
		var step = this.getCurrentStep();
		if (step)
			step.pause();

		createjs.Ticker.setPaused(true);
	},

	resume: function () {
		var step = this.getCurrentStep();
		if (step)
			step.resume();

		createjs.Ticker.setPaused(false);
	},

	onClickPrevStep: function () {
		if (this.props.started && !this.state.finished) {
			var currentIndex = this.getIndexOfStep(this.state.currentStep);
			if (currentIndex > 0) {
				this.doRewind();
			}
		}
	},

	onClickNextStep: function () {
		if (this.props.started && !this.state.finished) {
			var currentIndex = this.getIndexOfStep(this.state.currentStep);
			if (currentIndex < this.getNumberOfSteps() - 1) {
				this.doAdvance();
			}
		}
	},

	getNumberOfSteps: function () {
		var counter = 0;
		for (key in this.props.steps)
			counter++;
		return counter;
	},

	getIndexOfStep: function (step) {
		var counter = 0;
		for (index in this.props.steps) {
			if (index == step) return counter;
			counter++;
		}
		return this.getNumberOfSteps();
	},

	getStepByIndex: function (index) {
		var counter = 0;
		for (key in this.props.steps) {
			if (index == counter) return key;
			counter++;
		}
		return null;
	},

	getCurrentStepIndex: function () {
		return this.getIndexOfStep(this.state.currentStep);
	},

	gotoStep: function (key) {
		createjs.Tween.removeAllTweens();

		var step = this.props.steps[key];
		if (step) {
			this.resume();
			this.setState({ finished: false, currentStep: key });
		}
	},

	doRewind: function () {
		createjs.Tween.removeAllTweens();

		var currentIndex = this.getIndexOfStep(this.state.currentStep);
		if (currentIndex > 0) {
			var prevStep = this.getStepByIndex(currentIndex - 1);

			this.setState({currentStep: prevStep});
		}
	},

	doAdvance: function () {
		createjs.Tween.removeAllTweens();

		var currentIndex = this.getIndexOfStep(this.state.currentStep);
		if (currentIndex < this.getNumberOfSteps() - 1) {
			var nextStep = this.getStepByIndex(currentIndex + 1);

			this.setState({currentStep: nextStep});
		} else {
			this.props.onComplete();
			this.setState({finished: true});
		}
	},

	onAudioComplete: function (step) {
		this.audioArrived = true;
		this.checkForAdvance();
	},

	onCursorComplete: function () {
		this.cursorArrived = true;
		this.checkForAdvance();
	},

	checkForAdvance: function () {
		if ( (!this.awaitingAudio || this.audioArrived) && (!this.awaitingCursor || this.cursorArrived) )
			this.doAdvance();
	},

	onStepComplete: function (step, advance) {
		if (advance) {
			this.doAdvance();
		}
	},

	onCurrentStep: function (step) {
		if (this.props.onCurrent) {
			this.props.onCurrent(step.props.myKey);
		}

		this.setupForStep();
	},

	setupForStep: function () {
		if (this.props.mode == "watch" && this.props.started) {
			var step = this.getCurrentStep();

			if (step && step.props.rect) {
				var center = Hotspot.getCenterOfRect(step.props.rect, step.state.scale);
				var myMouse = this.refs.myMouse;
				var cursor = $(myMouse.getDOMNode());

				var distance = Math.sqrt((center.x - this.lastMouse.x) * (center.x - this.lastMouse.x) + (center.y - this.lastMouse.y) * (center.y - this.lastMouse.y));
				// THEORY: cursor speed is based on window height
				var time = Math.max((distance / $(window).height()) * 3000, 1000);

				var delay = Math.max(step.getAudioDuration() - 250, 0);

				// NOTE: don't set up the cursor animation until we have an audio duration
				if (!isNaN(delay) && (center.x != this.lastMouse.x || center.y != this.lastMouse.y) ) {
					createjs.Tween.get(cursor[0])
						.set({display: "none"}, cursor[0].style)
						.wait(delay)
						.set({display: "block", left: this.lastMouse.x, top: this.lastMouse.y}, cursor[0].style)
						.to({left: center.x, top: center.y}, time, createjs.Ease.quadInOut)
						.call(this.doTrigger, null, this);

					this.lastMouse.x = center.x;
					this.lastMouse.y = center.y;
				}
			} else {
				var cursor = this.refs.myMouse;
				if (cursor)
					cursor.hide();
			}

			if (step) {
				this.awaitingCursor = step.props.rect != undefined;
				this.cursorArrived = false;
				this.awaitingAudio = step.props.audio != undefined;
				this.audioArrived = false;
			}
		} else {
			if (this.refs.myMouse) {
				var cursor = this.refs.myMouse;
				cursor.hide();
			}
		}
	},

	positionButton: function () {
		var el = $(this.getDOMNode());
		var btn = el.find("#continue-button");

		var step = el.find(".step.current");

		if (btn.length) {
			var text = step.find(".step-text");
			btn.hide(0).position({ my: "center top+20", at: "center bottom", of: text, collision: "none" }).addClass("animated fadeIn").animate( { _justDelay: 0 }, 1000, function () { btn.show(0); } );
		}

		btn = el.find("#overlay-button");
		if (btn.length) {
			btn.position({ my: "center center", at: "center center", of: el, collision: "none" });
		}
	},

	stopAllAudio: function () {
		$("audio").map(function (index, item) { item.pause(); });
	},

	playClickSound: function () {
		this.refs.myClickSound.getDOMNode().currentTime = 0;
		this.refs.myClickSound.getDOMNode().play();
	},

	doTrigger: function () {
		var step = this.getCurrentStep();
		if (step) {
			switch (step.props.trigger) {
				case "click":
					this.clickMouseCursor();
					break;
				case "double-click":
					this.doubleClickMouseCursor();
					break;
				case "hover":
					this.hoverMouseCursor();
					break;
				case "enter":
					this.pressEnter();
					break;
				case "text":
					this.typeText();
					break;
			}
		}
	},

	clickMouseCursor: function () {
		var myMouse = this.refs.myMouse;
		var cursor = $(myMouse.getDOMNode());
		createjs.Tween.get(cursor[0])
			.wait(100)
			.set( { transform: "scale(.7)"}, cursor[0].style )
			.call(this.playClickSound, null, this)
			.wait(100)
			.set( { transform: "scale(1)"}, cursor[0].style )
			.wait(300)
			.call(this.onCursorComplete, null, this);
	},

	doubleClickMouseCursor: function () {
		var myMouse = this.refs.myMouse;
		var cursor = $(myMouse.getDOMNode());
		createjs.Tween.get(cursor[0])
			.wait(100)
			.set( { transform: "scale(.7)"}, cursor[0].style )
			.call(this.playClickSound, null, this)
			.wait(100)
			.set( { transform: "scale(1)"}, cursor[0].style )
			.wait(150)
			.set( { transform: "scale(.7)"}, cursor[0].style )
			.call(this.playClickSound, null, this)
			.wait(100)
			.set( { transform: "scale(1)"}, cursor[0].style )
			.wait(300)
			.call(this.onCursorComplete, null, this);
	},

	hoverMouseCursor: function () {
		var myMouse = this.refs.myMouse;
		var cursor = $(myMouse.getDOMNode());
		createjs.Tween.get(cursor[0])
			.wait(300)
			.call(this.onCursorComplete, null, this);
	},

	pressEnter: function () {
		this.showCursor(false);

		var enter = $("#enter-key");

		createjs.Tween.get(enter[0])
			.wait(750)
			.call(this.showEnterKey, [true])
			.wait(750)
			.set( { transform: "translate(-50%, -50%) scale(.8)"}, enter[0].style )
			.call(this.playClickSound, null, this)
			.wait(100)
			.set( { transform: "translate(-50%, -50%) scale(1)"}, enter[0].style )
			.wait(500)
			.call(this.onCursorComplete, null, this)
			.call(this.showEnterKey, [false]);
	},

	showEnterKey: function (visible) {
		if (visible) {
			var step = this.getCurrentStep();

			if (step && step.props.rect) {
				var center = Hotspot.getCenterOfRect(step.props.rect, step.state.scale);
				$("#enter-key").css({left: center.x, top: center.y}).show(0);
			}
		} else {
			$("#enter-key").hide(0);
		}
	},

	showCursor: function (visible) {
		var cursor = this.refs.myMouse;
		if (visible) {
			cursor.show();
		} else {
			cursor.hide();
		}
	},

	typeText: function () {
		var step = this.getCurrentStep();
		if (step) {
			step.typeText();
		}
	}
});