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
	array_agg(s.name) as "_sectorNames"
from
	public.bedes_term bt
left outer join
	public.bedes_term_sector_link sl on sl.term_id = bt.id
left outer join
	public.sector s on s.id = sl.sector_id
where
	uuid is not null
group by
	bt.id,
	bt.name ,
	bt.description,
	bt.term_category_id,
	bt.data_type_id,
	bt.definition_source_id,
	bt.unit_id,
	bt.uuid,
	bt.url
order by
	bt.name
;