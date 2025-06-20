let busNetUtils = {
	anchor: {
		tags: ["anchor"],
		query: (packet) => {
			return null;
		}
	},
	busModule: {
		tags: [],
		query: (packet) => {
			return null;
		}
	},
	call: (packet, source, connections) => {

		source = source != null ? source : module.anchor;
		connections = connections != null ? connections : busNetUtils.network;

		return busNetUtils.traverse(source, connections).map(node => {

			if(node == null) return null;
			if(typeof node.query != "function") return null;

			return node.query(packet);
		}).filter(item => item != null);
	},
	connect: (source, target, policies, mutual, connections) => {

		connections = connections != null ? connections : busNetUtils.network;
		
		source = Array.isArray(source) ? source : [source];
		target = Array.isArray(target) ? target : [target];

		policies = Array.isArray(policies) ? policies : [];
		
		for(let i = 0; i < source.length; i++) {
			
			for(let j = 0; j < target.length; j++) {
				
				busNetUtils.disconnect(source[i], target[j], connections);

				connections.push([source[i], target[j], policies]);
			}
		}
		
		if(mutual)
			busNetUtils.connect(target, source, policies, false, connections);
	},
	disconnect: (source, target, mutual, connections) => {

		connections = connections != null ? connections : busNetUtils.network;
		
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
			busNetUtils.disconnect(target, source, false, connections);
	},
	find: (source, connections) => {

		source = source != null ? source : module.anchor;
		connections = connections != null ? connections : busNetUtils.network;

		return busNetUtils.traverse(source, connections).filter(node => {

			if(node == null) return false;
			if(Array.isArray(node.tags)) return false;

			return true;
		});
	},
	getConnections: (source, connections) => {

		connections = connections != null ? connections : busNetUtils.network;
		
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
	},
	getConnectionPolicies: (source, target, connections) => {

		connections = connections != null ? connections : busNetUtils.network;

		for(let i = 0; i < connections.length; i++) {

			if(connections[i][0] === source && connections[i][1] === target)
				return connections[i][2];
		}

		return [];
	},
	isConnected: (source, target, policies, mutual, connections) => {

		connections = connections != null ? connections : busNetUtils.network;
		
		source = Array.isArray(source) ? source : [source];
		target = Array.isArray(target) ? target : [target];

		policies = Array.isArray(policies) ? policies : [];
		
		for(let i = 0; i < source.length; i++) {
			
			let sourceConnections =
				busNetUtils.getConnections(source[i], connections);
			
			for(let j = 0; j < target.length; j++) {
				
				if(!sourceConnections.includes(target[j]))
					return false;
				
				let connectionPolicies =
					busNetUtils.getConnectionPolicies(
						source[i], target[j], connections
					);

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
				busNetUtils.isConnected(
					source, target, false, false, connections
				) :
				true
		);
	},
	network: [],
	privateConnection: (path, connection) => {
		return path.length <= 1;
	},
	traverse: (source, connections, path) => {

		connections = connections != null ? connections : busNetUtils.network;

		path = path != null ? path : [];

		if(path.includes(source))
			return;

		path.push(source);
		
		let sourceConnections =
			busNetUtils.getConnections(source, connections);
		
		for(let i = 0; i < sourceConnections.length; i++) {

			let policies =
				busNetUtils.getConnectionPolicies(
					source, sourceConnections[i], connections
				);
				
			let valid = true;
		
			for(let j = 0; j < policies.length && valid; j++) {

				if(!policies[j](path, sourceConnections[i]))
					valid = false;
			}

			if(valid)
				busNetUtils.traverse(sourceConnections[i], connections, path);
		}
		
		return path;
	}
};

if(typeof module == "object")
	module.exports = busNetUtils;