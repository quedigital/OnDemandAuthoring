var Task = React.createClass({
	getInitialState: function () {
		return {
			currentStep: "0"
		};
	},

	createStep: function (item, index) {
		var current = (index == this.state.currentStep);

		return <Step {...item} myKey={index} current={current} key={index} advance={this.doAdvance} onCurrent={this.onCurrentStep}></Step>
	},

	componentDidUpdate: function () {
		this.positionButton();
	},

	componentDidMount: function () {
		this.positionButton();
	},

	render: function () {
		if (this.state.currentStep) {
			var controls;
			var step = this.props.steps[this.state.currentStep];
			if (!step.rect) {
				controls = (
					<button id="continue-button" className="btn btn-success" onClick={this.doAdvance}>Continue</button>
				);
			}
		}

		return (
			<div className="que-task">
				<div className="step-holder">
					{ $.map(this.props.steps, this.createStep) }
				</div>
				{controls}
				<button className="btn btn-primary" onClick={this.onClickPrevStep}>Prev</button>
				<button className="btn btn-success" onClick={this.onClickNextStep}>Next</button>
			</div>
		);
	},

	onClickPrevStep: function () {
		this.doRewind();
	},

	onClickNextStep: function () {
		this.doAdvance();
	},

	getNumberOfSteps: function () {
		var counter = 0;
		for (key in this.props.steps)
			counter++;
		return counter;
	},

	getIndexOfStep: function (step) {
		var counter = 0;
		for (index in this.props.steps) {
			if (index == step) return counter;
			counter++;
		}
		return this.getNumberOfSteps();
	},

	getStepByIndex: function (index) {
		var counter = 0;
		for (key in this.props.steps) {
			if (index == counter) return key;
			counter++;
		}
		return null;
	},

	doRewind: function () {
		var currentIndex = this.getIndexOfStep(this.state.currentStep);
		if (currentIndex > 0) {
			var prevStep = this.getStepByIndex(currentIndex - 1);

			this.setState({currentStep: prevStep});
		}
	},

	doAdvance: function () {
		var currentIndex = this.getIndexOfStep(this.state.currentStep);
		if (currentIndex < this.getNumberOfSteps()) {
			var nextStep = this.getStepByIndex(currentIndex + 1);

			this.setState({currentStep: nextStep});
		}
	},

	onCurrentStep: function (step) {
	},

	positionButton: function () {
		var el = $(this.getDOMNode());
		var btn = el.find("#continue-button");

		var step = el.find(".step.current");

		if (btn.length) {
			var text = step.find(".step-text");
			btn.hide(0).position({ my: "center top+20", at: "center bottom", of: text, collision: "none" }).addClass("animated fadeIn").animate( { _justDelay: 0 }, 1000, function () { btn.show(0); } );
		}
	}
});