//routes to handle transit related requests
import express from 'express';
const router = express.Router();
import Transit from '../models/transit.js';
import { transitController } from '../controller/transitController.js';




//GET - get the shortest transit route between two points

router.get('/shortest-route', async (req, res) => {
    try {
        const { origin, destination, travelMode } = req.query;

        if (!origin || !destination || !travelMode) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }

        const transitRequest = new Transit({
            origin: JSON.parse(origin),
            destination: JSON.parse(destination),
            travelMode
        }); // need this to be an instance of Transit class to pass to controller method
        // 1️ bbox
        const bbox = transitController.getBoundingBox(transitRequest);

        // 2️ overpass query
        const query = transitController.getOverpassQuery(travelMode, bbox);

        // 3️ fetch raw OSM data
        const osmData = await transitController.getTransitData(query);

        res.status(200).json({
            bbox,
            travelMode,
            count: osmData.elements.length,
            data: osmData
        });
       
    } catch (error) {
        res.status(500).json({error: 'Failed to get shortest route'});
    }

});


export default router;