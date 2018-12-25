insert into public.bedes_term_list_option
    (term_id, name, description, unit_id, definition_source_id, url, uuid)
values
    (${_termId}, ${_name}, ${_description}, ${_unitId}, ${_definitionSourceId}, ${_url}, ${_uuid})
returning
    id as "_id",
    name as "_name",
    description as "_description",
    unit_id as "_unitId",
    definition_source_id as "_definitionSourceId",
    url as "_url",
    uuid as "_uuid"
;
