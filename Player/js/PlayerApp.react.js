var PlayerApp = React.createClass({
	gotData: function (data) {
		console.log(data);

		if (this.isMounted()) {
			this.setState({ title: data.title, tasks: data.tasks });
		}
	},

	getInitialState: function () {
		return {
			title: null,
			tasks: null,
			currentTask: "0"
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

			return <Task {...item} key={this.state.currentTask}></Task>;
		} else {
			return <p>Loading</p>;
		}
	},

	render: function () {
		return (
			<div className="que-player">
				{/*<h1>{this.state.title}</h1>*/}
				{ this.showCurrentTask() }
			</div>
		);
	}
});