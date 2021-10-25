where
(scope_id != 1
    or
    (scope_id = 1 and user_id = ${_userId})
)
and (scope_id NOT IN (
${_excludedScopes:csv}
) or (user_id = ${_userId}))

