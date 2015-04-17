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
						<TaskImage image={ this.props.image === "" ? "https://placehold.it/100x100" : this.props.image } rect={this.props.rect} firebaseRefs={ this.props.firebaseRefs } firebaseKey={ this.props.firebaseKey } />
					</div>
				</div>
			);
		}

		var imageButtons = (
		<span>
			<div className="input-group">
				<span className="input-group-btn">
					<button className="btn btn-success" type="button" onClick={ this.onClickUploadImage }>Upload Image</button>
				</span>
				<input type="text" className="form-control" placeholder={ this.props.filename } readOnly></input>
			</div>
			<input type="file" accept="image/*" id="image-upload" onChange={ this.onSelectImageFile }></input>
		</span>
		);

		var isDisabled = !this.props.audio;

		var audioButtons = (
		<span>
			&nbsp;
			<div className="btn-toolbar top-gap">
				<div className="btn-group" role="group">
					<button className={this.props.audio ? "btn btn-success" : "btn btn-disabled"} onClick={ this.onClickPlayAudio } disabled={isDisabled}>Play Audio</button>
				</div>
				<div className="btn-group" role="group">
					<input type="text" className="form-control" placeholder={ this.props.audiofilename } readOnly></input>
				</div>
				<div className="btn-group" role="group">
					<button className="btn btn-info" onClick={ this.onClickAddAudio }>Upload Audio</button>
					<button className={this.props.audio ? "btn btn-danger" : "hidden"} onClick={ this.onClickRemoveAudio }>Remove Audio</button>
				</div>
			</div>
			<input type="file" accept="audio/*" id="audio-upload" onChange={ this.onSelectAudioFile }></input>
			<audio><source src={this.props.audio}></source></audio>
		</span>
		);

		if (this.props.image === undefined) {
			buttons = (
				<div className="col-sm-10">
					{imageButtons}
					{audioButtons}
				</div>
			)
		} else {
			if (this.props.rect) {
				buttons = (
					<div className="col-sm-10">
						<div className="form bottom-gap">
							<label for="exampleInputName2">Trigger&nbsp;</label>
							<div className="btn-group">
								<button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown">
								{this.props.trigger} <span className="caret"></span>
								</button>
								<ul className="dropdown-menu" role="menu">
									<li><a href="#" onClick={this.onSelectTrigger}>click</a></li>
									<li><a href="#" onClick={this.onSelectTrigger}>double-click</a></li>
									<li><a href="#" onClick={this.onSelectTrigger}>hover</a></li>
									<li><a href="#" onClick={this.onSelectTrigger}>text</a></li>
								</ul>
							</div>
						</div>

						{imageButtons}
						&nbsp;
						<button className="btn btn-danger" onClick={ this.onClickRemoveImage }>Remove Image</button>
						<button className="btn btn-danger" onClick={ this.onClickRemoveCallout }>Remove Callout</button>
						{audioButtons}
					</div>
				)
			} else {
				buttons = (
					<div className="col-sm-10">
						{imageButtons}
						&nbsp;
						<button className="btn btn-danger" onClick={ this.onClickRemoveImage }>Remove Image</button>
						<button className="btn btn-info" onClick={ this.onClickAddCallout }>Add Callout</button>
						{audioButtons}
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
						<div>{this.props[".priority"]}</div>
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
				<div className="form-group button-group form-inline">
					<label className="col-sm-2"></label>
					{buttons}
				</div>
			</div>
		);
	},

	// this is here to circumvent a React warning
	onChangeNothing: function () {
	},

	onClickRemoveImage: function () {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey).child("image");

		ref.remove();
	},

	onClickAddAudio: function () {
		var el = React.findDOMNode(this);
		var input = $(el).find("#audio-upload");
		input.click();
	},

	onClickPlayAudio: function (event) {
		var el = React.findDOMNode(this);
		var audio = $(el).find("audio");
		audio[0].play();
	},

	onClickRemoveAudio: function () {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey).child("audio");

		ref.remove();
	},

	onClickAddCallout: function () {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { rect: "20,20,50,50", trigger: "click" } );
	},

	onClickRemoveCallout: function () {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey).child("rect");

		ref.remove();
	},

	onClickUploadImage: function () {
		var el = React.findDOMNode(this);
		var input = $(el).find("#image-upload");
		input.click();
	},

	onChangeText: function (event) {
		var newText = event.target.value;

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { text: newText } );
	},

	onSelectImageFile: function (event) {
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

	onSelectAudioFile: function (event) {
		var self = this;

		var f = event.target.files[0];

		var ref = this.props.firebaseRefs.child(self.props.firebaseKey);
		ref.update( { audiofilename: f.name } );

		var reader = new FileReader();
		reader.onload = function (fileEvent) {
			var filePayload = fileEvent.target.result;

			var ref = self.props.firebaseRefs.child(self.props.firebaseKey);

			ref.update( { audio: filePayload } );
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
				var newRow = ref.parent().push( { text: "New row." } );
				var newPriority = this.props[".priority"] - 1;
				newRow.setPriority(newPriority);
				break;
			case "insert-after":
				var ref = this.props.firebaseRefs.child(this.props.firebaseKey);
				var newRow = ref.parent().push( { text: "New row." } );
				var newPriority = this.props[".priority"] + 1;
				newRow.setPriority(newPriority);
				break;
			case "remove-row":
				var ref = this.props.firebaseRefs.child(this.props.firebaseKey);
				ref.remove();
				break;
		}

		this.props.onChangeOrder();
	},

	onSelectTrigger: function (event) {
		event.preventDefault();

		var triggerType = $(event.target).text();

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { trigger: triggerType } );
	}
});