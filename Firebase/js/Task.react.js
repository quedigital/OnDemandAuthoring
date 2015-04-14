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

		el.find(".steps-panel").sortable( { stop: $.proxy(this.onReorderSteps, this) } );
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

		var priorities = this.getStepsByPriority();

		var createStep = function (item, key) {
			console.log(item.key);

			var newFirebaseKey = self.props.firebaseKey + "/steps/" + item.key;

			var step = self.props.steps[item.key];

			var s = <TaskStep {...step} ref={self.onRef} index={index} number={counter} key={item.key} firebaseRefs={ self.props.firebaseRefs } firebaseKey={ newFirebaseKey } onChangeOrder={ self.onChangeOrder } />;
			if (step.type === "numbered") counter++;
			index++;

			return s;
		};

		return (
			<div className="task panel panel-default">
				<div className="panel-heading" role="tab" id="headingOne">
					<div className="input-group input-group-lg">
						<span className="input-group-btn">
							<button type="button" className="btn btn-default collapsed" data-toggle="collapse" data-parent="#accordion" href={"#collapse" + this.props.id}>Task</button>
						</span>
						<input type="text" className="form-control" placeholder="title" value={this.props.title} onChange={ this.onChange }></input>
					</div>
				</div>
				<div className="steps-panel panel-collapse collapse" role="tabpanel" id={ "collapse" + this.props.id }>
					{ $.map(priorities, createStep) }
					<div className="panel-footer">
					{/*
						<button className="btn btn-info" onClick={ this.onClickAddStep }>Add Step</button>
					*/}
					</div>
				</div>
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