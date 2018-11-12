insert into
    public.term_category (name)
values
    (${_name})
returning
    id as "_id", name as "_name"
;
