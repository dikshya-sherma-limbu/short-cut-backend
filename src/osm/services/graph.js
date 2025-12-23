// create the graph from the OSM response data

// add travel mode filter - for Walking paths
const isWalking = (tags) => {

    const walkableHighways = [
        'footway',       // Dedicated footpath
        'path',          // Generic path
        'pedestrian',    // Pedestrian area
        'steps',         // Stairs
        'sidewalk',      // Sidewalk
        'crossing',      // Pedestrian crossing
        'residential',   // Residential street (usually has sidewalks)
        'living_street', // Slow street with pedestrian priority
        'service',       // Service road
        'track',         // Agricultural/forest track
        'unclassified',  // Minor road
        'tertiary',      // Tertiary road
        'secondary',     // Secondary road
        'primary'        // Primary road (usually has sidewalks)
    ];

    // explicit tag check
    if(tags.foot ==="no") return false;

    // check if highway tag is in walkable list
    return  walkableHighways.includes(tags.highway); // returns true if walkable

}

// add travel mode filter - for Bicycling paths
const isBicycling = (tags) => {
    const bikeFriendlyHighways = [
        'cycleway',      // Dedicated cycle path
        'path',          // Generic path
        'residential',   // Residential street
        'living_street', // Slow street with pedestrian priority
        'service',       // Service road
        'track',         // Agricultural/forest track
        'unclassified',  // Minor road
        'tertiary',      // Tertiary road
        'secondary',     // Secondary road
        'primary'        // Primary road
    ];
    // explicit tag check
    if(tags.bicycle ==="no") return false;

    // Don't allow motorways or trunks (highways)
    if (tags.highway === 'motorway' || tags.highway === 'trunk') return false;

    // check if highway tag is in bike-friendly list
    return bikeFriendlyHighways.includes(tags.highway); // returns true if bikeable
}

// add travel mode filter - for Driving paths
const isDriving = (tags) => {
    const drivableHighways = [
        'motorway',
        'trunk',
        'primary',  
        'secondary',
        'tertiary',
        'residential',
        'service',
        'unclassified'
    ];
    // explicit tag check
    if(tags.motor_vehicle ==="no" || tags.motorcar === "no") return false;
    return drivableHighways.includes(tags.highway); // returns true if drivable
}

// main function to check if way is valid for travel mode
export const isWayValidForTravelMode = (tags, travelMode) => {

    //check if tags exist and has highway tag
    if(!tags || !tags.highway) {
        return false; // no highway tag means not valid
    }

    //check explicit access restrictions first
    if(tags.access === "no" || tags.access === "private") {
        return false;
    }

    switch (travelMode) {
        case 'walking':
            return isWalking(tags);
        case 'bicycling':
            return isBicycling(tags);

        case 'driving':
            return isDriving(tags);
        default:
            return false;
    }
}

// create graph nodes and edges from OSM data 

export const createGraph = (osmData, travelMode) => {

    const graph ={
        nodes: new Map(), // nodeId -> {lat, lon, edges: [{to: nodeId, wayId}]}
        edges: new Map()  // wayId -> {from: nodeId, to: nodeId, tags}
    }

    // 1. add all nodes to graph
    let nodeCount = 0; // keeps track of number of nodes added
    osmData.elements.forEach(element => {
        if(element.type === 'node') {
            graph.nodes.set(element.id, {
                id: element.id,
                lat: element.lat,
                lon: element.lon,
                tags: element.tags || {},
            });
            graph.edges.set(element.id, []); // initialize empty edges array to the given node id
            nodeCount++;
        }
    });

    // 2. add ways as edges to graph
    let wayCount = 0;
    let filteredWayCount = 0;
    osmData.elements.forEach(element => {
        if(element.type === 'way') {
            wayCount++;
            // if way isn't valid for travel mode, skip it
            if(!isWayValidForTravelMode(element.tags, travelMode)) {
                filteredWayCount++;
                return; // it will stop processing this way and move to next
            }

            // create edges between consecutive nodes in the "way"
            for(let i=0; i < element.nodes.length -1; i++) {
                const fromNodeId = element.nodes[i];
                const toNodeId = element.nodes[i+1];

                // get the lon and lat of from and to nodes
                const fromNode = graph.nodes.get(fromNodeId);
                const toNode = graph.nodes.get(toNodeId);

                if(!fromNode || !toNode) {
                    // one of the nodes is missing in the graph (not in OSM data)
                    continue; // skip this edge
                }

                // get the distance between the two nodes
                const distance = haversineDistance(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);

                // add edge from "fromNode" to "toNode"
                graph.edges.get(fromNodeId).push({
                    to: toNodeId,
                    wayId: element.id,
                    distance
                });

                // if way is one-way, do not add edge in the opposite direction
                if(isOneWay(element.tags)) {
                    continue;
                }

                // add edge from "toNode" to "fromNode" for two-way ways
                graph.edges.get(toNodeId).push({
                    to: fromNodeId,
                    wayId: element.id,
                    distance
                });

            }
        }
    });


    console.log(`Graph created with ${nodeCount} nodes and ${wayCount - filteredWayCount} ways (filtered out ${filteredWayCount} ways).`);
    return graph;

}

// helper function to calculate distance between two lat/lon points using Haversine formula
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const earthRadiusKm = 6371; // radius of the Earth in kilometers

    // distance between latitudes and longitudes
    const dLat =(lat2 - lat1) * Math.PI / 180;
    const dLon =(lon2 - lon1) * Math.PI / 180;

    //convert to radians
    const radianLat1 = lat1 * Math.PI / 180;
    const radianLat2 = lat2 * Math.PI / 180;

    // apply Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radianLat1) * Math.cos(radianLat2); // square of half the chord length between the points
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // angular distance in radians

    return earthRadiusKm * c; // distance in kilometers
}

// helper function to check the way is one-way based on its tags
export const isOneWay = (tags) => {
    if(!tags) return false;
    return tags?.oneway === 'yes' || tags.oneway === 'true' || tags.oneway === '1'; // it's one-way if any of these values match
}