function download (content, filename, contentType) {
	if (!contentType) contentType = 'application/octet-stream';
	var a = document.createElement('a');
	var blob = new Blob([content], { 'type': contentType });
	a.href = window.URL.createObjectURL(blob);
	a.download = filename;
	a.click();
}

// TODO: get rid of spaces and odd characters
function convertToFilename (key) {
	var s = key.replace(" ", "_");
	return s.toLowerCase();
}


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

		this.publishHTML();

		//var json = $.toJSON(this.state.tutorial);
		//download(json, "que-interactive.txt");
	},

	onClickLogin: function (event) {
		event.preventDefault();
	},

	publishHTML: function () {
		var project = this.state.tutorial;

		var project_name = convertToFilename(project.title);

		var zip = new JSZip();

		var project_folder = zip.folder(project_name)
		var pages = project_folder.folder("pages");

		for (task_key in project.tasks) {
			var s = "";
			var counter = 1;

			var task = project.tasks[task_key];
			var filename = convertToFilename(task_key) + ".html";

			s += "<h2>" + task.title + "</h2>\n";

			for (step_key in task.steps) {
				var step = task.steps[step_key];

				s += "<div class=\"step\">\n";

				switch (step.type) {
					case "plain":
						break;
					case "numbered":
						s += "\t<div class=\"number\"><span>" + counter++ + "</span></div>\n";
						break;
				}

				s += "\t<p>" + step.text + "</p>\n";

				s += "</div>\n";
			}

			pages.file(filename, s);
		}

		var zipcontent = zip.generate({ type:"blob" });

		var project_filename = project_name + ".zip";

		download(zipcontent, project_filename);
	}
});