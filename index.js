const express = require('express');
const path = require('path');
const { listarCursos, listarAlunos } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Lê ?inicio=5&limite=5 da URL (chegam como texto, por isso o Number()).
// Sem nenhum dos dois: devolve null e a rota manda a lista inteira.
function lerPagina(query) {
  if (query.limite === undefined && query.inicio === undefined) return null;

  const limite = Number(query.limite);
  const inicio = query.inicio === undefined ? 0 : Number(query.inicio);

  if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
    return { erro: 'Informe limite entre 1 e 100' };
  }
  if (!Number.isInteger(inicio) || inicio < 0) {
    return { erro: 'inicio inválido' };
  }
  return { inicio, limite };
}

// Serve /api/alunos e /api/cursos/:id/alunos
async function responderAlunos(req, res, cursoId) {
  try {
    const pagina = lerPagina(req.query);
    if (pagina && pagina.erro) {
      return res.status(400).json({ erro: pagina.erro });
    }

    const dados = await listarAlunos({ cursoId, ...(pagina || {}) });

    res.json(
      pagina ? { ...dados, inicio: pagina.inicio, limite: pagina.limite } : dados
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
}

app.get('/api/cursos', async (req, res) => {
  try {
    res.json(await listarCursos());
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/alunos                     -> todos (array)
// GET /api/alunos?inicio=0&limite=5   -> uma página { alunos, total, inicio, limite }
app.get('/api/alunos', (req, res) => responderAlunos(req, res));

// GET /api/cursos/1/alunos?inicio=0&limite=5 -> alunos de UM curso (o 1:N na URL)
app.get('/api/cursos/:id/alunos', (req, res) =>
  responderAlunos(req, res, req.params.id)
);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
