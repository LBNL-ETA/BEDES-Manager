update public.app_term_list_option set
    name = ${_name},
    unit = ${_unit},
    description = ${_description}
where
    id = ${_id}
returning
    id as "_id",
    name as "_name",
    unit as "_unit"
;
