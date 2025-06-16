let busModule = {
	tags: [],
	query: (packet) => {
		return null;
	}
}

let anchor = Object.assign(
	Object.assign({ }, busModule),
	{tags: ["anchor"]}
);

var network = [];

function call(packet, source, connections) {

	source = source != null ? source : module.anchor;
	connections = connections != null ? connections : network;

	return traverse(source, connections).map(node => {

		if(node == null) return null;
		if(typeof node.query != "function") return null;

		return node.query(packet);
	}).filter(item => item != null);
}

function find(source, connections) {

	source = source != null ? source : module.anchor;
	connections = connections != null ? connections : network;

	return traverse(source, connections).filter(node => {

		if(node == null) return false;
		if(Array.isArray(node.tags)) return false;

		return true;
	});
}

function connect(source, target, policies, mutual, connections) {

	connections = connections != null ? connections : network;
	
	source = Array.isArray(source) ? source : [source];
	target = Array.isArray(target) ? target : [target];

	policies = Array.isArray(policies) ? policies : [];
	
	for(let i = 0; i < source.length; i++) {
		
		for(let j = 0; j < target.length; j++) {
			
			disconnect(source[i], target[j], connections);

			connections.push([source[i], target[j], policies]);
		}
	}
	
	if(mutual)
		connect(target, source, policies, false, connections);
}

function disconnect(source, target, mutual, connections) {

	connections = connections != null ? connections : network;
	
	source = Array.isArray(source) ? source : [source];
	target = Array.isArray(target) ? target : [target];
	
	for(let i = 0; i < connections.length; i++) {
	
		let valid = false;
	
		for(let j = 0; j < source.length && !valid; j++) {
			
			for(let k = 0; k < target.length && !valid; k++) {
				
				valid =
					connections[i][0] === source[j] &&
					connections[i][1] === target[k];
			}
		}
		
		if(valid) {
			
			connections.splice(i, 1);
			
			i--;
		}
	}
	
	if(mutual)
		disconnect(target, source, false, connections);
}

function getConnections(source, connections) {

	connections = connections != null ? connections : network;
	
	source = Array.isArray(source) ? source : [source];
	
	let sourceConnections = [];
	
	for(let i = 0; i < connections.length; i++) {
	
		for(let j = 0; j < source.length; j++) {
		
			if(connections[i][0] === source[j]) {
			
				sourceConnections.push(connections[i][1]);
				
				break;
			}
		}
	}
	
	return sourceConnections;
}

function getConnectionPolicies(source, target, connections) {

	connections = connections != null ? connections : network;

	for(let i = 0; i < connections.length; i++) {

		if(connections[i][0] === source && connections[i][1] === target)
			return connections[i][2];
	}

	return [];
}

function isConnected(source, target, policies, mutual, connections) {

	connections = connections != null ? connections : network;
	
	source = Array.isArray(source) ? source : [source];
	target = Array.isArray(target) ? target : [target];

	policies = Array.isArray(policies) ? policies : [];
	
	for(let i = 0; i < source.length; i++) {
		
		let sourceConnections = getConnections(source[i], connections);
		
		for(let j = 0; j < target.length; j++) {
			
			if(!sourceConnections.includes(target[j]))
				return false;
			
			let connectionPolicies =
				getConnectionPolicies(source[i], target[j], connections);

			if(policies.length != connectionPolicies.length)
				return false;

			for(let i = 0; i < policies.length; i++) {

				if(policies[i] != connectionPolicies[i])
					return false;
			}
		}
	}
	
	return true && (
		mutual ?
			isConnected(source, target, false, false, connections) :
			true
	);
}

function privateConnection(path, connection) {
	return path.length <= 1;
}

function traverse(source, connections, path) {

	connections = connections != null ? connections : network;

	path = path != null ? path : [];

	if(path.includes(source))
		return;

	path.push(source);
	
	let sourceConnections = getConnections(source, connections);
	
	for(let i = 0; i < sourceConnections.length; i++) {

		let policies =
			getConnectionPolicies(source, sourceConnections[i], connections);
			
		let valid = true;
	
		for(let j = 0; j < policies.length && valid; j++) {

			if(!policies[j](path, sourceConnections[i]))
				valid = false;
		}

		if(valid)
			traverse(sourceConnections[i], connections, path);
	}
	
	return path;
}

module.exports = {
	anchor,
	busModule,
	network,
	call,
	find,
	getConnections,
	getConnectionPolicies,
	isConnected,
	connect,
	disconnect,
	privateConnection,
	traverse
};