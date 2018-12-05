select
    id as "_id",
    signature as "_signature"
from
    public.bedes_composite_term
where
    id = ${_id}
;