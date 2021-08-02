-- set's all composite terms linked to a mapping application to public

update
	public.bedes_composite_term as bct
set
	scope_id = 3,
    user_id = ${_userId}
from
	public.mapping_application ma,
	public.app_term t,
	public.composite_term_maps ctm
where
	ma.id = ${_applicationId}
and
	t.app_id = ma.id
and
	ctm.app_term_id = t.id
and
	bct.uuid = ctm.bedes_composite_term_uuid
;
