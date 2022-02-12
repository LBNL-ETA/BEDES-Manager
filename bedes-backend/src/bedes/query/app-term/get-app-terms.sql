-- gets an array of AppTerm or AppTermList objects
with
    -- build the list options as json object arrays
    w_list_options as (
        select
            o.app_term_id,
            json_agg(
                json_build_object(
                    '_id', o.id,
                    '_name', o.name,
                    '_unit', o.unit,
                    '_uuid', o.uuid,
                    '_mapping', case when mp.id is not null then
                        json_build_object(
                            '_id', mp.id,
                            '_bedesTermOptionUUID', mp.bedes_list_option_uuid,
                            '_bedesOptionName', bto.name
                        )
                        else
                            null
                        end
                )
            ) as items
        from
            public.app_term_list_option o
        join
            public.app_term as wt on wt.id = o.app_term_id
        left outer join
            public.atomic_term_list_option_maps as mp on mp.app_list_option_uuid = o.uuid
		left outer join
			public.bedes_term_list_option bto on bto.uuid = mp.bedes_list_option_uuid
        where
            wt.app_id = ${_appId}
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
    t.unit as "_unit",
    case
        when t.term_type_id = 2 then
            wo.items
        else
            null
    end as "_listOptions",
    -- build the _mapping object
    case
        -- atomic term maps
        when atm.id is not null and bt.id is not null then
			json_build_object(
				'_id', atm.id,
				'_bedesTermUUID', atm.bedes_term_uuid,
				'_bedesTermType', case when bt.data_type_id = 1 then 2 else 1 end,
				'_bedesListOptionUUID', null,
				'_bedesName', bt.name,
				'_appListOptionUUID', atm.app_list_option_uuid
			)
		when ctm.id is not null and bct.id is not null then
			json_build_object(
				'_id', ctm.id,
				'_compositeTermUUID', ctm.bedes_composite_term_uuid,
				'_bedesName', bct.name,
				'_appListOptionUUID', ctm.app_list_option_uuid,
                '_scopeId', bct.scope_id,
                '_ownerName', case
                                  when bct.scope_id = 3 then 'BEDES'
                                  when au.id is not null
                                      then au.first_name || ' ' || au.last_name
                                  else null::text
                    end,
			    '_unitId', bct.unit_id
			)
		else
			null
	end as "_mapping"
from
    app_term as t
left outer join
    -- link the term with its options, if it exists
    w_list_options as wo on wo.app_term_id = t.id
left outer join
	public.atomic_term_maps as atm on atm.app_term_id = t.id
left outer join
	public.bedes_term as bt on bt.uuid = atm.bedes_term_uuid
left outer join
	public.composite_term_maps as ctm on ctm.app_term_id = t.id
left outer join
    public.bedes_composite_term as bct on bct.uuid = ctm.bedes_composite_term_uuid
left outer join
    auth.user as au on au.id = bct.user_id
where
    t.app_id = ${_appId}
;
