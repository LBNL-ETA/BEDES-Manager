select
	bt.id as "_id",
	bt.name as "_name",
	bt.term_type_id as "_termTypeId",
	bt.data_type_id as "_dataTypeId",
	bt.source_id as "_sourceId",
	bt.unit_id as "_unitId"
from
	public.bedes_term as bt
where
	bt.name ~* ${_searchString}
;