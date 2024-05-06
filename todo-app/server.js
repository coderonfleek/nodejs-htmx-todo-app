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
    //res.send("Welcome to the Task List API");

    res.render("templates/home");
})

app.get("/todos", async (req, res) => {
    
    await fetchTasks(res);
    
})

app.get("/gettaskform", async (req, res) => {
    res.render("templates/addTaskForm")
})

app.post("/addtask", async (req, res) => {

    const data = req.body;

    try {
        const addSQL = `INSERT INTO tasks (task) VALUES(?)`;

        const add = await db.query(addSQL, [data.task]);

        //res.render("templates/item", {task: data.task});
        await fetchTasks(res)
    } catch (error) {
        console.log(error)
    }
})

app.get("/getupdateform/:id", async (req, res) => {

    const taskId = req.params.id;

    const task = await fetchTask(taskId);
    console.log(task);
    res.render("templates/updateTaskForm", { task })
})

app.post("/updatetask/:id", async (req, res) => {

    const taskId = req.params.id;
    const data = req.body;

    //Evaluate the "done" parameter
    let done
    switch (data.done) {
        case null:
            done = 0
            break;
        case "on":
            done = 1
            break;

        case "off":
            done = 0
            break;
    
        default:
            done = 0
            break;
    }

    try {
        const updateSQL = `UPDATE tasks SET task=?, done=? WHERE id=?`;

        const update = await db.query(updateSQL, [data.task, done, parseInt(taskId)]);

        await fetchTasks(res)
    } catch (error) {
        console.log(error)
    }
})

app.post("/deletetask/:id", async (req, res) => {

    const taskId = req.params.id;

    try {
        const deleteSQL = `DELETE FROM tasks WHERE id=?`;

        const deleteRequest = await db.query(deleteSQL, [taskId]);

        await fetchTasks(res)
    } catch (error) {
        console.log(error)
    }
})

async function fetchTask(id) {

    const fetchSingleSQL = `SELECT * FROM tasks WHERE id = ?`;

    try {
        const [rows] = await db.query(fetchSingleSQL, [id]);

        if(rows.length > 0){
            return rows[0]
        }else{
            return null;
        }
    } catch (error) {
        throw("Error retrieving task");
    }
}

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