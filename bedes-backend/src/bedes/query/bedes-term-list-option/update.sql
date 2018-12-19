update
    public.bedes_term_list_option
set
    name = ${_name},
    description = ${_description},
    unit_id = ${_unitId},
    definition_source_id = ${_definitionSourceId}
where
    id = ${_id}
returning
    id as "_id",
    name as "_name",
    description as "_description",
    unit_id as "_unitId",
    definition_source_id as "_definitionSourceId"
;
