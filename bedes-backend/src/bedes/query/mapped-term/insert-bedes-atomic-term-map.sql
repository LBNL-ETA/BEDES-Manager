insert into public.bedes_atomic_term_maps (
    mapped_term_id, bedes_term_id
)
values (
    ${_mappedTermId}, ${_bedesTermId}
)
returning
    id as "_id",
    mapped_term_id as "_mappedTermId",
    bedes_term_id as "_bedesTermId"
;
