update public.app_term_list_option set
    name = ${_name},
    unit_id = ${_unitId}
where
    id = ${_id}
returning
    id as "_id",
    name as "_name",
    unit_id as "_unitId"
;
