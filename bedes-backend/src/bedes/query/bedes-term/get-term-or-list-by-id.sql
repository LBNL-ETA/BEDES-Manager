-- retrieve an IBedesTerm or IBedesConstrainedList
-- if it's a constrained list _options will always be an array
-- if it's a regular bedes term _options will always be null
with
	w_list_options as (
		select
			d.id as "_id",
			d.term_id,
			d.name as "_name",
			d.description as "_description",
			d.unit_id as "_unitId",
			d.definition_source_id as "_definitionSourceId",
			d.url as "_url",
			d.uuid as "_uuid"
		from
			public.bedes_term_list_option as d
		where
			d.term_id = ${_id}
	),
	w_sectors as (
		select
			term_id,
			json_agg(a) as "_items"
		from (
			select
				id as "_id",
				term_id,
				sector_id as "_sectorId"
			from
				bedes_term_sector_link
			where
				term_id = ${_id}
		) as a
		group by
			term_id
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
			json_agg(o)
		else
			null
	end as "_options"
from
	public.bedes_term bt
left outer join
	w_list_options o on o.term_id = bt.id
left outer join
	w_sectors s on s.term_id = bt.id
where
	bt.id = ${_id}
group by
	bt.id, bt.name, bt.description, bt.term_category_id, bt.data_type_id,
	bt.definition_source_id, bt.unit_id, bt.uuid, bt.url
;