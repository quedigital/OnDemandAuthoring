var Callout = React.createClass({
	componentDidMount: function () {
		var el = $(React.findDOMNode(this)).find(".callout");

		el.draggable({ stop: $.proxy(this.onDragDone, this) }).resizable( { stop: $.proxy(this.onResizeDone, this) });
	},

	componentDidUpdate: function () {
		var el = $(React.findDOMNode(this)).find(".callout");

		el.draggable({ stop: $.proxy(this.onDragDone, this) }).resizable( { stop: $.proxy(this.onResizeDone, this) });
	},

	render: function () {
		if (this.props.rect) {
			r = this.props.rect.split(",");

			return (
				<div style={{
					position: "absolute",
					top: 0,
					left: 0
				}}>
					<div className="callout" style={{
						left: r[0] * this.props.scale,
						top: r[1] * this.props.scale,
						width: r[2] * this.props.scale,
						height: r[3] * this.props.scale,
						position: "absolute"
					}}></div>
				</div>
			)
		} else {
			return <div></div>;
		}
	},

	onDragDone: function (event) {
		this.updateRect();
		console.log("drag done");
	},

	onResizeDone: function (event) {
		this.updateRect();
	},

	updateRect: function () {
		var el = $(React.findDOMNode(this)).find(".callout");

		var rect = [el.position().left / this.props.scale, el.position().top / this.props.scale, el.width() / this.props.scale, el.height() / this.props.scale];

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { rect: rect.toString() } );
	}
});

var TaskImage = React.createClass({

	getInitialState: function () {
		return { scale: 1.0 };
	},

	findImageScale: function() {
		var el = $(React.findDOMNode(this));

		var img = el.find(".screenshot");

		var scale = img.height() / img[0].naturalHeight;

		// Only report changed size to avoid infinite recursion
		if (this.state.scale !== scale) {
			this.setState({ scale: scale });
		}
	},

	componentDidMount: function() {
		this.sizeToFit();

		$(window).resize($.proxy(this.onResize, this));
	},

	componentWillUnmount: function () {
		$(window).off("resize", $.proxy(this.onResize, this));
	},

	componentDidUpdate: function () {
		this.sizeToFit();
	},

	sizeToFit: function () {
		var wh = $(window).height() - 50;
		$(".screenshot").css("max-height", wh);

		// wait a frame for the image to have a size before calculating the new scale
		setTimeout($.proxy(this.findImageScale, this), 0);
	},

	render: function () {
		return (
			<div className="image-holder img-thumbnail">
				<img className="img-responsive screenshot" src={ this.props.image ? this.props.image : "http://placehold.it/140x140" } onDoubleClick={ this.onDoubleClick } />
				<Callout rect={ this.props.rect } scale={ this.state.scale } firebaseRefs={ this.props.firebaseRefs } firebaseKey={ this.props.firebaseKey } />
			</div>
		)
	},

	onDoubleClick: function (event) {
		var rect = [event.nativeEvent.offsetX, event.nativeEvent.offsetY, 50, 50];

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { rect: rect.toString() } );
	},

	onResize: function () {
		this.sizeToFit();
	}
});
