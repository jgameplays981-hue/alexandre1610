
create table if not exists cursos (
  id bigint generated always as identity primary key,
  nome text not null unique,
  criado_em timestamptz default now()
);

create table if not exists alunos (
  id bigint generated always as identity primary key,
  nome text not null,
  ra text not null unique,
  curso_id bigint not null references cursos(id) on delete restrict,
  criado_em timestamptz default now()
);


alter table cursos enable row level security;
alter table alunos enable row level security;

drop policy if exists "cursos_select_anon" on cursos;
drop policy if exists "cursos_insert_anon" on cursos;
drop policy if exists "cursos_update_anon" on cursos;
drop policy if exists "cursos_delete_anon" on cursos;

drop policy if exists "alunos_select_anon" on alunos;
drop policy if exists "alunos_insert_anon" on alunos;
drop policy if exists "alunos_update_anon" on alunos;
drop policy if exists "alunos_delete_anon" on alunos;

-- Cursos
create policy "cursos_select_anon" on cursos for select to anon using (true);
create policy "cursos_insert_anon" on cursos for insert to anon with check (true);
create policy "cursos_update_anon" on cursos for update to anon using (true) with check (true);
create policy "cursos_delete_anon" on cursos for delete to anon using (true);

-- Alunos
create policy "alunos_select_anon" on alunos for select to anon using (true);
create policy "alunos_insert_anon" on alunos for insert to anon with check (true);
create policy "alunos_update_anon" on alunos for update to anon using (true) with check (true);
create policy "alunos_delete_anon" on alunos for delete to anon using (true);


insert into cursos (nome) values
  ('Análise e Desenvolvimento de Sistemas'),
  ('Engenharia de Software'),
  ('Ciência da Computação')
on conflict (nome) do nothing;

insert into alunos (nome, ra, curso_id) values
  ('Ana Souza',      '2026001', (select id from cursos where nome = 'Análise e Desenvolvimento de Sistemas')),
  ('Bruno Lima',     '2026002', (select id from cursos where nome = 'Análise e Desenvolvimento de Sistemas')),
  ('Carla Mendes',   '2026003', (select id from cursos where nome = 'Engenharia de Software')),
  ('Diego Ferreira', '2026004', (select id from cursos where nome = 'Ciência da Computação'))
on conflict (ra) do nothing;