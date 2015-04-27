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

		this.publishPackage();
	},

	onClickLogin: function (event) {
		event.preventDefault();
	},

	publishPackage: function () {
		var project = this.state.tutorial;

		var project_name = convertToFilename(project.title);

		var zip = new JSZip();

		var project_folder = zip.folder(project_name)

		this.publishTOC(project_folder, project_name);
		this.publishHTML(project_folder);
		this.publishTasks(project_folder);

		var zipcontent = zip.generate({ type:"blob" });

		var project_filename = project_name + ".zip";

		download(zipcontent, project_filename);
	},

	publishTOC: function (project_folder, project_name) {
		var project = this.state.tutorial;

		var toc_file = project_folder.file("toc-data.js");

		var s = "";

		s += "define(function () {\n" +
			"\tvar toc = [\n";

		for (task_key in project.tasks) {
			var task = project.tasks[task_key];

			var datafile_path = encodeURI(project_name + "/tasks/" + task_key + ".json");

			var keys = "\t\t\t\tkeys: [\n";

			var counter = 1;
			for (var step_key in task.steps) {
				var step = task.steps[step_key];

				keys += "\t\t\t\t\t{ index: " + counter + ", key: \"" + step_key + "\" },\n";

				counter++;
			}

			keys += "\t\t\t\t],\n";

			s += "\t\t{\n" +
				"\t\t\ttitle: \"" + task.title + "\",\n" +
				"\t\t\thtml: \"" + project_name + "/pages/" + task_key + ".html\",\n" +
				'\t\t\t"watch": {\n' +
				'\t\t\t\tparams: "datafile=' + datafile_path + '&mode=watch",\n' +
				'\t\t\t\tcompleted: false,\n' +
				keys +
				'\t\t\t},\n' +
				'\t\t\t"try": {\n' +
				'\t\t\t\tparams: "datafile=' + datafile_path + '&mode=try",\n' +
				'\t\t\t\tcompleted: false,\n' +
				keys +
				'\t\t\t},\n' +
				"\t\t},\n";
		}

		s += "\t];\n" +
			"\treturn toc;\n" +
			"});";

		var toc_file = project_folder.file("toc-data.js", s);

		/*
			"	{\n" +
			'		title: "Player Test Google 1",'
					html: "google_hangouts/pages/0.html",
					"watch": {
						html: "/Authoring/Player/index.html?mode=watch",
						completed: false,
						keys: [
							{ slide: 1, step: 1 },
							{ slide: 2, step: 2 },
							{ slide: 3, step: 3, sub: "#part1" },
							{ slide: 4, step: 3, sub: "#part2" },
							{ slide: 5, step: 3, sub: "#part3" },
							{ slide: 6, step: 4 },
							{ slide: 7, step: 5 },
						]
					},
					"try": {
						html: "/Authoring/Player/index.html?mode=try",
						completed: false,
						keys: [
							{ slide: 1, step: 1 },
							{ slide: 2, step: 2 },
							{ slide: 3, step: 3, sub: "#part1" },
							{ slide: 4, step: 3, sub: "#part2" },
							{ slide: 5, step: 3, sub: "#part3" },
							{ slide: 6, step: 4 },
							{ slide: 7, step: 5 },
						]
					}
				},
			];
			*/

	},

	publishHTML: function (project_folder) {
		var project = this.state.tutorial;

		var pages = project_folder.folder("pages");

		for (task_key in project.tasks) {
			var s = "";
			var counter = 1;

			var task = project.tasks[task_key];
			var filename = convertToFilename(task_key) + ".html";

			s += "<h2>" + task.title + "</h2>\n";

			for (step_key in task.steps) {
				var step = task.steps[step_key];

				s += "<div class=\"step\" data-key=\"" + step_key + "\">\n";

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
	},

	publishTasks: function (project_folder) {
		var project = this.state.tutorial;

		var tasks = project_folder.folder("tasks");

		for (task_key in project.tasks) {
			var task = project.tasks[task_key];
			var filename = convertToFilename(task_key) + ".json";

			var json = $.toJSON(task);

			tasks.file(filename, json);
		}
	}
});