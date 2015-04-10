// step number (if any)
// step description
// step image
// image action (zoom, crop)

var TaskStep = React.createClass({
	render: function () {
		var stepNumberVisible = (this.props.type === "numbered") ? "" : "hidden";
		var stepLabel;

		if (this.props.type === "numbered") {
			stepLabel = (
				<div className="circle text-center pull-right">
					<h4>{ this.props.number + 1 }.</h4>
				</div>

			);
		}

		var imageGroup;
		var buttons;

		if (this.props.image !== undefined) {
			imageGroup = (
				<div className="form-group image-group">
					<label className="col-sm-2 control-label">Image</label>
					<div className="col-sm-10">
						<TaskImage image={ this.props.image === "" ? "https://placehold.it/100x100" : this.props.image } rect={this.props.rect} firebaseRefs={ this.props.firebaseRefs } firebaseKey={ this.props.firebaseKey } onExpand={ this.props.onExpand } />
					</div>
					<div className="col-sm-2">
					</div>
					<div className="col-sm-4">
						<div className="input-group">
							<span className="input-group-btn">
								<button className="btn btn-success" type="button" onClick={ this.onClickUpload }>Upload</button>
							</span>
							<input type="text" className="form-control" placeholder={ this.props.filename } readOnly></input>
						</div>
					</div>
					<input type="file" accept="image/*" id="image-upload" onChange={ this.onSelectFile }></input>
				</div>
			);
		}

		if (this.props.image === undefined) {
			buttons = (
				<div className="col-sm-10">
					<button className="btn btn-info" onClick={ this.onClickAddImage }>Add Image</button>
				</div>
			)
		} else if (this.props.image === "") {
			buttons = (
				<div className="col-sm-10">
					<button className="btn btn-danger" onClick={ this.onClickRemoveImage }>Remove Image</button>
				</div>
			)
		} else {
			if (this.props.rect) {
				buttons = (
					<div className="col-sm-10">
						<button className="btn btn-danger" onClick={ this.onClickRemoveImage }>Remove Image</button>
						<button className="btn btn-danger" onClick={ this.onClickRemoveCallout }>Remove Callout</button>
					</div>
				)
			} else {
				buttons = (
					<div className="col-sm-10">
						<button className="btn btn-danger" onClick={ this.onClickRemoveImage }>Remove Image</button>
						<button className="btn btn-info" onClick={ this.onClickAddCallout }>Add Callout</button>
					</div>
				)
			}
		}

		return (
			<div className="form-horizontal task-step">
				<div className="button-row row vertically-centered">
					<div className="col-sm-2">
						<div className="input-group pull-left">
							<div className="btn-group">
								<button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">Row { this.props.index + 1 } <span className="caret"></span></button>
								<ul className="dropdown-menu" role="menu">
									<li><a href="#" onClick={ this.onRowMenu } id="insert-before">Insert Row Before</a></li>
									<li><a href="#" onClick={ this.onRowMenu } id="insert-after">Insert Row After</a></li>
									<li className="divider"></li>
									<li><a href="#" onClick={ this.onRowMenu } id="remove-row">Remove Row</a></li>
								</ul>
							</div>
						</div>
						{ stepLabel }
					</div>
					<div className="col-sm-10">
						<div className="btn-group" data-toggle="buttons">
							<label className={ "btn btn-primary " + ((this.props.type === "numbered") ? "active" : "")} onClick={ this.onClickType } >
								<input type="radio" name="options" id="type-numbered" checked={ this.props.type === "numbered" } onChange={ this.onChangeNothing } > Numbered</input>
							</label>
							<label className={ "btn btn-info " + ((this.props.type === "plain") ? "active" : "")} onClick={ this.onClickType }>
								<input type="radio" name="options" id="type-plain" checked={ this.props.type === "plain" } onChange={ this.onChangeNothing }> Plain</input>
							</label>
							<label className={ "btn btn-success " + ((this.props.type === "note") ? "active" : "")} onClick={ this.onClickType }>
								<input type="radio" name="options" id="type-note" checked={ this.props.type === "note" } onChange={ this.onChangeNothing }> Note</input>
							</label>
							<label className={ "btn btn-warning " + ((this.props.type === "sidebar") ? "active" : "")} onClick={ this.onClickType }>
								<input type="radio" name="options" id="type-sidebar" checked={ this.props.type === "sidebar" } onChange={ this.onChangeNothing }> Sidebar</input>
							</label>
						</div>
					</div>
				</div>
				<div className="form-group">
					<div className="col-sm-2">
						<div className="text-right">
							<label className="control-label">Text</label>
						</div>
					</div>
					<div className="col-sm-10">
						<textarea className="form-control" id="inputStepText" placeholder="Step Text" rows="3" value={this.props.text} onChange={ this.onChangeText }>
						</textarea>
					</div>
				</div>
				{imageGroup}
				<div className="form-group button-group">
					<label className="col-sm-2"></label>
					{buttons}
				</div>
			</div>
		);
	},

	// this is here to circumvent a React warning
	onChangeNothing: function () {
	},

	onClickAddImage: function () {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { image: "" } );
	},

	onClickRemoveImage: function () {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey).child("image");

		ref.remove();
	},

	onClickAddCallout: function () {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { rect: "20,20,50,50" } );
	},

	onClickRemoveCallout: function () {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey).child("rect");

		ref.remove();
	},

	onClickUpload: function () {
		var el = React.findDOMNode(this);
		var input = $(el).find("#image-upload");
		input.click();
	},

	onChangeText: function (event) {
		var newText = event.target.value;

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { text: newText } );
	},

	onSelectFile: function (event) {
		var self = this;

		var f = event.target.files[0];

		var ref = this.props.firebaseRefs.child(self.props.firebaseKey);
		ref.update( { filename: f.name } );

		var reader = new FileReader();
		reader.onload = function (fileEvent) {
			var filePayload = fileEvent.target.result;

			var ref = self.props.firebaseRefs.child(self.props.firebaseKey);

			ref.update( { image: filePayload } );
		};
		reader.readAsDataURL(f);
	},

	onClickType: function (event) {
		var id = $(event.target).find('input').attr('id');
		var newType = id.substr(5);

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { type: newType } );
	},

	onRowMenu: function (event) {
		event.preventDefault();

		switch ($(event.target).attr("id")) {
			case "insert-before":
				var ref = this.props.firebaseRefs.child(this.props.firebaseKey);
				ref.once("value", function (snapshot) {
					var newRow = ref.parent().push( { text: "New row." } );
					var oldPriority = snapshot.getPriority() || 100;
					var newPriority = oldPriority - 1;
					newRow.setPriority(newPriority);
				});
				break;
			case "insert-after":
				var ref = this.props.firebaseRefs.child(this.props.firebaseKey);
				ref.once("value", function (snapshot) {
					var newRow = ref.parent().push( { text: "New row." } );
					var oldPriority = snapshot.getPriority() || 100;
					var newPriority = oldPriority + 1;
					newRow.setPriority(newPriority);
				});
				break;
			case "remove-row":
				var ref = this.props.firebaseRefs.child(this.props.firebaseKey);
				ref.remove();
				break;
		}
	}
});