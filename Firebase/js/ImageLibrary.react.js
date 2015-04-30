var ImageLibrary = React.createClass({
	getDefaultProps: function () {
		return {
			images: []
		}
	},

	componentDidMount: function () {
		var el = $(this.getDOMNode());

		el.on("shown.bs.modal", this.showModal);
	},

	showModal: function () {
		this.arrangeImages();
	},

	componentDidUpdate: function () {
		this.arrangeImages();
	},

	arrangeImages: function () {
		var el = $(this.getDOMNode());
		var container = el.find(".lib-container");

		container.imagesLoaded(function () {
			$(".lib-container").isotope( { layoutMode: "masonry", itemSelector: ".thumbnail", masonry: { columnWidth: 25 } } );
		});
	},

	render: function () {
		var self = this;

		function makeImage (data, key) {
			return (
				<div className="thumbnail library-image" id={key} key={key}>
					<img src={data}/>
					<input type="text" readOnly value={"![](" + key + ")"}></input>
				</div>
			);
		}

		return (
			<div className="modal" id="imageLibraryModal">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
							<h4 className="modal-title">Image Library</h4>
						</div>
						<div className="modal-body">
							<div className="lib-container">
								{ $.map(this.props.images, makeImage) }
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});