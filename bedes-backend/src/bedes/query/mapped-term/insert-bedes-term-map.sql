insert into public.bedes_term_maps (
    mapped_term_id, bedes_term_id, order_number
)
values (
    ${_mappedTermId}, ${_bedesTermId}, ${_orderNumber}
)
returning
    id as "_id",
    mapped_term_id as "_mappedTermId",
    bedes_term_id as "_bedesTermId",
    order_number as "_orderNumber"
;
