define([], function () {
	function Hotspot (options) {
		this.el = undefined;
		this.options = options;
	}

	Hotspot.getCenterOfRect = function (rect, scale) {
		var r = rect.split(",");

		return { x: r[0] * scale + r[2] * scale * .5, y: r[1] * scale + r[3] * scale * .5 };
	};

	Hotspot.prototype = {
		constructor: Hotspot,

		getDOM: function () {
			if (!this.el) {
				var div = $("<div>", {class: "step-hotspot"});

				if (this.options && this.options.rect) {
					var rect = this.options.rect.split(",");

					div.css({
						left: Math.round(rect[0] * this.options.scale),
						top: Math.round(rect[1] * this.options.scale),
						width: Math.round(rect[2] * this.options.scale),
						height: Math.round(rect[3] * this.options.scale)
					});

					div.click($.proxy(this.onClickHotspot, this));
					div.dblclick($.proxy(this.onDoubleClickHotspot, this));
					div.hover($.proxy(this.onHoverHotspot, this));

					if (this.options.trigger == "text") {
						var inputBox = $("<input>", {class: "input-box"});
						inputBox.on("change", $.proxy(this.onChangeText, this));

						div.append(inputBox);
					}
				}

				this.el = div;
			}

			return this.el;
		},

		onChangeText: function (evt) {
			console.log("change text");
		},

		onClickHotspot: function (evt) {
			if (!this.options.step.isStarted()) return;

			if (this.options.mode == "watch") return;

			if (this.options.trigger == "click") {
				this.options.step.onComplete({ step: this, advance: true });
			} else if (this.options.trigger != "text") {
				if (this.options.trigger == "double-click") {
					// delay a bit since it's a double-click trigger
					this.delayedHint = setTimeout($.proxy(this.options.step.showHint, this.options.step), 500);
				} else {
					this.options.step.showHint();
				}

				evt.preventDefault();
				evt.stopPropagation();
			}
		},

		onDoubleClickHotspot: function () {
			if (this.options.mode == "watch") return;

			if (this.delayedHint) {
				clearTimeout(this.delayedHint);
				this.delayedHint = undefined;
			}

			if (this.options.trigger == "double-click") {
				this.options.step.onComplete({ step: this, advance: true });
			} else {
				this.options.step.showHint();
			}
		},

		onHoverHotspot: function (evt) {
			if (this.options.mode == "watch") return;

			if (this.options.trigger == "hover") {
				this.options.step.onComplete({ step: this, advance: true });
			}
		}
	};

	return Hotspot;
});