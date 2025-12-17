// ============================================
// STEP 1: Understanding the Data Structure
// ============================================

// Sample OSM data (simplified)
const sampleOSMData = {
    elements: [
        // NODES (points on the map)
        { type: "node", id: 100, lat: 43.65, lon: -79.38 },
        { type: "node", id: 101, lat: 43.66, lon: -79.38 },
        { type: "node", id: 102, lat: 43.66, lon: -79.39 },
        { type: "node", id: 103, lat: 43.65, lon: -79.39 },
        
        // WAYS (connections between nodes)
        {
            type: "way",
            id: 500,
            nodes: [100, 101, 102], // This connects: 100→101→102
            tags: { highway: "footway" }
        },
        {
            type: "way",
            id: 501,
            nodes: [102, 103], // This connects: 102→103
            tags: { highway: "path" }
        }
    ]
};

// ============================================
// STEP 2: Create Basic Graph Structure
// ============================================

function buildSimpleGraph(osmData) {
    // Graph will have:
    // 1. nodes: stores all node information
    // 2. connections: stores which nodes connect to which
    
    const graph = {
        nodes: {},        // nodeId -> {lat, lon}
        connections: {}   // nodeId -> [list of connected nodeIds]
    };
    
    console.log("=== STEP 2.1: Processing Nodes ===");
    
    // First pass: Store all nodes
    osmData.elements.forEach(element => {
        if (element.type === "node") {
            graph.nodes[element.id] = {
                lat: element.lat,
                lon: element.lon
            };
            // Initialize empty connection list
            graph.connections[element.id] = [];
            
            console.log(`Stored node ${element.id} at (${element.lat}, ${element.lon})`);
        }
    });
    
    console.log("\n=== STEP 2.2: Processing Ways (Connections) ===");
    
    // Second pass: Create connections from ways
    osmData.elements.forEach(element => {
        if (element.type === "way") {
            console.log(`\nProcessing way ${element.id}:`);
            console.log(`  Nodes in order: [${element.nodes.join(', ')}]`);
            
            // Loop through consecutive pairs of nodes
            for (let i = 0; i < element.nodes.length - 1; i++) {
                const fromNodeId = element.nodes[i];
                const toNodeId = element.nodes[i + 1];
                
                console.log(`  Connecting: ${fromNodeId} → ${toNodeId}`);
                
                // Add connection (both directions for walking)
                graph.connections[fromNodeId].push(toNodeId);
                graph.connections[toNodeId].push(fromNodeId);
            }
        }
    });
    
    return graph;
}

// ============================================
// STEP 3: Visualize the Graph
// ============================================

function printGraph(graph) {
    console.log("\n=== FINAL GRAPH STRUCTURE ===\n");
    
    console.log("NODES:");
    for (const [nodeId, data] of Object.entries(graph.nodes)) {
        console.log(`  Node ${nodeId}: (${data.lat}, ${data.lon})`);
    }
    
    console.log("\nCONNECTIONS:");
    for (const [nodeId, connections] of Object.entries(graph.connections)) {
        console.log(`  Node ${nodeId} connects to: [${connections.join(', ')}]`);
    }
}

// ============================================
// STEP 4: Understanding How Ways Work
// ============================================

function explainWay(wayData) {
    console.log("\n=== UNDERSTANDING A WAY ===");
    console.log(`Way ID: ${wayData.id}`);
    console.log(`Type: ${wayData.tags.highway}`);
    console.log(`Node sequence: [${wayData.nodes.join(' → ')}]`);
    console.log("\nThis means:");
    
    for (let i = 0; i < wayData.nodes.length - 1; i++) {
        console.log(`  - You can walk from node ${wayData.nodes[i]} to node ${wayData.nodes[i + 1]}`);
    }
    
    console.log("\nSince it's not a one-way street, you can also walk backwards:");
    for (let i = wayData.nodes.length - 1; i > 0; i--) {
        console.log(`  - You can walk from node ${wayData.nodes[i]} to node ${wayData.nodes[i - 1]}`);
    }
}

// ============================================
// RUN THE EXAMPLE
// ============================================

console.log("╔════════════════════════════════════════╗");
console.log("║   BUILDING A GRAPH FROM OSM DATA      ║");
console.log("╔════════════════════════════════════════╗\n");

// Build the graph
const graph = buildSimpleGraph(sampleOSMData);

// Print the final graph
printGraph(graph);

// Explain how a way works
explainWay(sampleOSMData.elements[4]); // First way

// ============================================
// STEP 5: Searching the Graph
// ============================================

console.log("\n=== STEP 5: USING THE GRAPH ===");

function findPath(graph, startNodeId, endNodeId) {
    console.log(`\nFinding neighbors of node ${startNodeId}:`);
    const neighbors = graph.connections[startNodeId];
    console.log(`  Neighbors: [${neighbors.join(', ')}]`);
    
    console.log(`\nFrom node ${startNodeId}, I can reach these nodes directly:`);
    neighbors.forEach(neighborId => {
        const node = graph.nodes[neighborId];
        console.log(`  → Node ${neighborId} at (${node.lat}, ${node.lon})`);
    });
}

findPath(graph, 100, 102);

// ============================================
// KEY CONCEPTS SUMMARY
// ============================================

console.log("\n╔════════════════════════════════════════╗");
console.log("║          KEY CONCEPTS                  ║");
console.log("╚════════════════════════════════════════╝");
console.log(`
1. NODES are points (vertices) with coordinates
   - They're just locations on the map
   - Example: {id: 100, lat: 43.65, lon: -79.38}

2. WAYS are paths (edges) that connect nodes
   - They have a list of node IDs in ORDER
   - Example: {nodes: [100, 101, 102]} means 100→101→102
   
3. THE KEY INSIGHT: 
   - Ways tell you which nodes connect!
   - If a way has nodes [A, B, C], then:
     * A connects to B
     * B connects to C
     * (and reverse if not one-way)

4. GRAPH STRUCTURE:
   - Nodes: stores coordinates
   - Connections: stores which nodes link together
   - This is called an "adjacency list"

5. NEXT STEP:
   - Add distances (weights) to connections
   - Add filtering (only walkable paths)
   - Implement pathfinding algorithm
`);