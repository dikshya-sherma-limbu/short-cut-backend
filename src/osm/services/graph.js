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

    //1. add all nodes to graph

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
}

