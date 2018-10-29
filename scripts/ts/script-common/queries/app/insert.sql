insert into
    public.app (name)
values
    (${_name})
returning
    id as "_id",
    name as "_name"
;
