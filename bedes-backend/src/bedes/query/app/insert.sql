insert into
    public.app (name, description)
values
    (${_name}, ${_description})
returning
    id as "_id",
    name as "_name",
    description as "_description"
;
