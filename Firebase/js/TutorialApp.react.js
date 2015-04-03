var TutorialApp = React.createClass({
	mixins: [ReactFireMixin],

	getInitialState: function () {
		return { tutorial: {} };
	},

	componentWillMount: function () {
		var firebaseRef = new Firebase("https://ondemand.firebaseio.com/tutorials/0");
		this.bindAsObject(firebaseRef, "tutorial");
	},

	render: function() {
		// NOTE: this.firebaseRefs comes from ReactFire

		return (
			<div>
				<Tutorial {...this.state.tutorial} firebaseRefs={ this.firebaseRefs.tutorial }/>
			</div>
		);
	}
});