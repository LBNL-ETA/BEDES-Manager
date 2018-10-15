insert into public.bedes_term_list_option
    (name, term_id, name, description, unit_id)
values
    (${_termId}, ${_name}, ${_description}, ${_unitId})
returning
    id as "_id",
    name as "_name",
    description as "_description",
    unit_id as "_unitId"
;