insert into public.mapped_terms (
    app_id
)
values (
    ${_appId}
)
returning
    id as "_id",
    app_id as "_appId"
;