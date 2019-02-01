insert into public.composite_term_maps (
    bedes_composite_term_id, app_term_id, app_list_option_id
)
values (
    ${_bedesCompositeTermId}, ${_appTermId}, ${_appListOptionId}
)
returning
    id as "_id",
    bedes_composite_term_id as "_bedesCompositeTermId",
    app_term_id as "_appTermId",
    app_list_option_id as "_appListOptionId"
;
