var Tutorial = React.createClass({
	getDefaultProps: function () {
		return {
			tasks: []
		}
	},

	render: function () {
		var self = this;

		var createTask = function (task, key) {
			var newFirebaseKey = "tasks/" + key;

			return <Task {...task} key={key} firebaseRefs={ self.props.firebaseRefs } firebaseKey={ newFirebaseKey } />
		};

		return (
			<div>
				<input type="text" className="form-control input-lg" value={this.props.title} placeholder="Tutorial Title" onChange={ this.onChange }></input>
				{ $.map(this.props.tasks, createTask) }
			</div>
		);
	},

	onChange: function (event) {
		var newTitle = event.target.value;

		this.props.firebaseRefs.update( { title: newTitle } );
	}
});