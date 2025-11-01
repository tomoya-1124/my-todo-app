// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// ボディをJSONとして受け取る
app.use(express.json());

// public配下を静的ファイルとして配信
app.use(express.static(path.join(__dirname, 'public')));

// メモリに持つToDoデータ（本当はDBだけど今日はこれでOK）
let todos = [
  { id: 1, title: '資料を読む' },
  { id: 2, title: 'APIを確認' },
];

// 一覧取得
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// 追加
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'titleは必須です' });
  }
  const newTodo = {
    id: Date.now(),
    title: title.trim(),
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// 削除
app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  todos = todos.filter((t) => t.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
