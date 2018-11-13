-- retrieve an IBedesTerm or IBedesConstrainedList
-- if it's a constrained list _options will always be an array
-- if it's a regular bedes term _options will always be null
select
	bt.id as "_id",
	bt.name as "_name",
	bt.description as "_description",
	bt.term_category_id as "_termCategoryId",
	bt.data_type_id as "_dataTypeId",
	bt.definition_source_id as "_definitionSourceId",
	bt.unit_id as "_unitId",
	case
        -- constrained list = data_type_id = 1
		when bt.data_type_id = 1 then
			json_agg(o)
		else
			null
	end as "_options"
from
	public.bedes_term bt
left outer join
	public.bedes_term_list_option o on o.term_id = bt.id
where
	bt.id = ${_id}
group by
	bt.id, bt.name, bt.description, bt.term_category_id, bt.data_type_id, bt.definition_source_id, bt.unit_id
;