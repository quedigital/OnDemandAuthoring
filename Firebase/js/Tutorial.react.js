var Tutorial = React.createClass({
	getDefaultProps: function () {
		return {
			tasks: []
		}
	},

	getInitialState: function () {
		return { currentTask: undefined };
	},

	componentDidMount: function () {
		this.sizeListToFit();
	},

	componentDidUpdate: function () {
		this.sizeListToFit();
	},

	sizeListToFit: function () {
		var el = $(this.getDOMNode());

		var list = el.find("#task-list");

		list.attr("size", parseInt(list.find("option").length));

		list.val(this.state.currentTask);
	},

	showCurrentTask: function () {
		if (this.state && this.state.currentTask) {
			var task = this.props.tasks[this.state.currentTask];
			var key = this.state.currentTask;
			var newFirebaseKey = "tasks/" + key;
			return <Task {...task} key={key} id={key} firebaseRefs={ this.props.firebaseRefs } firebaseKey={ newFirebaseKey } />
		}
	},

	render: function () {
		var createTaskEntry = function (task, key) {
			return <option key={key} value={key}>{task.title}</option>
		};

		return (
			<div className="tutorial">
				<div className="input-group input-group-lg">
					<div className="input-group-btn">
						<button type="button" className="btn btn-default">Title</button>
					</div>
					<input type="text" className="form-control input-lg" value={this.props.title} placeholder="Tutorial Title" onChange={ this.onChange }></input>
				</div>
				<div>
					<select id="task-list" size="5" className="form-control" onChange={this.onSelectTask}>
						{ $.map(this.props.tasks, createTaskEntry) }
					</select>
				</div>
				<div className="panel-group">
					{ this.showCurrentTask() }
				</div>

				<ImageLibrary images={this.props.images}></ImageLibrary>

			</div>
		);
	},

	onChange: function (event) {
		var newTitle = event.target.value;

		this.props.firebaseRefs.update( { title: newTitle } );
	},

	onSelectTask: function (event) {
		var val = $(event.target).val();

		this.setState({ currentTask: val });
	}
});