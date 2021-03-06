-- insert a new user into the auth.user table
-- returns the user record (except password)
insert into 
    auth.user (first_name, last_name, email, organization, password, uuid)
values
    (${firstName}, ${lastName}, ${email}, ${organization}, ${password}, ${uuid})
returning
    id,
    first_name as "firstName",
    last_name as "lastName",
    email,
    organization,
    status,
    uuid
;