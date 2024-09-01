const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT ?? 8000;
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const app = express();
const pool = require("./db");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json()); // To parse JSON request bodies
app.use(cors());

const initializeDatabase = async () => {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, "data.sql");
    const sql = fs.readFileSync(sqlFilePath).toString();

    // Execute the SQL commands
    await pool.query(sql);
    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error initializing the database:", error);
  }
};

initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`SERVER running at ${PORT}`));
});

app.get("/todos/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  try {
    const response = await pool.query(
      "SELECT * FROM todos WHERE user_email = $1",
      [userEmail]
    );
    res.json(response.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/all", async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM todos");
    res.json(response.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/todos", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  const id = uuidv4();
  try {
    await pool.query(
      "INSERT INTO todos (id, user_email, title, progress, date) VALUES ($1, $2, $3, $4, $5)",
      [id, user_email, title, progress, date]
    );
    res.status(200).json({ message: "Successfully added to todos in database" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body;
  try {
    const updateTodos = await pool.query(
      `UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5`,
      [user_email, title, progress, date, id]
    );
    if (updateTodos.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Todo not found" });
    }
    return res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteTodo = await pool.query("DELETE FROM todos WHERE id = $1", [id]);
    if (deleteTodo.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Todo not found" });
    }
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ email: user.email, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const signup = await pool.query(
      `INSERT INTO users (email, hashed_password) VALUES($1, $2) RETURNING *`,
      [email, hashedPassword]
    );
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ email: signup.rows[0].email, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});
