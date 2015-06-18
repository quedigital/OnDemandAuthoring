var Hotspot = React.createClass({
	statics: {
		getCenterOfRect: function (rect, scale) {
			var r = rect.split(",");

			return { x: r[0] * scale + r[2] * scale * .5, y: r[1] * scale + r[3] * scale * .5 };
		}
	},

	render: function () {
		var r;

		if (this.props.rect) {
			r = this.props.rect.split(",");

			return (
				<div className="step-hotspot" style={{
					left: Math.round(r[0] * this.props.scale),
					top: Math.round(r[1] * this.props.scale),
					width: Math.round(r[2] * this.props.scale),
					height: Math.round(r[3] * this.props.scale)
				}} onClick={this.onClickHotspot} onDoubleClick={this.onDoubleClickHotspot} onMouseEnter={this.onHoverHotspot}>
				</div>
			);
		} else {
			return <div></div>;
		}
	},

	onClickHotspot: function () {
		if (this.props.mode == "watch") return;

		if (this.props.trigger == "click") {
			this.props.onStepComplete(this, true);
		} else {
			this.props.onStepHint(this);
		}
	},

	onDoubleClickHotspot: function () {
		if (this.props.mode == "watch") return;

		if (this.props.trigger == "double-click") {
			this.props.onStepComplete(this, true);
		} else {
			this.props.onStepHint(this);
		}
	},

	onHoverHotspot: function () {
		if (this.props.mode == "watch") return;

		if (this.props.trigger == "hover") {
			this.props.onStepComplete(this, true);
		}
	}
});