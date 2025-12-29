import axios from 'axios';
import { calculateBoundingBox, buildOverpassQuery } from '../utils/overpassQuery.js';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export const transitController = {

    // 1️ Calculate bounding box
    getBoundingBox(transitRequest) {
        const { origin, destination } = transitRequest;

        return calculateBoundingBox([
            origin.location,
            destination.location
        ]);
    },

    // 2️ Build Overpass QL query
    getOverpassQuery(travelMode, bbox) {
        return buildOverpassQuery(travelMode, bbox);
    },

    // 3️ Call Overpass API
    async getTransitData(overpassQuery) {
        try {
            const response = await axios.post(
                OVERPASS_URL,
                overpassQuery,
                {
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    timeout: 30000 // important for Overpass - 30 seconds timeout
                }
            );
            console.log('--- Overpass API request successful ---');
            // console.log('Overpass API response received. Element count:', response.data.elements.length);
            console.log('--- Begin Overpass API response log ---');
            console.log('Sample element:', response.data.elements[0]);
            console.log('--- End of Overpass API response log ---');
            return response.data;
        } catch (error) {
            console.error('Overpass API error:', error.message);
            throw new Error('Failed to fetch OSM data');
        }
    }
};
