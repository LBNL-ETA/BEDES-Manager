with 
	term_options as (
		select 
			o.id as "_id",
			o.name as "_name",
			o.description as "_description",
			o.unit_id as "_unit_id",
			o.definition_source_id as "_definitionSourceId"
		from
			bedes_term b
		join
			public.bedes_term_list_option o on o.term_id = b.id
        where
            b.name = ${_termName}
        and
            o.name = ${_optionName}
	)
select
	b.id as "_id",
	b.name as "_name",
	b.term_type_id as "_termTypeId",
	b.data_type_id as "_dataTypeId",
	b.source_id "_sourceId",
	b.unit_id as "_unitId",
	json_agg(o) "_options"
from
    bedes_term as b
cross join
    term_options o
where
    b.name = ${_termName}
group by
    b.id, b.name, b.term_type_id, b.data_type_id, b.source_id, b.unit_id
;