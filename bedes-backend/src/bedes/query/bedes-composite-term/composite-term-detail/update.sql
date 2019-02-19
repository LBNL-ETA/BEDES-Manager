update
    public.bedes_composite_term_details
set
    order_number = ${_orderNumber},
    is_value_field = ${_isValueField}
where
    id = ${_id}
returning
    id as "_id",
    composite_term_id as "_compositeTermId",
    bedes_term_id as "_bedesTermId",
    list_option_id as "_listOptionId",
    order_number as "_orderNumber",
    is_value_field as "_isValueField"
;
