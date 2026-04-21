from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import networkx as nx
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app)  # ✅ MUST BE HERE

# -------------------------------
# Create Graph
# -------------------------------
def create_graph():
    G = nx.Graph()
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
    return G

# -------------------------------
# Path Cost
# -------------------------------
def path_cost(G, path):
    cost = 0
    for i in range(len(path) - 1):
        cost += G[path[i]][path[i+1]]['weight']
    return cost

# -------------------------------
# Draw Graph
# -------------------------------
def draw_graph(G, path=None):
    pos = nx.spring_layout(G, seed=42)

    plt.figure(figsize=(5,5))
    nx.draw(G, pos, with_labels=True, node_color="lightblue", node_size=1500)

    if path and isinstance(path, list):
        edges = list(zip(path, path[1:]))
        nx.draw_networkx_edges(G, pos, edgelist=edges, edge_color='red', width=3)

    plt.savefig("static/graph.png")
    plt.close()

# -------------------------------
# FRONTEND (OLD HTML - optional)
# -------------------------------
@app.route("/", methods=["GET", "POST"])
def index():
    return "Backend is running 🚀"

# -------------------------------
# API ROUTE (IMPORTANT)
# -------------------------------
@app.route("/api/route", methods=["POST"])
def api_route():
    data = request.get_json()

    source = data.get("source")
    destination = data.get("destination")
    fail_u = data.get("fail_u")
    fail_v = data.get("fail_v")

    G = create_graph()

    try:
        # Original path
        path = nx.shortest_path(G, source, destination, weight='weight')
        cost = path_cost(G, path)

        # Apply failure
        if G.has_edge(fail_u, fail_v):
            G.remove_edge(fail_u, fail_v)

        # New path
        new_path = nx.shortest_path(G, source, destination, weight='weight')
        new_cost = path_cost(G, new_path)

    except nx.NetworkXNoPath:
        return jsonify({
            "error": "No path available"
        })

    # Draw graph with new path
    draw_graph(G, new_path)

    return jsonify({
        "path": path,
        "cost": cost,
        "new_path": new_path,
        "new_cost": new_cost,
        "image_url": "http://127.0.0.1:5000/static/graph.png"
    })

# -------------------------------
# RUN
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)