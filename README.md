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

## Como executar

1. **Crie um projeto** em https://supabase.com.
2. No painel, abra **SQL Editor**, cole o conteúdo de `schema.sql` e clique em **Run**.
3. Em **Project Settings > API**, copie a *Project URL* e a chave *anon public*.
4. Copie `.env.example` para `.env` e preencha:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_ANON_KEY=...
   ```
5. Instale e rode:
   ```bash
   npm install
   npm start
   ```
6. Abra http://localhost:3000

## Rotas

| Rota           | Descrição                                   |
|----------------|---------------------------------------------|
| `GET /api/cursos` | Lista cursos com o total de alunos de cada um |
| `GET /api/alunos` | Lista alunos com o nome do curso              |

## Observações

- O relacionamento `alunos.curso_id -> cursos.id` é o que permite as consultas `curso:cursos(...)` e `alunos(count)` do `supabase.js`.
- O RLS está ativo, com políticas de leitura pública para a chave anon funcionar.
