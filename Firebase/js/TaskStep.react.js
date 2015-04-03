// step number (if any)
// step description
// step image
// image action (zoom, crop)

var TaskStep = React.createClass({
	render: function () {
		var h1Class = this.props.numbered ? "" : "hidden";

		return (
			<div className="form-horizontal">
				<div className="row vertically-centered">
					<div className="col-sm-1">
						<h1 className={h1Class}>{this.props.number + 1}</h1>
					</div>
					<div className="col-sm-11">
						<div class="checkbox">
							<label>
								<input type="checkbox" checked={ this.props.numbered } onChange={ this.onChangeNumbered }> Numbered?</input>
							</label>
						</div>
					</div>
				</div>
				<div className="form-group">
					<label for="inputEmail3" className="col-sm-1 control-label">Step Text</label>
					<div className="col-sm-11">
						<textarea className="form-control" id="inputEmail3" placeholder="Step Text" rows="3" value={this.props.text} onChange={ this.onChangeText }>
						</textarea>
					</div>
				</div>
			</div>
		);
	},

	onChangeText: function (event) {
		var newText = event.target.value;

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { text: newText } );
	},

	onChangeNumbered: function (event) {
		var newVal = event.target.checked;

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { numbered: newVal } );
	}
});