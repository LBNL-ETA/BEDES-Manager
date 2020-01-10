insert into public.bedes_term
    (name, description, term_category_id, data_type_id, unit_id, definition_source_id, url, uuid)
values
    (${_name}, ${_description}, ${_termTypeId}, ${_dataTypeId}, ${_unitId}, ${_definitionSourceId}, ${_url}, ${_uuid})
returning
    id as "_id",
    name as "_name",
    description as "_description",
    term_category_id as "_termTypeId",
    data_type_id as "_dataTypeId",
    unit_id as "_unitId",
    definition_source_id as "_definitionSourceId",
    url as "_url",
    uuid as "_uuid"
;