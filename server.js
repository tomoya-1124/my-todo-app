// server.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- SQLite セットアップ ---
const db = new sqlite3.Database(path.join(__dirname, 'todo.db'));

// 初期化（テーブルが無ければ作成）
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    )
  `);
});

// --- API ---
// 一覧取得
app.get('/api/todos', (req, res) => {
  db.all('SELECT id, title FROM todos ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', detail: String(err) });
    res.json(rows);
  });
});

// 追加
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ message: 'titleは必須です' });
  db.run('INSERT INTO todos (title) VALUES (?)', [title.trim()], function (err) {
    if (err) return res.status(500).json({ message: 'DB error', detail: String(err) });
    res.status(201).json({ id: this.lastID, title: title.trim() });
  });
});

// 削除
app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'invalid id' });
  db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ message: 'DB error', detail: String(err) });
    // 既に無くても204でOK（冪等）
    res.sendStatus(204);
  });
});

// 起動
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
