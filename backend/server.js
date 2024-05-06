const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// Set Templating Engine
app.set("view engine", "ejs");

//MySQL Setup
async function connectToMySQL() {
    const connection = await mysql.createConnection({
        host: "localhost",
        port: 3333,
        user: "root",
        password: "root",
        database: "testdb"
    })

    return connection;
}

let db;

(async () => {
    db = await connectToMySQL();
})();



app.get("/", (req, res) => {
    res.send("Welcome to the Task List API");
})

app.get("/todos", async (req, res) => {
    
    await fetchTasks(res);
    
})

app.post("/addtask", async (req, res) => {

    const data = req.body;

    try {
        const addSQL = `INSERT INTO tasks (task) VALUES(?)`;

        const add = await db.query(addSQL, [data.task]);

        res.render("templates/item", {task: data.task});
    } catch (error) {
        console.log(error)
    }
})

app.post("/updatetask", async (req, res) => {

    const data = req.body;

    try {
        const updateSQL = `UPDATE tasks SET task=? AND done=? WHERE id=?`;

        const update = await db.query(updateSQL, [data.task, data.done, data.id]);

        await fetchTasks(res)
    } catch (error) {
        console.log(error)
    }
})

app.post("/deletetask", async (req, res) => {

    const data = req.body;

    try {
        const deleteSQL = `DELETE FROM tasks WHERE id=?`;

        const deleteRequest = await db.query(updateSQL, [data.id]);

        await fetchTasks(res)
    } catch (error) {
        console.log(error)
    }
})

async function fetchTasks(res) {
    const fetchSQL = `SELECT * FROM tasks`;

    try {
        const [results, fields] = await db.query(fetchSQL);
        
        res.render("templates/todos", {
            tasks: results
        })

    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }

}


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is now listening on port: ${PORT}`)
})