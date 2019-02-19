insert into public.atomic_term_maps (
    bedes_term_uuid, bedes_list_option_uuid, app_term_id, app_list_option_uuid
)
values (
    ${_bedesTermUUID}, ${_bedesListOptionUUID}, ${_appTermId}, ${_appListOptionUUID}
)
returning
    id as "_id",
    bedes_term_uuid as "_bedesTermUUID",
    bedes_list_option_uuid as "_bedesListOptionUUID",
    app_list_option_uuid as "_appListOptionUUID"
;
