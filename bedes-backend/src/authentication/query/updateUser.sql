update auth.user set
    first_name = ${firstName},
    last_name = ${lastName},
    email = ${email}
where id = ${id}
;
