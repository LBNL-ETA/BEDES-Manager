insert into public.bedes_composite_term (
    signature, name, description, unit_id, uuid, user_id, scope_id
)
values (
    ${_signature}, ${_name}, ${_description}, ${_unitId}, ${_uuid}, ${_userId}, ${_scopeId}
)
returning
    id as "_id",
    name as "_name",
    description as "_description",
    signature as "_signature",
    unit_id as "_unitId",
    uuid as "_uuid",
    user_id as "_userId",
    scope_id as "_scopeId"
;
