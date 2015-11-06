define(["./MouseTrail", "./Step", "./Hotspot"], function (MouseTrail, Step, Hotspot) {
	function Task (options) {
		this.el = undefined;

		this.options = options;

		this.stepDatas = options.steps;
		this.steps = [];

		this.currentStep = 0;

		this.values = {};
	}

	Task.prototype = {
		constructor: Task,

		getDOM: function () {
			if (!this.el) {
				var div = $("<div>", {class: "que-task"});

				var stepholder = $("<div>", {class: "step-holder"});
				stepholder.click($.proxy(this.onClickTask));
				div.append(stepholder);

				for (var each in this.stepDatas) {
					var stepData = this.stepDatas[each];

//				return <Step {...item} myKey={index} ref={this.onRef} current={current} key={index} onAudioComplete={this.onAudioComplete} onStepComplete={this.onStepComplete} onCurrent={this.onCurrentStep} mode={this.props.mode} lastMouse={this.lastMouse} started={this.props.started} finished={this.state.finished}></Step>

					var step = new Step( { mode: this.options.mode, data: stepData, task: this } );
					stepholder.append(step.getDOM());
					this.steps.push(step);
				}

				var btn = $("<button>", {class: "btn btn-success", id: "continue-button", text: "Continue"}).hide(0);
				this.continueButton = btn;
				btn.click($.proxy(this.doAdvance, this));
				div.append(btn);

				var mousetrail = new MouseTrail();
				div.append(mousetrail.getDOM());
				this.myMouse = mousetrail;

				btn = $("<button>", { class: "btn", id: "overlay-button" }).hide(0);
				btn.append($("<i>", { class: "fa fa-3x fa-repeat"}));
				btn.click($.proxy(this.onClickRepeat, this));
				this.overlayButton = btn;
				div.append(btn);

				var img = $("<img>", {src: "images/enter-key.png", id: "enter-key"});
				this.enterKey = img;
				div.append(img);

				var audio = $("<audio>", {src: "sounds/mouseclick.mp3"});
				this.clickSound = audio;
				div.append(audio);

				this.el = div;
			}

			return this.el;

			//<div className="que-task">
			//	<div className="step-holder" onClick={this.onClickTask}>
			//		{ $.map(this.props.steps, this.createStep) }
			//	</div>
			//	{controls}
			//	<Mousetrail hidden={hide} ref="myMouse"></Mousetrail>
			//	{overlay_button}
			//	<img id="enter-key" src="images/enter-key.png"/>
			//	<audio ref="myClickSound"><source src="sounds/mouseclick.mp3"></source></audio>
			//</div>
		},

		getValue: function (key) {
			return this.values[key];
		},

		setValue: function (key, value) {
			this.values[key] = value;
		},

		setCurrentStep: function (index) {
			this.currentStep = index;
		},

		getCurrentStep: function () {
			return this.steps[this.currentStep];
		},

		refresh: function () {
			for (var i = 0; i < this.steps.length; i++) {
				var current = i == this.currentStep;
				this.steps[i].refresh( { isCurrent: current } );

				if (this.getValue("started") && !this.getValue("paused")) {
					if (current) {
						this.playStep(this.steps[i]);
					}
				}
			}

			this.myMouse.getDOM().hide(0);

			this.positionButtons();
		},

		playCursor: function (step) {
			// if we're paused, don't play the cursor
			if (this.getValue("paused")) return;

			createjs.Tween.removeAllTweens();

			if (this.options.mode == "watch" && this.getValue("started") && !this.getValue("finished")) {
				if (step && step.data.rect) {
					var center = Hotspot.getCenterOfRect(step.data.rect, step.scale);

					var cursor = this.myMouse.getDOM();

					var el = this.getDOM().find(".step-holder");

					var centerPos = {x: el.width() * .5, y: el.height() * .5};
					cursor.css({left: centerPos.x, top: centerPos.y});

					var distance = Math.sqrt((center.x - centerPos.x) * (center.x - centerPos.x) + (center.y - centerPos.y) * (center.y - centerPos.y));
					var time = distance / 500 * 1000;
					time = Math.max(Math.min(time, 2000), 500);

					if (step.data.trigger == "none") {
						// THEORY: a "none" trigger doesn't need the cursor
						this.doTrigger();
					} else {
						createjs.Tween.get(cursor[0])
							.set({display: "none"}, cursor[0].style)
							//.wait(delay)
							.set({display: "block", left: centerPos.x, top: centerPos.y}, cursor[0].style)
							.to({left: center.x, top: center.y}, time, createjs.Ease.quadInOut);

						if (this.taskAdvance) {
							clearTimeout(this.taskAdvance);
						}

						// using a timeout instead of the tween (b/c tween seemed buggy, perhaps)
						this.taskAdvance = setTimeout($.proxy(this.doTrigger, this), time);
					}
				} else {
					this.myMouse.getDOM().hide();
				}
			}
		},

		playStep: function (step) {
			if (step) {
				step.play();
			} else {
				this.myMouse.getDOM().hide();
			}
		},

		onClickTask: function (evt) {
		},

		doAdvance: function () {
			createjs.Tween.removeAllTweens();

			var step = this.getCurrentStep();
			step.stop();

			this.currentStep++;

			if (this.currentStep >= this.steps.length) {
				if (this.options.player) {
					this.options.player.onComplete();
					this.setValue("finished", true);
				}
			}

			this.refresh();
		},

		play: function () {
			this.setValue("paused", false);

			this.refresh();
		},

		pause: function () {
			if (this.taskAdvance) {
				clearTimeout(this.taskAdvance);
			}

			this.setValue("paused", true);

			var step = this.getCurrentStep();
			if (step)
				step.stop();

			this.refresh();
		},

		doTrigger: function () {
			var step = this.getCurrentStep();
			if (step) {
				switch (step.data.trigger) {
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
					case "none":
						this.doNoneTriggerPause();
						break;
				}
			}
		},

		playClickSound: function () {
			this.clickSound[0].currentTime = 0;
			this.clickSound[0].play();
		},

		clickMouseCursor: function () {
			var cursor = this.myMouse.getDOM();
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
			var cursor = this.myMouse.getDOM();
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
			var cursor = this.myMouse.getDOM();
			createjs.Tween.get(cursor[0])
				.wait(300)
				.call(this.onCursorComplete, null, this);
		},

		doNoneTriggerPause: function () {
			var cursor = this.myMouse.getDOM();
			createjs.Tween.get(cursor[0])
				.wait(500)
				.call(this.onCursorComplete, null, this);
		},

		pressEnter: function () {
			this.showCursor(false);

			createjs.Tween.get(this.enterKey[0])
				.wait(750)
				.call($.proxy(this.showEnterKey, this, true))
				.wait(750)
				.set( { transform: "translate(-50%, -50%) scale(.8)"}, this.enterKey[0].style )
				.call(this.playClickSound, null, this)
				.wait(100)
				.set( { transform: "translate(-50%, -50%) scale(1)"}, this.enterKey[0].style )
				.wait(500)
				.call(this.onCursorComplete, null, this)
				.call($.proxy(this.showEnterKey, this, false));
		},

		showEnterKey: function (visible) {
			if (visible) {
				var step = this.getCurrentStep();

				if (step && step.data.rect) {
					var center = Hotspot.getCenterOfRect(step.data.rect, step.scale);
					this.enterKey.css({left: center.x, top: center.y}).show(0);
				}
			} else {
				this.enterKey.hide(0);
			}
		},

		showCursor: function (visible) {
			var cursor = this.myMouse.getDOM();
			if (visible) {
				cursor.show();
			} else {
				cursor.hide();
			}
		},

		onCursorComplete: function () {
			this.checkForAdvance();
		},

		onAudioComplete: function () {
		},

		checkForAdvance: function () {
			this.doAdvance();
		},

		onStepComplete: function (options) {
			if (options.advance) {
				this.doAdvance();
			}
		},

		onClickNextStep: function () {
			createjs.Tween.removeAllTweens();

			var step = this.getCurrentStep();
			if (step) step.stop();

			//if (this.getValue("started") && !this.getValue("finished")) {
				if (this.currentStep < this.steps.length - 1) {
					this.currentStep++;
					this.refresh();
				}
			//}
		},

		onClickPreviousStep: function () {
			createjs.Tween.removeAllTweens();

			var step = this.getCurrentStep();
			if (step) step.stop();

			//if (this.getValue("started") && !this.getValue("finished")) {
				if (this.currentStep > 0) {
					this.currentStep--;
					this.refresh();
				}
			//}
		},

		positionButtons: function () {
			var step = this.getCurrentStep();

			if (step && step.textBox) {
				var btn = this.continueButton;
				btn.hide(0);
				/*
				// figure out when the continue button should show up
				btn.hide(0).position({ my: "center top+20", at: "center bottom", of: step.textBox, collision: "none" }).addClass("animated fadeIn").animate( { _justDelay: 0 }, 1000, function () { btn.show(0); } );
				*/
			}

			if (!this.getValue("started")) {
				this.overlayButton.find("i").removeClass("fa-repeat").addClass("fa-play");
				this.overlayButton.show(0);
			} else if (this.getValue("finished")) {
				this.overlayButton.find("i").removeClass("fa-play").addClass("fa-repeat");
				this.overlayButton.show(0);
			} else {
				this.overlayButton.hide(0);
			}

			this.overlayButton.position({ my: "center center", at: "center center", of: this.el, collision: "none" });
		},

		onClickRepeat: function (evt) {
			if (this.options.player) {
				this.currentStep = 0;
				this.setValue("finished", false);
				this.options.player.onClickRepeat();
			}
		}
	};

	return Task;
});
