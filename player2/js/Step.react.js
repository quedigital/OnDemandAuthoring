var Step = React.createClass({
	getInitialState: function () {
		return {
			scale: 1.0
		};
	},

	findImageScale: function() {
		var img = this.refs.myImage.getDOMNode();

		var scale;

		// THEORY: assuming all images are "wide" format to stop images from running over if different aspect ratios are used
		$(img).addClass("wide");
		scale = $(img).width() / img.naturalWidth;

		/*
		var aspect = img.naturalWidth / img.naturalHeight;
		if (aspect < 1.333) {
			$(img).addClass("wide");
			scale = $(img).width() / img.naturalWidth;
		} else {
			$(img).addClass("tall");
			scale = $(img).height() / img.naturalHeight;
		}
		*/

		// Only report changed size to avoid infinite recursion
		if (img.height && this.state.scale !== scale) {
			this.setState({ scale: scale });
		}
	},

	componentDidMount: function () {
		$(document).keydown(this.onKeyDown);

		if (this.refs.myAudio) {
			var audio = this.refs.myAudio.getDOMNode();
			audio.addEventListener("ended", this.onAudioPlayed);
			audio.addEventListener("loadedmetadata", this.onAudioLoaded);
		}

		this.findImageScale();

		if (this.props.current) {
			this.positionText();

			this.props.onCurrent(this);

			if (this.props.started) {
				this.showTextAndTarget();

				this.playAudio();
			}
		}

		this.complete = false;
		this.audioPlayed = false;
	},

	componentWillUnmount: function () {
		if (this.refs.myAudio) {
			var audio = this.refs.myAudio.getDOMNode();
			audio.removeEventListener("ended", this.onAudioPlayed);
			audio.removeEventListener("loadedmetadata", this.onAudioLoaded);
		}

		$(document).off("keydown", this.onKeyDown);
	},

	componentWillUpdate: function () {
		if (this.props.finished) {
			// reset the audio so it will play and pause again
			if (this.props.audio) {
				var audio = this.refs.myAudio.getDOMNode();
				audio.currentTime = 0;
			}
		}
	},

	componentDidUpdate: function () {
		this.findImageScale();

		if (this.props.current) {
			this.positionText();

			this.props.onCurrent(this);

			if (this.props.started) {
				this.showTextAndTarget();

				if (!this.audioPlayed && !this.complete) {
					this.playAudio();
				}
			}
		} else {
			// if we're on a different step, be sure to play the audio next time we're on this step again
			this.audioPlayed = false;
		}

		this.complete = false;
	},

	playAudio: function () {
		if (this.props.audio) {
			var audio = this.refs.myAudio.getDOMNode();
			audio.currentTime = 0;
			audio.play();
		}
	},

	onAudioPlayed: function () {
		this.audioPlayed = true;

		if (this.props.mode == "watch") {
			this.props.onAudioComplete(this);
		} else {
			if (!this.props.rect)
				this.props.onAudioComplete(this);
		}
	},

	onAudioLoaded: function (event) {
		if (this.props.current) {
			// refresh when audio is loaded
			this.props.onCurrent(this);
		}
	},

	onKeyDown: function (event) {
		if (this.props.finished) return;

		if (this.props.mode == "try" && this.props.current) {
			if (this.props.trigger == "enter" && !this.complete) {
				if (event.keyCode == 13) {
					this.props.onStepComplete(this, true);
					event.stopImmediatePropagation();
				} else {
					this.showHint();
				}
			}
		}
	},

	showTextAndTarget: function () {
		if (this.refs.myText) {
			var txt = this.refs.myText.getDOMNode();
			// NOTE: React was leaving some old classes around
			$(txt).hide(0).removeClass("inviso animated hinted fadeInLeft fadeInRight fadeInDown fadeInUp");

			if (!this.props.finished)
				$(txt).addClass("animated fadeIn").show(0);
		}

		if (this.refs.myArrow) {
			var arrow = this.refs.myArrow.getDOMNode();
			$(arrow).hide(0).removeClass("animated fadeInLeft fadeInRight fadeInDown fadeInUp");

			if (!this.props.finished)
				$(arrow).addClass("animated fadeIn").show(0);
		}

		if (this.refs.myHotspot) {
			var hotspot = this.refs.myHotspot.getDOMNode();
			if (this.props.mode == "watch") {
				$(hotspot).css({opacity: 1}).hide(0).removeClass("animated");

				if (!this.props.finished) {
					if (this.props.trigger == "text") {
						$(hotspot).delay(1500).show(0);
					} else {
						$(hotspot).delay(1500).addClass("animated tada").show(0);
					}
				}
			} else {
				if (this.props.trigger != "text")
					$(hotspot).css({opacity: 0});
				else {
					$(hotspot).css({opacity: 1});
					$(hotspot).find("input").focus();
				}
			}
		}
	},

	render: function () {
		var classes = "step";

		if (!this.props.current)// || this.props.finished)
			classes += " inviso";
		else
			classes += " current";

		if (this.props.started)
			classes += " started";

		if (this.props.trigger == "text") {
			classes += " text-input";
		}

		var audio;
		if (this.props.audio) {
			audio = <audio ref="myAudio">
				<source src={this.props.audio}></source>
			</audio>;
		}

		function createMarkup (html) {
			return { __html: $(html).html() };
		}

		var textToUse = this.props.shortText ? "<p>" + this.props.shortText + "</p>" : this.props.text;

		if (!this.props.started) {
			// NOTE: need audio here for duration calculations and onCurrentStep triggering

			return (
				<div className={classes} onClick={this.onClickStep}>
					{audio}
					<img ref="myImage" className="step-image" src={this.props.image}/>
				</div>
			);
		} else {
			return (
				<div className={classes} onClick={this.onClickStep}>
				{audio}
					<img ref="myImage" className="step-image" src={this.props.image}/>
					<Hotspot ref="myHotspot" scale={this.state.scale} rect={this.props.rect} trigger={this.props.trigger} mode={this.props.mode} onStepComplete={this.onStepComplete} onStepHint={this.showHint}
						input={this.props.input} />
					<p ref="myText" className="step-text inviso" dangerouslySetInnerHTML={createMarkup(textToUse)}></p>
					<div className="step-arrow" ref="myArrow"></div>
				</div>
			);
		}
	},

	onStepComplete: function (step, advance) {
		this.complete = true;

		if (this.props.onStepComplete)
			this.props.onStepComplete(step, advance);
	},

	onClickStep: function (event) {
		if (this.props.finished) return;

		if (this.props.mode == "try") {
			// if there is no Hotspot, a click anywhere will advance us
			if (!this.props.rect) {
				this.props.onStepComplete(this, true);
			} else if (!this.complete && this.props.trigger != "text") {
				this.showHint();
			}
		}
	},

	positionText: function () {
		var self = this;

		if (!this.refs.myText) return;

		var txt = this.refs.myText.getDOMNode();

		var holder = $(txt).parents(".step-holder");

		// THEORY: find out where there's the most room and put the text box there
		if (this.props.rect) {
			var hotspot = this.refs.myHotspot.getDOMNode();
			var w = holder.width(), h = holder.height();

			var rect = this.props.rect.split(",");
			rect = $.map(rect, function (item, index) { return parseInt(item) * self.state.scale; });

			var free = {};

			free.left = rect[0] / w;
			free.top = rect[1] / h;
			free.right = (w - (rect[0] + rect[2])) / w;
			free.bottom = (h - (rect[1] + rect[3])) / h;

			function findLargestSide (obj) {
				var max = Math.max(obj.left, obj.top, obj.right, obj.bottom);
				if (max == obj.left) return "left";
				else if (max == obj.top) return "top";
				else if (max == obj.right) return "right";
				else if (max == obj.bottom) return "bottom";
			}

			var largest = findLargestSide(free);

			var my, at, arrows;

			switch (largest) {
				case "left":
					my = "right-20 center"; at = "left center"; arrows = "arrow arrow-right";
					break;
				case "top":
					my = "center bottom-20"; at = "center top"; arrows = "arrow arrow-bottom";
					break;
				case "right":
					my = "left+20 center"; at = "right center"; arrows = "arrow arrow-left";
					break;
				case "bottom":
					my = "center top+20"; at = "center bottom"; arrows = "arrow arrow-top";
					break;
			}

			// make the hotspot visible so it can be positioned around
			var current = $(hotspot).css("display");

			$(hotspot).css("display", "block");

			$(txt).show(0).position({my: my, at: at, of: hotspot, collision: "fit"});

			var txt_pos = $(txt).position();
			var txt_height = $(txt).outerHeight();
			var txt_width = $(txt).outerWidth();

			var arrow = this.refs.myArrow.getDOMNode();

			$(arrow).removeClass("arrow-right arrow-bottom arrow-left arrow-top").addClass(arrows);

			$(txt).hide(0);
			$(arrow).hide(0);

			$(hotspot).css("display", current);

			this.textDirection = largest;

			// align arrows to the middle of the hotspot

			var offset = undefined, direction = "";

			switch (largest) {
				case "left":
					var box_mid = txt_pos.top + txt_height * .5;
					var hotspot_mid = $(hotspot).position().top + $(hotspot).height() * .5;
					offset = Math.round(hotspot_mid - txt_pos.top);
					$(arrow).css({ left: txt_pos.left + txt_width, top: txt_pos.top + offset });
					break;
				case "right":
					var box_mid = txt_pos.top + txt_height * .5;
					var hotspot_mid = $(hotspot).position().top + $(hotspot).height() * .5;
					offset = Math.round(hotspot_mid - txt_pos.top);
					$(arrow).css({ left: txt_pos.left, top: txt_pos.top + offset });
					break;
				case "top":
					var box_mid = txt_pos.left + txt_width * .5;
					var hotspot_mid = $(hotspot).position().left + $(hotspot).width() * .5;
					offset = Math.round(hotspot_mid - txt_pos.left);
					$(arrow).css({ left: txt_pos.left + offset, top: txt_pos.top + txt_height });
					break;
				case "bottom":
					var box_mid = txt_pos.left + txt_width * .5;
					var hotspot_mid = $(hotspot).position().left + $(hotspot).width() * .5;
					offset = Math.round(hotspot_mid - txt_pos.left);
					$(arrow).css({ left: txt_pos.left + offset, top: txt_pos.top });
					break;
			}
		} else {
			$(txt).position({my: "center center", at: "center center", of: holder, collision: "fit"});
		}
	},

	showHint: function () {
		var animation;

		switch (this.textDirection) {
			case "left":
				animation = "fadeInLeft"; break;
			case "top":
				animation = "fadeInDown"; break;
			case "right":
				animation = "fadeInRight"; break;
			case "bottom":
				animation = "fadeInUp"; break;
		}

		if (this.refs.myText) {
			var txt = $(this.refs.myText.getDOMNode());
			txt.removeClass("animated fadeIn").hide(0).addClass("hinted animated " + animation).show(0);

			var arrow = $(this.refs.myArrow.getDOMNode());
			arrow.removeClass("animated fadeIn").hide(0).addClass("animated " + animation).show(0);
		}
	},

	pause: function () {
		if (this.props.audio) {
			var audio = this.refs.myAudio.getDOMNode();
			audio.pause();
		}
	},

	resume: function () {
		if (this.props.audio) {
			var audio = this.refs.myAudio.getDOMNode();
			if (audio.paused && !audio.ended) {
				audio.play();
			}
		}
	},

	getAudioDuration: function () {
		if (this.props.audio) {
			var audio = this.refs.myAudio.getDOMNode();
			return audio.duration * 1000;
		} else
			return 0;
	},

	typeText: function () {
		var hotspot = this.refs.myHotspot;

		if (hotspot) {
			hotspot.typeText();
		}
	}
});