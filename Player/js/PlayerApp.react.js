var PlayerApp = React.createClass({
	gotData: function (data) {
		if (this.isMounted()) {
			this.setState({ title: data.title, tasks: data.tasks });
		}
	},

	getInitialState: function () {
		return {
			title: null,
			tasks: null,
			currentTask: "0",
			mode: "watch"
		};
	},

	componentDidMount: function () {
		var json = $.getJSON("que-interactive.txt", this.gotData);
	},

	componentWillMount: function () {
	},

	componentDidUpdate: function () {
	},

	createTask: function (item, index) {
		return <Task {...item} key={index}></Task>
	},

	showCurrentTask: function () {
		if (this.state.tasks) {
			var item = this.state.tasks[this.state.currentTask];

			return <Task {...item} key={this.state.currentTask} mode={this.state.mode}></Task>;
		} else {
			return <p>Loading</p>;
		}
	},

	render: function () {
		return (
			<div className="que-player">
				{ this.showCurrentTask() }
			</div>
		);
	}
});