-- retrieve an IBedesTerm or IBedesConstrainedList by matching UUID
-- if it's a constrained list _options will always be an array
-- if it's a regular bedes term _options will always be null
with
	w_list_options as (
		select
			json_agg(a) as "options"
		from
			(
				select
					d.id as "_id",
					d.name as "_name",
					d.description as "_description",
					d.unit_id as "_unitId",
					d.definition_source_id as "_definitionSourceId",
					d.url as "_url",
					d.uuid as "_uuid"
				from
					public.bedes_term_list_option as d
				join
					public.bedes_term t on t.id = d.term_id
				where
					t.uuid = ${_uuid}
			) as a
	),
	w_sectors as (
		select
			json_agg(a) as "sectors"
		from
			(
				select
					s.id as "_id",
					s.sector_id as "_sectorId"
				from
					bedes_term_sector_link as s
				join
					bedes_term t on t.id = s.term_id
				where
					t.uuid = ${_uuid}
			) as a
	)
select
	bt.id as "_id",
	bt.name as "_name",
	bt.description as "_description",
	bt.term_category_id as "_termCategoryId",
	bt.data_type_id as "_dataTypeId",
	bt.definition_source_id as "_definitionSourceId",
	bt.unit_id as "_unitId",
	bt.uuid as "_uuid",
	bt.url as "_url",
	case
        -- constrained list = data_type_id = 1
		when bt.data_type_id = 1 then
			o.options
		else
			null
	end as "_options",
	s.sectors as "_sectors"
from
	public.bedes_term bt
left outer join 
	w_list_options o on true
left outer join
	w_sectors s on true
where
	bt.uuid = ${_uuid}
;