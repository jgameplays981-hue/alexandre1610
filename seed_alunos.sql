
with cursos_numerados as (
  select id, row_number() over (order by id) - 1 as pos
  from cursos
),
numeros as (
  select generate_series(1, 100) as n
)
insert into alunos (nome, ra, curso_id)
select
  'Aluno ' || lpad(numeros.n::text, 3, '0'),
  'R' || (10000 + numeros.n)::text,
  cursos_numerados.id
from numeros
join cursos_numerados
  on cursos_numerados.pos = (numeros.n - 1) % (select count(*) from cursos_numerados)
  order by numeros.n
on conflict (ra) do nothing;


select c.nome, count(a.id) as total
from cursos c
left join alunos a on a.curso_id = c.id
group by c.nome
order by c.nome;
