// server.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB
const db = new sqlite3.Database(path.join(__dirname, 'todo.db'));
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `);
});

// GET: 全件取得
app.get('/api/todos', (req, res) => {
  db.all('SELECT id, title, done FROM todos ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', detail: String(err) });
    // doneは数値(0/1)で返るのでフロントでBooleanにしてもOK
    res.json(rows.map(r => ({ ...r, done: !!r.done })));
  });
});

// POST: 追加
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ message: 'titleは必須です' });
  db.run('INSERT INTO todos (title, done) VALUES (?, 0)', [title.trim()], function (err) {
    if (err) return res.status(500).json({ message: 'DB error', detail: String(err) });
    res.status(201).json({ id: this.lastID, title: title.trim(), done: false });
  });
});

// PATCH: 完了/未完を切り替え
app.patch('/api/todos/:id/done', (req, res) => {
  const id = Number(req.params.id);
  const { done } = req.body; // true/false
  if (Number.isNaN(id) || typeof done !== 'boolean') {
    return res.status(400).json({ message: 'invalid request' });
  }
  db.run('UPDATE todos SET done = ? WHERE id = ?', [done ? 1 : 0, id], function (err) {
    if (err) return res.status(500).json({ message: 'DB error', detail: String(err) });
    res.status(200).json({ id, done });
  });
});

// DELETE: 削除
app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'invalid id' });
  db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ message: 'DB error', detail: String(err) });
    res.sendStatus(204);
  });
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
