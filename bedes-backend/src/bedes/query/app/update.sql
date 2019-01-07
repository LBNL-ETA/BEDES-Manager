update
    public.app
set
    name = ${_name},
    description = ${_description}
where
    id = ${_id}
returning
    id as "_id",
    name as "_name",
    description as "_description"
;
