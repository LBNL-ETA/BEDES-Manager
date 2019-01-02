insert into
    public.bedes_composite_term (signature, name, unit_id)
values
    (${_signature}, ${_name}, ${_unitId})
returning
    id as "_id",
    signature as "_signature",
    name as "_name",
    unit_id as "_unitId"
;
