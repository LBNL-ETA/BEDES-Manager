insert into public.bedes_composite_term_maps (
    mapped_term_id, bedes_composite_term_id
)
values (
    ${_mappedTermId}, ${_compositeTermId}
)
returning
    id as "_id",
    mapped_term_id as "_mappedTermId",
    bedes_composite_term_id as "_compositeTermId"
;
