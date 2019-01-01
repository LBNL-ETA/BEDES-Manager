insert into
    public.bedes_composite_term (signature, name)
values
    (${_signature}, ${_name})
returning
    id as "_id",
    signature as "_signature",
    name as "_name"
;
