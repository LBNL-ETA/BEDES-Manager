update
    public.bedes_term
set
    name = ${_name},
    description = ${_description},
    term_category_id = ${_termCategoryId},
    data_type_id = ${_dataTypeId},
    unit_id = ${_unitId},
    definition_source_id = ${_definitionSourceId},
    uuid = ${_uuid},
    url = ${_url}
where
    id = ${_id}
returning
    id as "_id",
    name as "_name",
    description as "_description",
    term_category_id as "_termCategoryId",
    data_type_id as "_dataTypeId",
    unit_id as "_unitId",
    definition_source_id as "_definitionSourceId",
    uuid as "_uuid",
    url as "_url"
;