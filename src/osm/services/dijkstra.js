import { haversineDistance } from "./graph.js";


export const findNearestNode = (graph, lat, lon, maxDistance = 500) => {
    console.log(`  Finding nearest connected node to (${lat}, ${lon})...`);
    
    let candidates = [];
    
    // Only consider nodes that have edges (are connected to paths)
    graph.nodes.forEach((node, id) => {
        const edges = graph.edges.get(id) || [];
        
        if (edges.length > 0) { // ← KEY: Only nodes with edges!
            const distance = haversineDistance(lat, lon, node.lat, node.lon);
            
            if (distance <= maxDistance) {
                candidates.push({
                    node,
                    distance,
                    edgeCount: edges.length
                });
            }
        }
    });
    
    if (candidates.length === 0) {
        console.log(`    ✗ No connected nodes within ${maxDistance}m`);
        console.log(`    Trying larger radius (${maxDistance * 2}m)...`);
        
        // Try again with double the radius
        if (maxDistance < 2000) { // Don't go beyond 2km
            return findNearestNode(graph, lat, lon, maxDistance * 2);
        }
        
        console.log(`    ✗ No connected nodes found even at 2km radius!`);
        return null;
    }
    
    // Sort by distance, pick closest
    candidates.sort((a, b) => a.distance - b.distance);
    
    const chosen = candidates[0];
    console.log(`    ✓ Found: Node ${chosen.node.id} at ${chosen.distance.toFixed(2)}m (${chosen.edgeCount} edges)`);
    
    return chosen.node;
};
//2. Dijkstra's algorithm to find shortest path
// dijkstra.js - Update the neighbor checking part
export const dijkstraOSM = (graph, startNode, endNode) => {
    console.log(`\nRunning Dijkstra's algorithm...`);
    console.log(`  Start: Node ${startNode.id}`);
    console.log(`  End: Node ${endNode.id}`);
    
    // Debug: Check if start node has edges
    const startEdges = graph.edges.get(startNode.id) || [];
    const endEdges = graph.edges.get(endNode.id) || [];
    console.log(`  Start node has ${startEdges.length} edges`);
    console.log(`  End node has ${endEdges.length} edges`);
    
    if (startEdges.length === 0) {
        console.log(`  ✗ ERROR: Start node has no edges!`);
        return null;
    }
    
    if (endEdges.length === 0) {
        console.log(`  ✗ ERROR: End node has no edges!`);
        return null;
    }
    
    // Initialize
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    
    graph.nodes.forEach((node, id) => {
        distances.set(id, Infinity);
        unvisited.add(id);
    });
    distances.set(startNode.id, 0);
    
    console.log(`  Initialized ${unvisited.size} nodes\n`);
    
    // Main loop
    let iterations = 0;
    while (unvisited.size > 0) {
        iterations++;
        
        // Find unvisited node with minimum distance
        let currentId = null;
        let minDist = Infinity;
        
        unvisited.forEach(id => {
            if (distances.get(id) < minDist) {
                minDist = distances.get(id);
                currentId = id;
            }
        });
        
        // No reachable nodes left
        if (currentId === null || minDist === Infinity) {
            console.log(`  ✗ No path found after ${iterations} iterations\n`);
            return null;
        }
        
        // Reached destination
        if (currentId === endNode.id) {
            console.log(`  ✓ Found path in ${iterations} iterations\n`);
            break;
        }
        
        // Mark as visited
        unvisited.delete(currentId);
        
        // Check neighbors
        const neighbors = graph.edges.get(currentId) || [];
        neighbors.forEach(edge => {
            if (unvisited.has(edge.to)) {
                // ← Changed from edge.weight to edge.distance
                const alt = distances.get(currentId) + edge.distance;
                if (alt < distances.get(edge.to)) {
                    distances.set(edge.to, alt);
                    previous.set(edge.to, currentId);
                }
            }
        });
    }
    
    // Reconstruct path
    const path = [];
    let current = endNode.id;
    
    while (current !== undefined) {
        const node = graph.nodes.get(current);
        path.unshift({
            id: current,
            lat: node.lat,
            lon: node.lon
        });
        current = previous.get(current);
    }
    
    return {
        path: path,
        distance: distances.get(endNode.id),
        waypoints: path.length
    };
};
