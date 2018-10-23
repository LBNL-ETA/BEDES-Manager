insert into
    public.unit (name)
values
    (${_name})
returning
    id as "_id", name as "_name"
;
