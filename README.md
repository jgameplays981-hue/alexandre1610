# Atividade Supabase – Cursos e Alunos

Projeto simples em Node.js + Express que lê as tabelas `cursos` e `alunos` de um banco Supabase usando o módulo `supabase.js`.

## Estrutura

```
.
├── supabase.js        # cliente Supabase + listarCursos / listarAlunos
├── index.js           # servidor Express com as rotas da API
├── public/index.html  # página que mostra os dados
├── schema.sql         # criação das tabelas, políticas e dados de exemplo
├── package.json
├── .env.example
└── README.md
```
