select
    d.id as "_id",
    d.name as "_name"
from
    public.bedes_term_list_option as d
where
    d.name = ${_name}
;