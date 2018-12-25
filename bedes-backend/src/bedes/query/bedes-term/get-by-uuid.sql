select
    d.id as "_id",
    d.name as "_name",
    d.description as "_description",
    d.term_category_id as "_termCategoryId",
    d.data_type_id as "_dataTypeId",
    d.unit_id as "_unitId",
    d.definition_source_id as "_definitionSourceId",
    d.uuid as "_uuid",
    d.url as "_url"
from
    public.bedes_term as d
where
    uuid = ${_uuid}
;