update
    public.bedes_composite_term
set
    name = ${_name},
    description = ${_description},
    signature = ${_signature},
    unit_id = ${_unitId}
where
    id = ${_id}
and
    user_id = ${_userId}
returning
    id as "_id",
    signature as "_signature",
    name as "_name",
    description as "_description",
    unit_id as "_unitId",
    uuid as "_uuid",
    user_id as "_userId",
    scope_id as "_scopeId"
;
