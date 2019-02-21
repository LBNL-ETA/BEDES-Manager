-- links a user to a role in a mapping application
insert into
    public.mapping_application_roles (
        app_id,
        role_id,
        user_id
    )
values (
    ${_appId},
    ${_roleId},
    ${_userId}
)
returning
    id
;