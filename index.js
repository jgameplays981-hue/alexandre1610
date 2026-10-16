const express = require('express');
const path = require('path');
const { listarCursos, listarAlunos } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/cursos', async (req, res) => {
  try {
    res.json(await listarCursos());
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.get('/api/alunos', async (req, res) => {
  try {
    res.json(await listarAlunos());
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
