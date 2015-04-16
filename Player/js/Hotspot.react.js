var Hotspot = React.createClass({
	render: function () {
		var r;

		if (this.props.rect) {
			r = this.props.rect.split(",");

			return (
				<div className="step-hotspot" style={{
					left: r[0] * this.props.scale,
					top: r[1] * this.props.scale,
					width: r[2] * this.props.scale,
					height: r[3] * this.props.scale
				}} onClick={this.onClickHotspot}>
				</div>
			);
		} else {
			return <div></div>;
		}
	},

	onClickHotspot: function () {
		this.props.advance();
	}
});