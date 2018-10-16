insert into
    public.definition_source (name)
values
    (${_name})
returning
    id as "_id", name as "_name"
;
