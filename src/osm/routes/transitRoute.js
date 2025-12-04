//routes to handle transit related requests
import express from 'express';
const router = express.Router();
import Transit from '../models/transit.js';
import { transitController } from '../controller/transitController.js';



//GET - get the shortest transit route between two points

router.get('/shortest-route', async (req, res) => {
    try {
        const { origin, destination, travelMode } = req.query;

        const transitRequest = new Transit({
            origin: JSON.parse(origin),
            destination: JSON.parse(destination),
            travelMode
        }); // need this to be an instance of Transit class to pass to controller method
        const route = await transitController.getShortestRoute(transitRequest);
        res.status(200).json(route);
    } catch (error) {
        res.status(500).json({error: 'Failed to get shortest route'});
    }

});