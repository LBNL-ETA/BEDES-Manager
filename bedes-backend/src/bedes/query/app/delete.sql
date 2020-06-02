/* TODO: Update this to a concise single query */
with terms as (
    select * from public.app_term where app_id = ${_id}
)
delete from public.atomic_term_list_option_maps atlom using terms as t where t.id = atlom.app_term_id;

with terms as (
    select * from public.app_term where app_id = ${_id}
)
delete from public.app_term_list_option atlo using terms as t where t.id = atlo.app_term_id;

delete from public.app_term where app_id = ${_id};
delete from public.mapping_application where id = ${_id};
