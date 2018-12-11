-- calculate how many times a specific unit is referenced
-- in BedesTerm and BedesTermListOption
select ${_unitId}::int as "_unitId",
	((select count(*)
		from bedes_term
		where unit_id = ${_unitId}
	) 
	+ 
    (select count(*)
		from bedes_term_list_option 
		where unit_id = ${_unitId}
	))::int as "_usageCount"
;
