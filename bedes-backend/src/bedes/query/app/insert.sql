insert into
    public.mapping_application (name, description, scope_id)
values
    (${_name}, ${_description}, ${_scopeId})
returning
    id as "_id",
    name as "_name",
    description as "_description",
    scope_id as "_scopeId"
;
