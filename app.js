const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (req, res) => {
  const details = req.query;
  const { search_q = "", priority = "", status = "" } = req.query;
  console.log(search_q, priority, status);

  const Query = `SELECT * FROM todo WHERE status LIKE '%${status}%' and 
  priority LIKE '%${priority}%' and todo LIKE '%${search_q}%';`;

  const result = await db.all(Query);
  res.send(result);
});

app.get("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const Query = `SELECT * FROM todo WHERE id=${todoId};`;
  const result = await db.get(Query);
  res.send(result);
});
app.use(express.json());
app.post("/todos/", async (req, res) => {
  //console.log(req.body);
  const { id, todo, priority, status } = req.body;

  const Query = `INSERT INTO todo(id,todo,priority,status)
     VALUES(${id},'${todo}','${priority}','${status}');`;
  const result = await db.run(Query);
  res.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (req, res) => {
  const todoId = req.params;
  const { status = "", priority = "", todo = "" } = req.query;
  console.log(req.body.status, req.body.priority, req.body.todo);

  switch (true) {
    case req.body.status !== undefined:
      const Query = `UPDATE todo SET status='${status}'
             WHERE id = ${todoId.todoId};`;

      await db.run(Query);
      res.send("Status Updated");
      break;
    case req.body.priority !== undefined:
      const Query2 = `UPDATE todo SET priority='${priority}'
             WHERE id = ${todoId.todoId};`;

      await db.run(Query2);
      res.send("Priority Updated");
      break;
    case req.body.todo !== undefined:
      const Query3 = `UPDATE todo SET todo='${todo}'
             WHERE id = ${todoId.todoId};`;
      console.log("Todo");
      await db.run(Query3);
      res.send("Todo Updated");
      break;
  }
});

app.delete("/todos/:todoId", async (req, res) => {
  const todoId = req.params;
  const Query = `DELETE FROM todo WHERE id = ${todoId.todoId};`;
  await db.run(Query);
  res.send("Todo Deleted");
});

module.exports = app;
