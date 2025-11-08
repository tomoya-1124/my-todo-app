const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./todo.db');

// テーブル作成
db.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT
)`);

// GET
app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos', (err, rows) => res.json(rows));
});

// POST
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  db.run('INSERT INTO todos (title) VALUES (?)', [title], function() {
    res.json({ id: this.lastID, title });
  });
});

// DELETE
app.delete('/api/todos/:id', (req, res) => {
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id], function() {
    res.sendStatus(204);
  });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
