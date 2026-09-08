from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)


# Database connection
def get_db_connection():
    conn = sqlite3.connect("tasks.db")
    conn.row_factory = sqlite3.Row
    return conn


# Create database table
def init_db():
    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'Pending',
            priority TEXT DEFAULT 'Medium',
            due_date TEXT
        )
    """)

    conn.commit()
    conn.close()


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Get all tasks
@app.route("/tasks", methods=["GET"])
def get_tasks():
    conn = get_db_connection()
    tasks = conn.execute("SELECT * FROM tasks").fetchall()
    conn.close()

    return jsonify([dict(task) for task in tasks])


# Add new task
@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json

    conn = get_db_connection()

    conn.execute(
        """
        INSERT INTO tasks (title, description, priority, due_date)
        VALUES (?, ?, ?, ?)
        """,
        (
            data["title"],
            data.get("description", ""),
            data.get("priority", "Medium"),
            data.get("due_date", "")
        )
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Task added successfully!"})


# Update task
@app.route("/tasks/<int:id>", methods=["PUT"])
def update_task(id):
    data = request.json

    conn = get_db_connection()

    conn.execute(
        """
        UPDATE tasks
        SET title = ?, description = ?, status = ?, priority = ?, due_date = ?
        WHERE id = ?
        """,
        (
            data["title"],
            data.get("description", ""),
            data.get("status", "Pending"),
            data.get("priority", "Medium"),
            data.get("due_date", ""),
            id
        )
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Task updated successfully!"})


# Delete task
@app.route("/tasks/<int:id>", methods=["DELETE"])
def delete_task(id):
    conn = get_db_connection()

    conn.execute("DELETE FROM tasks WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Task deleted successfully!"})


# Run application
if __name__ == "__main__":
    init_db()
    app.run(debug=True)