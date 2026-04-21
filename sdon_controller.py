import networkx as nx
import matplotlib.pyplot as plt

# -------------------------------
# STEP 1: Create Network
# -------------------------------
G = nx.Graph()

# Add nodes
nodes = ["A", "B", "C", "D", "E"]
G.add_nodes_from(nodes)

# Add edges with weights (distance)
edges = [
    ("A", "B", 2),
    ("A", "C", 5),
    ("B", "C", 1),
    ("B", "D", 4),
    ("C", "D", 2),
    ("C", "E", 3),
    ("D", "E", 1)
]

for u, v, w in edges:
    G.add_edge(u, v, weight=w)

# -------------------------------
# STEP 2: Compute Shortest Path
# -------------------------------
source = "A"
destination = "E"

path = nx.shortest_path(G, source, destination, weight='weight')
print("Initial Path:", path)

# -------------------------------
# STEP 3: Simulate Link Failure
# -------------------------------
print("\nSimulating failure: removing link C-D")
G.remove_edge("C", "D")

# Recompute path
new_path = nx.shortest_path(G, source, destination, weight='weight')
print("New Path after failure:", new_path)

# -------------------------------
# STEP 4: Visualize Graph
# -------------------------------
pos = nx.spring_layout(G)

plt.figure(figsize=(6,6))
nx.draw(G, pos, with_labels=True, node_color="lightblue", node_size=2000)

# Highlight new path
path_edges = list(zip(new_path, new_path[1:]))
nx.draw_networkx_edges(G, pos, edgelist=path_edges, edge_color='red', width=3)

plt.title("SDON Routing After Failure")
plt.show()