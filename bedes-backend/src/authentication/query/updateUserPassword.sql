update
    auth.user
set
    password = ${passwordHash}
where
    id = ${id}
;
