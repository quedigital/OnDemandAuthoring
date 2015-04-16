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

	render: function () {
		if (this.state.currentStep) {
			var center;
			var step = this.props.steps[this.state.currentStep];
			if (!step.rect) {
				center = (
					<div className="centered-pane">
						<button id="continue-button" className="btn btn-success" onClick={this.doAdvance}>Continue</button>
					</div>
				);
			}
		}

		return (
			<div className="que-task">
				<div className="step-holder">
					{ $.map(this.props.steps, this.createStep) }
				</div>
				{center}
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
		var el = $(this.getDOMNode());
		var btn = el.find("#continue-button");

		if (btn) {
			var text = $(step.getDOMNode()).find(".step-text");
			btn.position({ my: "center top+20", at: "center bottom", of: text, collision: "fit" });
		}
	}
});