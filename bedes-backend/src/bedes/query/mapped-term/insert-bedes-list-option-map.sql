insert into public.atomic_term_list_option_maps (
    bedes_list_option_uuid, app_term_id, app_list_option_uuid
)
values (
    ${_bedesListOptionUUID}, ${_appTermId}, ${_appListOptionUUID}
)
returning
    id as "_id",
    bedes_list_option_uuid as "_bedesListOptionUUID",
    app_term_id as "_appTermId",
    app_list_option_uuid as "_appListOptionUUID"
;
