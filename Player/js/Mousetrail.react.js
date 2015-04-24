var Mousetrail = React.createClass({
	render: function () {
		if (this.props.hidden) {
			return (
				<div className="mouse-trail inviso">
					<img ref="myImg" className="cursor" src="images/cursor_arrow_white.png"/>
				</div>
			);
		} else {
			return (
				<div className="mouse-trail">
					<img ref="myImg" className="cursor" src="images/cursor_arrow_white.png"/>
				</div>
			);
		}
	},

	hide: function () {
		$(this.getDOMNode()).hide();
	}
});