insert into
    public.term_type (name)
values
    (${_name})
returning
    id as "_id", name as "_name"
;
