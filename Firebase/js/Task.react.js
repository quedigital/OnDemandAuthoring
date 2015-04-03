var Task = React.createClass({
	getDefaultProps: function () {
		return {
			steps: []
		}
	},

	render: function () {
		var self = this;
		var counter = 0;

		var createStep = function (step, key) {
			var newFirebaseKey = self.props.firebaseKey + "/steps/" + key;

			var s = <TaskStep {...step} number={counter} key={key} firebaseRefs={ self.props.firebaseRefs } firebaseKey={ newFirebaseKey } />;
			if (step.numbered) counter++;
			return s;
		};

		return (
			<div>
				<div className="input-group input-group-lg">
					<span className="input-group-addon" id="basic-addon1">Task</span>
					<input type="text" className="form-control" placeholder="title" value={this.props.title} onChange={ this.onChange }></input>
				</div>
				{ $.map(this.props.steps, createStep) }
			</div>
		);
	},

	onChange: function (event) {
		var newTitle = event.target.value;

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { title: newTitle } );
	}
});