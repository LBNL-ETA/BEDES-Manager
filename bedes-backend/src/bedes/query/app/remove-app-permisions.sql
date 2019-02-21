-- removes the link between a user and a mapping application
delete from
    public.mapping_application_roles
where
    user_id = ${_userId}
and
    app_id = ${_appId}
;