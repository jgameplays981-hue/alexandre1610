require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COLUNAS_ALUNO = 'id, nome, ra, curso_id, criado_em, curso:cursos(id, nome)';

async function listarCursos() {
  const { data, error } = await supabase
    .from('cursos')
    .select('id, nome, alunos(count)')
    .order('nome', { ascending: true });

  if (error) throw error;
  return data.map((curso) => ({
    id: curso.id,
    nome: curso.nome,
    total_alunos: curso.alunos[0]?.count ?? 0,
  }));
}

async function listarAlunos({ cursoId, inicio = 0, limite } = {}) {
  let consulta = supabase
    .from('alunos')
    .select(COLUNAS_ALUNO, limite ? { count: 'exact' } : undefined);

  if (cursoId) consulta = consulta.eq('curso_id', cursoId);

  consulta = consulta.order(cursoId ? 'nome' : 'id', { ascending: true });

  if (limite) consulta = consulta.range(inicio, inicio + limite - 1);

  const { data, error, count } = await consulta;
  if (error) throw error;

  if (!limite) return data || [];
  return { alunos: data || [], total: count ?? 0 };
}

module.exports = {
  supabase,
  listarCursos,
  listarAlunos,
};
