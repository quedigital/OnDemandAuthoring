var TutorialApp = React.createClass({
	mixins: [ReactFireMixin],

	getInitialState: function () {
		return {
			tutorial: {},
			showImages: true
		};
	},

	componentWillMount: function () {
		var firebaseRef = new Firebase("https://ondemand.firebaseio.com/tutorials/0");
		this.bindAsObject(firebaseRef, "tutorial");
	},

	componentDidUpdate: function () {
		if (this.state.showImages) {
			$(".image-group").removeClass("hidden");
			$(".dropdown-menu #show-images i").removeClass("hidden");
		} else {
			$(".image-group").addClass("hidden");
			$(".dropdown-menu #show-images i").addClass("hidden");
		}
	},

	render: function () {
		// NOTE: this.firebaseRefs comes from ReactFire

		return (
			<div>
				<nav role="navigation" className="container navbar navbar-default navbar-fixed-top navbar-inverse">
					<div className="navbar-header">
						<button type="button" data-target="#navbarCollapse" data-toggle="collapse" className="navbar-toggle">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
						</button>
						<a className="navbar-brand">Que Interactive CMS</a>
					</div>
					<div id="navbarCollapse" className="collapse navbar-collapse">
						<ul className="nav navbar-nav">
							{/*
							<li><a href="#">Home</a></li>
							<li><a href="#">Profile</a></li>
							*/}
							<li className="dropdown">
								<a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">View <span className="caret"></span></a>
								<ul className="dropdown-menu" role="menu">
									<li><a href="#" onClick={ this.onClickShowImages } id="show-images"><i className="fa fa-check"/> Show Images</a></li>
									<li className="divider"></li>
									<li><a href="#">Separated link</a></li>
								</ul>
							</li>
							<li><a href="#" onClick={ this.onClickPublish }>Publish</a></li>
						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li><a href="#" onClick={ this.onClickLogin }>Login</a></li>
						</ul>
					</div>
				</nav>

				<div id="mainContainer" className="container">
					<Tutorial {...this.state.tutorial} showImages={this.state.showImages} firebaseRefs={ this.firebaseRefs.tutorial }/>
				</div>
			</div>
		);
	},

	onClickShowImages: function (event) {
		event.preventDefault();

		this.state.showImages = !this.state.showImages;
		this.setState(this.state);
	},

	onClickPublish: function (event) {
		event.preventDefault();
	},

	onClickLogin: function (event) {
		event.preventDefault();
	}
});