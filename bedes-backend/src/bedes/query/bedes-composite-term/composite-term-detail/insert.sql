insert into
    public.bedes_composite_term_details (composite_term_id, bedes_term_id, list_option_id, order_number, is_value_field)
values
    (${_compositeTermId}, ${_bedesTermId}, ${_listOptionId}, ${_orderNumber}, ${_isValueField})
returning
    id as "_id",
    composite_term_id as "_compositeTermId",
    bedes_term_id as "_bedesTermId",
    list_option_id as "_listOptionId",
    order_number as "_orderNumber",
    is_value_field as "_isValueField"
;
