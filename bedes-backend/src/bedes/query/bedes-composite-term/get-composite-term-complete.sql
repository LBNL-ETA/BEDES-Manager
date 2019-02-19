-- Builds a complete CompositeTerm object for a given composite term id.
select
    ct.id as "_id",
    ct.signature as "_signature",
    ct.name as "_name",
    ct.description as "_description",
    ct.unit_id as "_unitId",
    ct.uuid as "_uuid",
    json_agg(
        json_build_object(
            '_id', td.id,
            '_orderNumber', td.order_number,
            '_isValueField', td.is_value_field,
            '_term', json_build_object(
                '_id', bt.id,
                '_termCategoryId', bt.term_category_id,
                '_name', bt.name,
                '_description', bt.description,
                '_uuid', bt.uuid,
                '_unitId', bt.unit_id,
                '_dataTypeId', bt.data_type_id,
                '_definitionSourceId', bt.definition_source_id
            ),
            '_listOption', 
                case
                    when lo.id is not null
                        then json_build_object(
                            '_id', lo.id,
                            '_name', lo.name,
                            '_description', lo.description,
                            '_url', lo.url,
                            '_uuid', lo.uuid
                        )
                    else
                        null
                end    
    )) as "_items"
from
    public.bedes_composite_term as ct
left outer join
    public.bedes_composite_term_details as td on td.composite_term_id = ct.id
left outer join
    public.bedes_term bt on bt.id = td.bedes_term_id
left outer join
    public.bedes_term_List_option as lo on lo.id = td.list_option_id
where
    ct.id = ${_id}
group by
    ct.id, ct.signature, ct.name, ct.description, ct.unit_id
;