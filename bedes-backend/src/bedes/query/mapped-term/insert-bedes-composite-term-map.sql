insert into public.composite_term_maps (
    bedes_composite_term_uuid, app_term_id, app_list_option_uuid
)
values (
    ${_bedesCompositeTermUUID}, ${_appTermId}, ${_appListOptionUUID}
)
returning
    id as "_id",
    bedes_composite_term_uuid as "_bedesCompositeTermUUID",
    app_term_id as "_appTermId",
    app_list_option_uuid as "_appListOptionUUID"
;
