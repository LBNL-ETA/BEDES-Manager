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
            lower(trim(b.name)) = lower(trim(${_termName}))
        and
            lower(trim(o.name)) = lower(trim(${_optionName}))
	)
select
	b.id as "_id",
	b.name as "_name",
	b.description as "_description",
	b.term_category_id as "_termCategoryId",
	b.data_type_id as "_dataTypeId",
	b.unit_id as "_unitId",
	b.definition_source_id as "_definitionSourceId",
	b.uuid as "_uuid",
	b.url as "_url",
	json_agg(o) "_options"
from
    bedes_term as b
cross join
    term_options o
where
    lower(trim(b.name)) = lower(trim(${_termName}))
group by
    b.id, b.name, b.description, b.term_category_id, b.data_type_id,
	b.definition_source_id, b.unit_id, b.uuid, b.url
;