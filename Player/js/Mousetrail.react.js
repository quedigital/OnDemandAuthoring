var Mousetrail = React.createClass({
	componentDidMount: function () {
		//this.animateToRect();
	},

	componentDidUpdate: function () {
		//this.animateToRect();
	},

	render: function () {
		return (
			<div className="mouse-trail">
				<img ref="myImg" className="cursor" src="images/cursor_arrow_white.png"/>
			</div>
		);
	},

	hide: function () {
		$(this.getDOMNode()).hide();
	}
});