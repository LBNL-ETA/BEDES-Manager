insert into public.app_term_list_option
    (app_term_id, name, unit_id)
values
    (${_appTermId}, ${_name}, ${_unitId})
returning
    id as "_id",
    name as "_name",
    unit_id as "_unitId"
;
