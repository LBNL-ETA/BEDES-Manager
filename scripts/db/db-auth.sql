-- Create the database objects related to authentication

-- create the auth schema
-- will contain all database objects related to authentication
create schema if not exists auth authorization bedes_admin;

-- create the user status table
create table if not exists auth.user_status (
    id int primary key,
    name varchar(15) not null unique,
    description varchar(100)
);

insert into auth.user_status (id, name, description) values
    (1, 'verification', 'Verification needed'),
    (2, 'ok', 'Valid user.'),
    (3, 'password-reset', 'User requested to reset their password.'),
    (4, 'disabled', 'User is registered in the system, but not able access account.')
;

-- create the user_group table
-- identifies the different types of users in the system
-- eg admin, esco, guest, accreditation committee member
create table auth.user_group (
    id serial primary key,
    name varchar(100) not null unique,
    description varchar(200)
);
-- create the bedes user groups
insert into auth.user_group (id, name, description) values
    (1, 'Standard', 'Standard user'),
    (2001, 'Admin', 'Administrators')
;

-- create the user table
create table if not exists auth.user (
    id serial primary key,
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    email varchar(100) not null unique,
    password varchar(100) not null,
    organization varchar(100),
    status int not null default 1 references auth.user_status (id),
    user_group_id int not null default 1 references auth.user_group (id),
    created_date timestamp default now(),
    modified_date timestamp default now()
);
create index on auth.user (email);

-- attach the trigger to update the modified date
create trigger update_modified_date_trigger
before update on auth.user
for each row
execute procedure
update_modified_date()
;

-- create the registration code table
create table auth.registration_code (
    id serial primary key,
    user_id int references auth.user (id) not null,
    value varchar(12) not null,
    time_stamp timestamp default now(),
    expire_time timestamp default now() + interval '24 hour'
);
create index on auth.registration_code (user_id);
