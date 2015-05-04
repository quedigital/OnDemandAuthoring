var Task = React.createClass({
	mixins: [ReactFireMixin],

	getDefaultProps: function () {
		return {
			steps: []
		}
	},

	getInitialState: function () {
		return { expanded: false };
	},

	componentWillMount: function () {
		this.components = [];
	},

	onRef: function (ref) {
		this.components.push(ref);
	},

	componentDidMount: function () {
		var el = $(React.findDOMNode(this));

		el.find(".panel-collapse").on("show.bs.collapse", $.proxy(this.onExpand));

		el.on("slid.bs.carousel", this.onCarousel);

		el.find(".steps-panel").sortable( { stop: $.proxy(this.onReorderSteps, this) } );
	},

	onCarousel: function () {
		// TODO: this is a kludge to refresh the hotspot boxes (ie, triggers an update); find a better way
		this.setState({ expanded: true });
	},

	getStepsByPriority: function () {
		// sort by priority (since reactfire isn't set up for it)
		var priorities = $.map(this.props.steps, function (item, key) {
			return { key: key, priority: item[".priority"] };
		});

		priorities = priorities.sort(function (a, b) {
			if (a.priority && b.priority) {
				return a.priority - b.priority;
			} else if (!a.priority && !b.priority)
				return a.key.localeCompare(b.key);
			else if (!a.priority)
				return -1;
			else if (!b.priority)
				return 1;
			else
				return a.key.localeCompare(b.key);
		});

		return priorities;
	},

	render: function () {
		var self = this;
		var counter = 0;
		var index = 0;
		var index_2 = 0;

		var priorities = this.getStepsByPriority();

		var createStep = function (item, key) {
			var newFirebaseKey = self.props.firebaseKey + "/steps/" + item.key;

			var step = self.props.steps[item.key];

			var s;
			if (index == 0) {
				s = (
					<div className="item active">
						<TaskStep {...step} ref={self.onRef} index={index} number={counter} key={item.key} firebaseRefs={ self.props.firebaseRefs } firebaseKey={ newFirebaseKey } onChangeOrder={ self.onChangeOrder } />
					</div>
				);
			} else {
				s = (
					<div className="item">
						<TaskStep {...step} ref={self.onRef} index={index} number={counter} key={item.key} firebaseRefs={ self.props.firebaseRefs } firebaseKey={ newFirebaseKey } onChangeOrder={ self.onChangeOrder } />
					</div>
				);
			}

			if (step.type === "numbered") counter++;
			index++;

			return s;
		};

		var createStepIndicators = function (item, key) {
			if (key == 0) {
				return <li data-target="#carousel-example-generic" data-slide-to={key} className="active"></li>
			} else {
				return <li data-target="#carousel-example-generic" data-slide-to={key}></li>
			}
		};

		return (
			<div id="carousel-example-generic" className="carousel slide" data-ride="carousel" data-interval="false">
				<div className="panel-heading" role="tab">
					<input type="text" className="form-control input-lg" placeholder="title" value={this.props.title} onChange={ this.onChange }></input>
				</div>

				<ol className="carousel-indicators">
					{ $.map(priorities, createStepIndicators) }
				</ol>

				<div className="carousel-inner" role="listbox">
					{ $.map(priorities, createStep) }
				</div>
				<a className="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
					<span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
					<span className="sr-only">Previous</span>
				</a>
				<a className="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
					<span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
					<span className="sr-only">Next</span>
				</a>
			</div>
		);
	},

	onChange: function (event) {
		var newTitle = event.target.value;

		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		ref.update( { title: newTitle } );
	},

	onClickAddStep: function (event) {
		var ref = this.props.firebaseRefs.child(this.props.firebaseKey).child("steps");

		ref.push( { text: "New step." } );
	},

	onExpand: function (event) {
		// using this to trigger a render (possibly incorrect usage)
		this.setState( { expanded: true } );
	},

	renumberPriorities: function () {
		var self = this;

		var priorities = this.getStepsByPriority();

		var priority = 100;

		$.each(priorities, function (index, item) {
			var ref = self.props.firebaseRefs.child(self.props.firebaseKey).child("steps").child(item.key);
			ref.setPriority(priority);
			priority += 10;
		});
	},

	onReorderSteps: function (event) {
		var self = this;

		var order = [];

		// TODO: set priorities according to the DOM order
		$.each(this.components, function (index, item) {
			var ref = self.props.firebaseRefs.child(item.props.firebaseKey);

			var dom = React.findDOMNode(item);
			var childNumber = $(dom).index();

			var priority = 100 + childNumber * 10;

			if (item.props[".priority"] != priority)
				order.push( { ref: ref, priority: priority } );

			//item.setState( { newPriority: priority });
			//ref.setPriority(priority);
			//ref.update( { ".priority": priority } );
		});

		//console.log("setting order");
		//order = order.sort(function (a, b) { return a.priority - b.priority });

//		var ref = this.props.firebaseRefs.child(this.props.firebaseKey);

		console.log("setting new priorities")
		for (var i = 0; i < order.length; i++) {
		//	order[i].ref.update( { ".priority": order[i].priority, newPriority: order[i].priority } );
			order[i].ref.setPriority(order[i].priority);
			//order[i].ref.update({ newPriority: order[i].priority });
		}
		console.log("done setting new priorities")
		//this.setState( { order: order } );
	},

	onChangeOrder: function () {
		console.log("here");
	}
});