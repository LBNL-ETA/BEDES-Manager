where
(scope_id != 1
    or
    (scope_id = 1 and user_id = ${_userId})
)
or (user_id = ${_userId})
