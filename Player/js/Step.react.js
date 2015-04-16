var Step = React.createClass({
	getInitialState: function () {
		return {
			scale: 1.0
		};
	},

	findImageScale: function() {
		var img = this.refs.myImage.getDOMNode();

		var scale = img.height / img.naturalHeight;

		// Only report changed size to avoid infinite recursion
		if (img.height && this.state.scale !== scale) {
			this.setState({ scale: scale });
		}
	},

	componentDidMount: function () {
		if (this.refs.myAudio) {
			var audio = this.refs.myAudio.getDOMNode();
			console.log("trying");
			console.log(audio);
			audio.addEventListener("ended", this.onAudioPlayed);
		}

		if (this.props.current) {
			this.findImageScale();

			this.positionText();

			this.props.onCurrent(this);

			this.animateText();

			this.playAudio();
		}
	},

	componentWillUnmount: function () {
		if (this.refs.myAudio) {
			var audio = this.refs.myAudio.getDOMNode();
			audio.removeEventListener("onended", this.onAudioPlayed);
		}
	},

	componentWillUpdate: function () {
	},

	componentDidUpdate: function () {
		if (this.props.current) {
			this.findImageScale();

			this.positionText();

			this.props.onCurrent(this);

			this.animateText();

			this.playAudio();
		}
	},

	playAudio: function () {
		if (this.props.audio) {
			var audio = this.refs.myAudio.getDOMNode();
			audio.play();
		}
	},

	onAudioPlayed: function () {
		this.props.advance();
	},

	animateText: function () {
		var txt = this.refs.myText.getDOMNode();
		$(txt).hide(0).removeClass("animated").addClass("animated fadeIn").show(0);
	},

	render: function () {
		var classes = "step";

		if (!this.props.current)
			classes += " inviso";
		else
			classes += " current";

		var audio;
		if (this.props.audio)
			audio = <audio ref="myAudio"><source src={this.props.audio}></source></audio>;

		return (
			<div className={classes} onClick={this.onClickStep}>
				{audio}
				<img ref="myImage" className="step-image" src={this.props.image}/>
				<Hotspot ref="myHotspot" scale={this.state.scale} rect={this.props.rect} advance={this.props.advance}/>
				<p ref="myText" className="step-text">{this.props.text}</p>
			</div>
		);
	},

	onClickStep: function () {
		// if there is no Hotspot, a click anywhere will advance us
		if (!this.props.rect) {
			this.props.advance();
		}
	},

	positionText: function () {
		var self = this;

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
					my = "right-20 center"; at = "left center"; arrows = "arrow arrow-right"; break;
				case "top":
					my = "center bottom-20"; at = "center top"; arrows = "arrow arrow-bottom"; break;
				case "right":
					my = "left+20 center"; at = "right center"; arrows = "arrow arrow-left"; break;
				case "bottom":
					my = "center top+20"; at = "center bottom"; arrows = "arrow arrow-top"; break;
			}

			$(txt).position({my: my, at: at, of: hotspot, collision: "fit"}).addClass(arrows);
		} else {
			$(txt).position({my: "center center", at: "center center", of: holder, collision: "fit"});
		}
	}
});