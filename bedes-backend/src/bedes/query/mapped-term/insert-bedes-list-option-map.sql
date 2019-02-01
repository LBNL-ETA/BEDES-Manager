insert into public.atomic_term_list_option_maps (
    bedes_list_option_id, app_term_id, app_list_option_id
)
values (
    ${_bedesListOptionId}, ${_appTermId}, ${_appListOptionId}
)
returning
    id as "_id",
    bedes_list_option_id as "_bedesListOptionId",
    app_term_id as "_appTermId",
    app_list_option_id as "_appListOptionId"
;
