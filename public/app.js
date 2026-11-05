// ===== Elementos da página (DOM) =====
const tabelaCursos = document.getElementById('tabela-cursos');
const tabelaAlunos = document.getElementById('tabela-alunos');
const filtroCurso = document.getElementById('filtro-curso');
const alunosStatus = document.getElementById('alunos-status');
const sentinelaAlunos = document.getElementById('sentinela-alunos');

// ===== Memória da lista (fica fora das funções para durar entre as levas) =====
const ALUNOS_POR_PAGINA = 5; // toda busca pede 5 alunos
let alunosInicio = 0;        // quantos já estão desenhados
let alunosTotal = 0;         // quantos existem no filtro atual
let alunosTemMais = false;   // ainda falta gnente?
let alunosCarregando = false; // já tem um pedido no ar?
let alunosErro = false;      // a última busca falhou?
let alunosPedido = 0;        // qual busca vale agora (descarta respostas atrasadas)

// ===== A frase embaixo da tabela =====
function atualizarStatus() {
  alunosStatus.classList.toggle('erro', alunosErro);

  if (alunosErro) {
    alunosStatus.textContent =
      'A lista não carregou. Use Atualizar lista para tentar de novo.';
  } else if (alunosCarregando && alunosInicio === 0) {
    alunosStatus.textContent = 'Carregando...';
  } else if (!alunosTotal) {
    alunosStatus.textContent = 'Nenhum aluno para mostrar.';
  } else if (alunosCarregando) {
    alunosStatus.textContent = `Mostrando ${alunosInicio} de ${alunosTotal}. Carregando mais...`;
  } else if (alunosTemMais) {
    alunosStatus.textContent = `Mostrando ${alunosInicio} de ${alunosTotal}. Role a tela para carregar mais.`;
  } else {
    alunosStatus.textContent = `Mostrando ${alunosTotal} de ${alunosTotal}. Fim da lista.`;
  }
}

// ===== CURSOS (lado 1) =====
function montarTabelaCursos(cursos) {
  tabelaCursos.innerHTML = '';

  if (!cursos.length) {
    tabelaCursos.innerHTML =
      '<tr><td colspan="3" class="vazio">Nenhum curso cadastrado ainda.</td></tr>';
    return;
  }

  for (const curso of cursos) {
    const tr = document.createElement('tr');

    const tdNome = document.createElement('td');
    tdNome.textContent = curso.nome;

    const tdTotal = document.createElement('td');
    tdTotal.textContent = curso.total_alunos; // o "N" de cada curso

    const tdAcoes = document.createElement('td');
    tdAcoes.className = 'acoes';
    const btnVer = document.createElement('button');
    btnVer.type = 'button';
    btnVer.className = 'btn btn-pequeno';
    btnVer.textContent = 'Ver alunos';
    btnVer.onclick = () => {
      filtroCurso.value = curso.id; // escolhe o curso no filtro
      listarAlunos(false);          // e recomeça a lista só com os alunos dele
    };
    tdAcoes.appendChild(btnVer);

    tr.appendChild(tdNome);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAcoes);
    tabelaCursos.appendChild(tr);
  }
}

function preencherFiltro(cursos) {
  const filtroAtual = filtroCurso.value; // guarda a escolha antes de redesenhar

  filtroCurso.innerHTML = '<option value="">Todos os cursos</option>';
  for (const curso of cursos) {
    filtroCurso.appendChild(new Option(curso.nome, curso.id));
  }

  filtroCurso.value = filtroAtual;
  if (filtroCurso.selectedIndex === -1) filtroCurso.value = '';
}

async function listarCursos() {
  try {
    const resposta = await fetch('/api/cursos');
    const cursos = await resposta.json();
    if (!resposta.ok) throw new Error(cursos.erro || 'Erro ao listar cursos');

    montarTabelaCursos(cursos);
    preencherFiltro(cursos);
  } catch (e) {
    tabelaCursos.innerHTML =
      `<tr><td colspan="3" class="vazio">${e.message}</td></tr>`;
  }
}

// ===== ALUNOS (lado N) =====
// monta UMA linha da tabela (ainda fora da página) e devolve
function linhaAluno(aluno) {
  const tr = document.createElement('tr');

  const tdNome = document.createElement('td');
  tdNome.textContent = aluno.nome;

  const tdRa = document.createElement('td');
  tdRa.textContent = aluno.ra;

  const tdCurso = document.createElement('td');
  tdCurso.textContent = aluno.curso ? aluno.curso.nome : '—';

  tr.appendChild(tdNome);
  tr.appendChild(tdRa);
  tr.appendChild(tdCurso);
  return tr;
}

// acrescentar = false -> recomeça a lista do zero
// acrescentar = true  -> pede a próxima leva e cola embaixo
async function listarAlunos(acrescentar = false) {
  // já tem pedido no ar, ou a lista acabou: não faz nada
  if (acrescentar && (alunosCarregando || !alunosTemMais)) return;

  // busca nova ganha um número novo; rolagem continua a mesma busca
  const pedido = acrescentar ? alunosPedido : ++alunosPedido;
  const inicio = acrescentar ? alunosInicio : 0;

  if (!acrescentar) {
    tabelaAlunos.innerHTML = ''; // só a busca nova apaga as linhas
    alunosInicio = 0;
    alunosTotal = 0;
    alunosTemMais = false;
  }

  alunosCarregando = true;
  alunosErro = false;
  atualizarStatus();

  try {
    const cursoId = filtroCurso.value; // '' = "Todos os cursos"
    const base = cursoId ? `/api/cursos/${cursoId}/alunos` : '/api/alunos';
    const resposta = await fetch(
      `${base}?inicio=${inicio}&limite=${ALUNOS_POR_PAGINA}`
    );
    const dados = await resposta.json();

    // resposta de uma busca antiga (o filtro mudou no meio): joga fora
    if (pedido !== alunosPedido) return;
    if (!resposta.ok) throw new Error(dados.erro || 'Erro ao listar alunos');

    const alunos = dados.alunos || [];
    alunosTotal = dados.total || 0;

    for (const aluno of alunos) {
      tabelaAlunos.appendChild(linhaAluno(aluno)); // cola embaixo das que já estão
    }

    alunosInicio = inicio + alunos.length;
    alunosTemMais = alunosInicio < alunosTotal;
  } catch (e) {
    if (pedido !== alunosPedido) return;
    console.error(e);
    alunosErro = true;
    alunosTemMais = false;
  } finally {
    // só a busca que vale encerra o "carregando"
    if (pedido === alunosPedido) {
      alunosCarregando = false;
      atualizarStatus();
      pedirMaisSeVisivel(); // se o marcador ainda está à vista, já pede a próxima
    }
  }
}

// ===== Rolagem: pede mais quando o marcador do fim chega perto =====
function pedirMaisSeVisivel() {
  if (!alunosTemMais || alunosCarregando) return;
  const topo = sentinelaAlunos.getBoundingClientRect().top;
  if (topo <= window.innerHeight + 160) listarAlunos(true);
}

async function atualizarTudo() {
  await listarCursos(); // 1º os cursos: preenche o filtro
  await listarAlunos(false); // 2º os alunos, já com o filtro pronto
}

// ===== Ligando os eventos =====
document.getElementById('btn-atualizar').addEventListener('click', atualizarTudo);
filtroCurso.addEventListener('change', () => listarAlunos(false));
window.addEventListener('scroll', pedirMaisSeVisivel);
window.addEventListener('resize', pedirMaisSeVisivel);

atualizarTudo(); // roda 1 vez ao abrir a página
