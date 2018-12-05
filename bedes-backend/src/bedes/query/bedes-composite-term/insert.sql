insert into
    public.bedes_composite_term (signature)
values
    (${_signature})
returning
    id as "_id",
    signature as "_signature"
;
