insert into public.bedes_term
    (name, description, term_type_id, data_type_id, unit_id)
values
    (${_name}, ${_description}, ${_termTypeId}, ${_dataTypeId}, ${_unitId})
returning
    id as "_id",
    name as "_name",
    description as "_description",
    term_type_id as "_termTypeId",
    data_type_id as "_dataTypeId",
    unit_id as "_unitId"
;