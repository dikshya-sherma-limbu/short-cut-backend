// function to calculate the bounding box of a set of coordinates

export const calculateBoundingBox = ([origin, destination]) => {
    if (!origin || !destination) {
        throw new Error("Invalid coordinates");
    }

    const minLon = Math.min(origin.longitude, destination.longitude) - 0.05;
    const maxLon = Math.max(origin.longitude, destination.longitude) + 0.05;
    const minLat = Math.min(origin.latitude, destination.latitude) - 0.05;
    const maxLat = Math.max(origin.latitude, destination.latitude) + 0.05;

    // Overpass requires: south, west, north, east
    return [minLat, minLon, maxLat, maxLon];
};

// function to build an Overpass QL query for driving routes within a bounding box
export const buildDrivingOverpassQuery = (bbox) => {
    const [south, west, north, east] = bbox;
    //[out:json] -  specifies the output format (json, xml, csv)
    return `[out:json];              
        (
          way
            ["highway"]
            ["highway"~"motorway|trunk|primary|secondary|tertiary|residential|service"]
            (${south},${west},${north},${east});
        );
        (._;>;);
        out body;
    `;
    // way - means get all way elements
    // ["highway"] - filter to only highway tagged ways
    // (${south},${west},${north},${east}) - bounding box
    // (._;>;); - get all nodes of the ways
    // out body; - specifies the output in detail level (body, skel, tags)
};

//function to build an overpass QL query for bicycle routes within a bounding box
export const buildBicycleOverpassQuery = (bbox) => {
    const [south, west, north, east] = bbox;
    return `[out:json];              
        (
          way
             ["highway"]
             ["bicycle"~"yes|designated|permissive"]
            (${south},${west},${north},${east});
        );
        (._;>;);
        out body;
    `;
}
// function to build an overpass QL query for pedestrian routes within a bounding box
export const buildPedestrianOverpassQuery = (bbox) => {
    const [south, west, north, east] = bbox;
    return `[out:json]; 
        (
          way
            
            ["highway"~"footway|path|pedestrian|steps|track|residential|service"]
            (${south},${west},${north},${east});
        );  
        (._;>;);
        out body;
    `;
}