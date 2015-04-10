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

			return <Task {...task} key={key} id={key} firebaseRefs={ self.props.firebaseRefs } firebaseKey={ newFirebaseKey } />
		};

		return (
			<div className="tutorial">
				<div className="input-group input-group-lg">
					<div className="input-group-btn">
						<button type="button" className="btn btn-default">Title</button>
					</div>
					<input type="text" className="form-control input-lg" value={this.props.title} placeholder="Tutorial Title" onChange={ this.onChange }></input>
				</div>
				<div className="panel-group" id="accordion" role="tablist">
					{ $.map(this.props.tasks, createTask) }
				</div>
			</div>
		);
	},

	onChange: function (event) {
		var newTitle = event.target.value;

		this.props.firebaseRefs.update( { title: newTitle } );
	}
});