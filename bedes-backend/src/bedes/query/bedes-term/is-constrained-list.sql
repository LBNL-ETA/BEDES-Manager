-- returns true if the term name is a constrained list,
-- false otherwise
select
	case
		when lower(d.name) = 'constrained list' then true
		else false
	end as "_isConstrainedList"
from bedes_term b
join data_type d on b.data_type_id = d.id
where lower(trim(b.name)) = lower(trim(${_termName}))
;