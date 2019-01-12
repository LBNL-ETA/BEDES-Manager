update
    public.mapping_application
set
    scope_id = ${_scopeId}
where
    id = ${_id}
returning
    id as "_id",
    name as "_name",
    description as "_description",
    scope_id as "_scopeId"
;

