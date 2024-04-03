const express=require("express");
const app=express();
const mysql = require('mysql2/promise');
const path=require("path");

const methodOverride = require('method-override');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride('_method'));

// MySQL connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Naseer0786',
    database: 'node',
});

app.get("/",(req,res)=>{
    res.render("home.ejs");
})

app.get("/register",(req,res)=>{
    res.render("register.ejs");
})

app.post("/register", async (req, res) => {
    let { username, password } = req.body;
    console.log(req.body);
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
        );
        connection.release();
        // res.render("welcome.ejs", { username });
        res.render("login.ejs");
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.post("/login", async (req, res) => {
    let { username, password } = req.body;
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        connection.release();
        if (rows.length > 0) {
            // console.log(rows);
            res.render("welcome.ejs", { rows: rows }); // or redirect to a welcome page
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

app.get("/edit/:id", async (req, res) => {
    let { id } = req.params;
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        connection.release();
        if (rows.length > 0) {
            const user = rows[0];
            res.render("edit.ejs", { user }); // Pass user data to the template
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});


app.patch("/edit/:id", async (req, res) => {
    let { id } = req.params;
    let { username, password } = req.body;
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'UPDATE users SET username = ?, password = ? WHERE id = ?',
            [username, password, id]
        );
        connection.release();
        if (result.affectedRows > 0) {
            res.render("login.ejs");
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

app.get("/delete/:id", async (req, res) => {
    try {
        let { id } = req.params;
        console.log(id);
        
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'DELETE FROM users WHERE id=?',
            [id]
        );
        connection.release();
        
        if (result.affectedRows > 0) {
            res.render("home.ejs");
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
    // res.send("delete req is getting!");
});

app.listen("3000",()=>{
    console.log("server listening port number: 3000")
})