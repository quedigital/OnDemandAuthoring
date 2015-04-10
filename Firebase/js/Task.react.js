var Task = React.createClass({
	getDefaultProps: function () {
		return {
			steps: []
		}
	},

	getInitialState: function () {
		return { expanded: false };
	},

	componentDidMount: function () {
		var el = $(React.findDOMNode(this));

		el.find(".panel-collapse").on("show.bs.collapse", $.proxy(this.onExpand));
	},

	render: function () {
		var self = this;
		var counter = 0;
		var index = 0;

		var createStep = function (step, key) {
			var newFirebaseKey = self.props.firebaseKey + "/steps/" + key;

			var s = <TaskStep {...step} index={index} number={counter} key={key} firebaseRefs={ self.props.firebaseRefs } firebaseKey={ newFirebaseKey } onExpand={ this.onExpand } />;
			if (step.type === "numbered") counter++;
			index++;

			return s;
		};

		return (
			<div className="task panel panel-default">
				<div className="panel-heading" role="tab" id="headingOne">
					<div className="input-group input-group-lg">
						<span className="input-group-btn">
							<button type="button" className="btn btn-default collapsed" data-toggle="collapse" data-parent="#accordion" href={"#collapse" + this.props.id}>Task</button>
						</span>
						<input type="text" className="form-control" placeholder="title" value={this.props.title} onChange={ this.onChange }></input>
					</div>
				</div>
				<div className="panel-collapse collapse" role="tabpanel" id={ "collapse" + this.props.id }>
					{ $.map(this.props.steps, createStep) }
					<div className="panel-footer">
						<button className="btn btn-info" onClick={ this.onClickAddStep }>Add Step</button>
					</div>
				</div>
			</div>
		);
	},

	onChange: function (event) {
		var newTitle = event.target.value;

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { title: newTitle } );
	},

	onClickAddStep: function (event) {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey).child("steps");

		ref.push( { text: "New step." } );
	},

	onExpand: function (event) {
		// using this to trigger a render (possibly incorrect usage)
		this.setState( { expanded: true } );
	}
});