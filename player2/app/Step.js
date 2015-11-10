define(["./Hotspot"], function (Hotspot) {
	function Step (options) {
		this.options = options;

		this.data = options.data;
		this.task = options.task;

		this.key = options.key;

		this.scale = 1;

		this.isCurrent = false;
		this.complete = false;
	}

	Step.prototype = {
		constructor: Step,

		applyImageScale: function () {
			var img = this.img;

			// THEORY: assuming all images are "wide" format to stop images from running over if different aspect ratios are used
			$(img).addClass("wide");
			this.scale = img.width() / img[0].naturalWidth;

			this.hotspot.setScale(this.scale);

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
			/*
			if (img.height && this.state.scale !== scale) {
				this.setState({ scale: scale });
			}
			*/
		},

		getDOM: function () {
			var classes = "step";

			/*
			if (!this.props.current)// || this.props.finished)
				classes += " inviso";
			else
				classes += " current";

			if (this.props.started)
				classes += " started";
			*/

			if (this.data.trigger == "text") {
				classes += " text-input";
			}

			var div = $("<div>", { class: classes });
			div.click($.proxy(this.onClickStep, this));

			if (this.data.audio) {
				var a = $("<audio>").attr("data-src", this.data.audio);
				a.on("ended", $.proxy(this.onAudioPlayed, this));
				a.on("loadedmetadata", $.proxy(this.onAudioLoaded, this));
				div.append(a);
				this.audio = a;
			}

			var img = $("<img>", { src: this.data.image, class: "step-image" });
			this.img = img;
			div.append(img);

			var hotspot = new Hotspot( { step: this, trigger: this.data.trigger, rect: this.data.rect, scale: this.scale } );
			div.append(hotspot.getDOM());
			this.hotspot = hotspot;

			var textToUse = this.data.shortText ? "<p>" + this.data.shortText + "</p>" : this.data.text;
			var p = $("<p>", { class: "step-text", html: textToUse });
			div.append(p);
			this.textBox = p;

			var arrow = $("<div>", { class: "step-arrow" });
			div.append(arrow);
			this.arrow = arrow;

			this.el = div;

			$(document).keydown($.proxy(this.onKeyDown, this));

			return div;

			/*
			<div className={classes} onClick={this.onClickStep}>
				{audio}
				<img ref="myImage" className="step-image" src={this.props.image}/>
				<Hotspot ref="myHotspot" scale={this.state.scale} rect={this.props.rect} trigger={this.props.trigger} mode={this.props.mode} onStepComplete={this.onStepComplete} onStepHint={this.showHint}
					input={this.props.input} />
				<p ref="myText" className="step-text inviso" dangerouslySetInnerHTML={createMarkup(textToUse)}></p>
				<div className="step-arrow" ref="myArrow"></div>
			</div>
			*/
		},

		refresh: function (options) {
			this.el.show(0);

			this.applyImageScale();

			this.positionText();

			this.isCurrent = options.isCurrent;

			if (options.isCurrent || options.isLast) {
				this.el.show(0);
			} else {
				this.el.hide(0);
			}
		},

		onKeyDown: function (evt) {
			var task = this.options.task;

			if (task && !task.getValue("paused")) {
				if (this.options.mode == "try" && this.isCurrent) {
					if (this.data.trigger == "enter" && !this.complete) {
						if (evt.keyCode == 13) {
							this.task.onStepComplete({step: this, advance: true});
							evt.stopImmediatePropagation();
						} else {
							this.showHint();
						}
					}
				}
			}
		},

		onAudioLoaded: function (evt) {
			this.audioLoaded = true;
			this.beginPlayback();
		},

		onAudioPlayed: function (evt) {
			this.audioComplete = true;

			if (this.task) {
				if (this.options.mode == "watch") {
					this.task.playCursor(this);
				} else if (this.options.mode == "try") {
					if (this.data.trigger == "none") {
						this.task.onStepComplete({ step: this, advance: true });
					}
				}
			}
		},

		beginPlayback: function () {
			this.playAudio();
		},

		stop: function () {
			this.stopAudio();
		},

		onClickStep: function (evt) {
			if (this.isFinished()) return;
			if (!this.isStarted()) return;

			if (this.options.mode == "try") {
				// if there is no Hotspot, a click anywhere will advance us
				if (!this.data.rect) {
					this.task.onStepComplete({ step: this, advance: true });
				} else if (!this.complete && this.data.trigger != "text") {
					this.showHint();
				}
			}
		},

		positionText: function () {
			this.textBox.hide(0).removeClass("inviso animated hinted fadeInLeft fadeInRight fadeInDown fadeInUp");

			var me = this;

			var holder = this.el.parents(".step-holder");

			// THEORY: find out where there's the most room and put the text box there
			if (this.data.rect) {
				var w = holder.width(), h = holder.height();

				var r = this.data.rect.split(",");
				var rect = $.map(r, function (item, index) { return parseInt(item) * me.scale; });

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
				var current = this.hotspot.getDOM().css("display");

				this.hotspot.getDOM().css("display", "block");

				this.textBox.show(0).position({my: my, at: at, of: this.hotspot.getDOM(), collision: "fit"});

				var txt_pos = this.textBox.position();
				var txt_height = this.textBox.outerHeight();
				var txt_width = this.textBox.outerWidth();

				this.arrow.removeClass("arrow-right arrow-bottom arrow-left arrow-top").addClass(arrows);

				this.textBox.hide(0);
				this.arrow.hide(0);

				this.hotspot.getDOM().css("display", current);

				this.textDirection = largest;

				// align arrows to the middle of the hotspot

				var offset = undefined, direction = "";

				switch (largest) {
					case "left":
						var box_mid = txt_pos.top + txt_height * .5;
						var hotspot_mid = this.hotspot.getDOM().position().top + this.hotspot.getDOM().height() * .5;
						offset = Math.round(hotspot_mid - txt_pos.top);
						this.arrow.css({ left: txt_pos.left + txt_width, top: txt_pos.top + offset });
						break;
					case "right":
						var box_mid = txt_pos.top + txt_height * .5;
						var hotspot_mid = this.hotspot.getDOM().position().top + this.hotspot.getDOM().height() * .5;
						offset = Math.round(hotspot_mid - txt_pos.top);
						this.arrow.css({ left: txt_pos.left, top: txt_pos.top + offset });
						break;
					case "top":
						var box_mid = txt_pos.left + txt_width * .5;
						var hotspot_mid = this.hotspot.getDOM().position().left + this.hotspot.getDOM().width() * .5;
						offset = Math.round(hotspot_mid - txt_pos.left);
						this.arrow.css({ left: txt_pos.left + offset, top: txt_pos.top + txt_height });
						break;
					case "bottom":
						var box_mid = txt_pos.left + txt_width * .5;
						var hotspot_mid = this.hotspot.getDOM().position().left + this.hotspot.getDOM().width() * .5;
						offset = Math.round(hotspot_mid - txt_pos.left);
						this.arrow.css({ left: txt_pos.left + offset, top: txt_pos.top });
						break;
				}
			} else {
				this.textBox.position({my: "center center", at: "center center", of: holder, collision: "fit"});
			}
		},

		getAudioDuration: function () {
			if (this.audio) {
				return this.audio[0].duration * 1000;
			} else
				return 0;
		},

		play: function () {
			if (!this.audioLoaded)
				this.loadAudio();
			else {
				this.beginPlayback();
			}

			this.showTextAndTarget();
		},

		loadAudio: function () {
			// loading the audio this way seemed to work better cross-browser than putting it directly in the src
			if (this.audio) {
				this.audio.attr("src", null);
				this.audio.attr("src", this.audio.attr("data-src"));
			}
		},

		playAudio: function () {
			if (this.audio) {
				this.audioComplete = false;

				this.audio[0].play();
			}
		},

		stopAudio: function () {
			if (this.audio && this.audio[0].src) {
				this.audio[0].currentTime = 0;
				this.audio[0].pause();
			}
		},

		showTextAndTarget: function () {
			if (this.textBox) {
				this.textBox.hide(0).removeClass("inviso animated hinted fadeInLeft fadeInRight fadeInDown fadeInUp");

				//if (!this.props.finished)
				this.textBox.addClass("animated fadeIn").show(0);
			}

			if (this.arrow) {
				this.arrow.hide(0).removeClass("animated fadeInLeft fadeInRight fadeInDown fadeInUp");

				//if (!this.props.finished)
				this.arrow.addClass("animated fadeIn").show(0);
			}

			if (this.hotspot) {
				var hotspot = this.hotspot.getDOM();
				if (this.options.mode == "watch") {
					hotspot.css({opacity: 1}).hide(0).removeClass("animated");

					//if (!this.props.finished) {
					if (this.data.trigger == "text") {
						hotspot.delay(1500).show(0);
					} else {
						hotspot.delay(1500).addClass("animated tada").show(0);
					}
					//}
				} else {
					if (this.data.trigger != "text")
						hotspot.css({opacity: 0});
					else {
						hotspot.css({opacity: 1});
						hotspot.find("input").focus();
					}
				}
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

			if (this.textBox) {
				this.textBox.removeClass("animated fadeIn").hide(0).addClass("hinted animated " + animation).show(0);

				this.arrow.removeClass("animated fadeIn").hide(0).addClass("animated " + animation).show(0);
			}
		},

		onComplete: function (options) {
			this.task.onStepComplete(options);
		},

		isStarted: function () {
			if (this.task) return this.task.getValue("started");
			else return false;
		},

		isFinished: function () {
			if (this.task) return this.task.getValue("finished");
			else return false;
		},

		typeText: function () {
			var hotspot = this.hotspot.getDOM();

			hotspot.typeText();
		}

	};

	return Step;
});