select
    d.id as "_id",
    d.name as "_name",
    d.description as "_description",
    d.unit_id as "_unitId",
    d.definition_source_id as "_definitionSourceId",
    d.url as "_url",
    d.uuid as "_uuid"
from
    public.bedes_term_list_option as d
join
    public.bedes_term t on d.term_id = t.id and t.uuid = ${_termUUID}
where
    trim(lower(d.name)) = trim(lower((${_optionName})))
;