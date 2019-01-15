-- retrieves the list of AppTerms for a given MappingApplication,
-- given an id from from one of the AppTerms.
with
    -- get the app_id from the sibling AppTerm id
    w_app_id as (
        select
            app_id
        from
            public.app_term as apt
        where
            apt.id = ${_appTermId}
    ),
    -- build the list options as json object arrays
    w_list_options as (
        select
            wt.id as app_term_id,
            json_agg(
                json_build_object(
                    '_id', o.id,
                    '_name', o.name,
                    '_unitId', o.unit_id
                )
            ) as items
		from
			w_app_id as wa
        join
            public.app_term as wt on wt.app_id = wa.app_id and wt.term_type_id = 2
        join
            public.app_term_list_option o on o.app_term_id = wt.id
        group by
            wt.id
    )
select
    t.id as "_id",
    t.name as "_name",
    t.description as "_description",
    t.field_code as "_fieldCode",
    t.term_type_id as "_termTypeId",
    case
        when t.term_type_id = 2 then
            wo.items
        else
            null
    end as "_listOptions"
        
from
    w_app_id as wa
join
    app_term as t on t.app_id = wa.app_id
left outer join
    -- link the term with its options, if it exists
    w_list_options as wo on wo.app_term_id = t.id
;
