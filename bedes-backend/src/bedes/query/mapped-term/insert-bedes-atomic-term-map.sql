insert into public.atomic_term_maps (
    bedes_term_id, bedes_list_option_id, app_term_id, app_list_option_id
)
values (
    ${_bedesTermId}, ${_bedesListOptionId}, ${_appTermId}, ${_appListOptionId}
)
returning
    id as "_id",
    bedes_term_id as "_bedesTermId",
    bedes_list_option_id as "_bedesListOptionId",
    app_term_id as "_appTermId",
    app_list_option_id as "_appListOptionId"
;
