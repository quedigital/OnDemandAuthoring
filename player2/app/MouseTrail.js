define(function () {
	function MouseTrail () {
		this.el = undefined;
	}

	MouseTrail.prototype = {
		constructor: MouseTrail,

		getDOM: function () {
			if (!this.el) {
				var div = $("<div>", {class: "mouse-trail"});

				var img = $("<img>", {class: "cursor", src: "images/cursor_arrow_white.png"});
				div.append(img);

				this.el = div;
			}

			return this.el;
		},

		hide: function () {
			this.div.hide();
		}
	};

	return MouseTrail;
});
