-- select
--     id as "_id",
--     name as "_name",
--     term_category_id as "_termTypeId",
--     data_type_id as "_dataTypeId",
--     source_id as "_sourceId",
--     unit_id as "_unitId"
-- from
--     public.bedes_term as bt
-- where
--     bt.name ~* ${_searchString}
-- ;

with
	option_term_ids as (
		-- identify list options records with matches in name/description
		select
			term_id, id
		from
			bedes_term_list_option as o
		where
			o.name ~* ${_searchString}
			or o.description ~* ${_searchString}
	),
	options as (
		-- builds the bedes list term option records
		select
			o.id as "_id",
			o.term_id,
			o.name as "_name",
			o.description as "_description",
			o.unit_id as "_unitId",
			o.definition_source_id as "_definitionSourceId"
		from
			bedes_term_list_option o
		join
			option_term_ids i on i.term_id = o.term_id and i.id = o.id
	),
	term_match_ids as (
		-- build list of matching bedes term names,
		-- exclude rows that have matching list options
		select
			id
		from
			bedes_term bt
		where
			bt.name ~* ${_searchString} 
			or bt.description ~* ${_searchString}

		union
		
		select
			term_id
		from
			option_term_ids
	)
-- build the main output
select
	bt.id as "_id",
	bt.name as "_name",
	bt.description as "_description",
	bt.term_category_id as "_termTypeId",
	bt.data_type_id as "_dataTypeId",
	bt.source_id as "_sourceId",
	bt.unit_id as "_unitId",
	json_agg(o) as "_options"
from
	public.bedes_term as bt
join
	term_match_ids t on t.id = bt.id
left outer join
	options o on o.term_id = bt.id
group by
	bt.id, bt.name, bt.description, bt.term_category_id, bt.data_type_id, bt.source_id, bt.unit_id
;