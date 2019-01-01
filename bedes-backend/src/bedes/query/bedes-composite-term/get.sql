select
    id as "_id",
    signature as "_signature",
    name as "_name"
from
    public.bedes_composite_term
where
    signature = ${_signature}
;