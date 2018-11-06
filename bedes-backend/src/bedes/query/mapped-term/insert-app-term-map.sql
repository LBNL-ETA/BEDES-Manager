insert into public.app_term_maps (
    mapped_term_id, app_term_id
)
values (
    ${_mappedTermId}, ${_appTermId}
)
returning
    id as "_id",
    mapped_term_id as "_mappedTermId",
    app_term_id as "_appTermId"
;