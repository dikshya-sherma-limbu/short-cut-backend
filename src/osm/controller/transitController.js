import axios from 'axios';
import { calculateBoundingBox, buildOverpassQuery } from '../utils/overpassQuery.js';
import { createGraph } from '../services/graph.js';
import { findNearestNode, dijkstraOSM } from '../services/dijkstra.js';
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
    },

    //4. find shortest path using Dijkstra's algorithm 
    async findShortestPath(transitRequest) {
        const { origin, destination, travelMode } = transitRequest;

        console.log('\nFinding shortest path with the following parameters:');
        console.log('  Origin:', origin);
        console.log('  Destination:', destination);
        console.log('  Travel Mode:', travelMode);
        // 1️ Calculate bounding box
        const bbox = this.getBoundingBox(transitRequest);
        // 2️ Build Overpass QL query
        const overpassQuery = this.getOverpassQuery(travelMode, bbox);
        // 3️ Call Overpass API to get OSM data
        const osmData = await this.getTransitData(overpassQuery);
        // 4️ Create graph from OSM data
        const graph = createGraph(osmData, travelMode);

        // 5️ Find nearest nodes to origin and destination
        const startNode = findNearestNode(graph, origin.location.latitude, origin.location.longitude);
        const endNode = findNearestNode(graph, destination.location.latitude, destination.location.longitude);

        console.log(`  Nearest start node: ${startNode.id} at (${startNode.lat}, ${startNode.lon})`);
        console.log(`  Nearest end node: ${endNode.id} at (${endNode.lat}, ${endNode.lon})`);
        // 6️ Find shortest path using Dijkstra's algorithm
        const shortestPath = dijkstraOSM(graph, startNode, endNode);

        if (!shortestPath) {
            throw new Error('No path found between the specified origin and destination.');
        }

        // 7️ Return the shortest path
        return {
            success: true,
            path: shortestPath
        }

    }
};
