-- gets a single AppTerm or AppTermList object
with
    -- build the list options as json object arrays
    w_list_options as (
        select
            o.app_term_id,
            json_agg(
                json_build_object(
                    '_id', o.id,
                    '_name', o.name,
                    '_unit', o.unit
                )
            ) as items
        from
            public.app_term_list_option o
        where
            o.app_term_id = ${_id}
        group by
            o.app_term_id
    )
select
    t.id as "_id",
    t.name as "_name",
    t.description as "_description",
    t.field_code as "_fieldCode",
    t.term_type_id as "_termTypeId",
    t.data_type_id as "_dataTypeId",
    t.uuid as "_uuid",
    t.unit as "_unit"
    case
        when t.term_type_id = 2 then
            wo.items
        else
            null
    end as "_listOptions"
from
    app_term as t
left outer join
    -- link the term with its options, if it exists
    w_list_options as wo on wo.app_term_id = t.id
where
    t.id = ${_id}
;
