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
        
        console.log(' LOG  Origin:', origin);
        console.log(' LOG  Destination:', destination);
        console.log(' LOG  Travel Mode:', travelMode);
        
        const transitRequest = new Transit({
            origin: JSON.parse(origin),
            destination: JSON.parse(destination),
            travelMode
        }); // need this to be an instance of Transit class to pass to controller method
        
        // call controller method to find shortest path
        const shortestPathResult = await transitController.findShortestPath(transitRequest);

        res.status(200).json(shortestPathResult);
       
    } catch (error) {
        console.log(' ERROR  in /shortest-route:', error);
        res.status(500).json({error: 'Failed to get shortest route'});
    }

});


export default router;