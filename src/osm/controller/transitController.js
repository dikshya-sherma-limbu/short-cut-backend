//get the data from the openrouteservice api for transit features
const axios = require('axios');
import { calculateBoundingBox } from '../utils/overpassQuery';


export const transitController = {
 //get bounding box for transit route
      getBoundingBox: (transitRequest) => {
        const { origin, destination } = transitRequest;

        const bbox = calculateBoundingBox([
            origin.location,
            destination.location
        ]);

        return bbox;
    }



};

