update
    public.mapping_application
set
    name = ${_name},
    description = ${_description}
where
    id = ${_id}
returning
    id as "_id",
    name as "_name",
    description as "_description",
    scope_id as "_scopeId"
;
