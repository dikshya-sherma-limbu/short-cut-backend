
// data structures for transit features
/**
 *  LOG  Origin: {"location": {"latitude": 43.762812, "longitude": -79.2000279}}
 LOG  Destination: {"location": {"latitude": 43.6544382, "longitude": -79.3806994}}
 LOG  Travel Mode: driving
 */
class Transit {
  constructor({origin, destination, travelMode}) {
    // origin and destination are objects with { latitude, longitude }
    this.origin = origin;      // { location: { latitude: xx, longitude: yy } } - means it will have a location property 
    this.destination = destination; // { location: { latitude: xx, longitude: yy } }
    this.travelMode = travelMode;
  }
}

export default Transit;

