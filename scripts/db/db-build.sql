
create table public.term_category (
    id serial primary key,
    name varchar(100) not null unique
);

insert into public.term_category (name) values
    ('Global Terms'),
    ('Premises'),
    ('Contact'),
    ('Measures'),
    ('Envelope'),
    ('HVAC'),
    ('Loads'),
    ('Controls and Operations'),
    ('Generation and Storage Equipment'),
    ('Resource'),
    ('Resources'),
    ('Emissions'),
    ('Waste'),
    ('Metadata'),
    ('Units')
;

create table public.data_type (
    id serial primary key,
    name varchar(100) not null unique
);

create table public.unit (
    id serial primary key,
    name varchar(30) not null unique
);

create table public.definition_source (
    id serial primary key,
    name text not null unique
);

create table public.sector (
    id int primary key,
    name text not null unique
);
insert into public.sector (id, name) values
    (1, 'Multifamily'),
    (2, 'Residential'),
    (3, 'Commercial')
;

create table public.bedes_term (
    id serial primary key,
    name varchar(100) unique not null,
    uuid uuid unique,
    url varchar(250),
    description text,
    term_category_id int references public.term_category (id) not null,
    data_type_id int references public.data_type (id) not null,
    definition_source_id int references public.definition_source (id),
    unit_id int references public.unit (id) not null
);
create index on public.bedes_term (term_category_id);
create index on public.bedes_term (data_type_id);
create index on public.bedes_term (definition_source_id);
create index on public.bedes_term (unit_id);
create index on public.bedes_term (uuid);

create table public.bedes_term_list_option (
    id serial primary key,
    term_id int references public.bedes_term (id) on delete cascade not null,
    name varchar(150) not null,
    description text not null,
    unit_id int references public.unit (id) not null,
    definition_source_id int references public.definition_source (id),
    url varchar(250),
    uuid uuid unique
);
-- Want to ensure uniqueness, but some terms have the same name and different descriptions
-- Use an md5 hash of the text field instead of using the actual text as the unique constraint.
-- e.g. Premises - Assessment Level
create unique index on public.bedes_term_list_option (term_id, name, md5(description));
create index on public.bedes_term_list_option (unit_id);
create index on public.bedes_term_list_option (definition_source_id);
create index on public.bedes_term_list_option (uuid);

-- Term Sector Assignment
create table public.bedes_term_sector_link (
    id serial primary key,
    term_id int not null references public.bedes_term (id),
    sector_id int not null references public.sector (id),
    unique(term_id, sector_id)
);
create index on public.bedes_term_sector_link (term_id);
create index on public.bedes_term_sector_link (sector_id);

-- visibility of objects
create table public.scope (
    id int primary key,
    name varchar (30) not null unique
);
insert into public.scope (id, name) values
    (1, 'Private'),
    (2, 'Public')
;

-- Composite Term
create table public.bedes_composite_term (
    id serial primary key,
    signature text not null unique,
    name text,
    description text,
    unit_id int references public.unit (id),
    uuid uuid not null unique,
    user_id int not null references auth.user (id),
    scope_id int not null references public.scope (id),
    created_date timestamp default now(),
    modified_date timestamp default now()
);
create index on public.bedes_composite_term (uuid);

create table public.bedes_composite_term_details (
    id serial primary key,
    composite_term_id int not null references public.bedes_composite_term (id) on delete cascade,
    bedes_term_id int not null references public.bedes_term (id),
    list_option_id int references public.bedes_term_list_option (id),
    order_number int not null,
    is_value_field boolean default false,
    -- unique (composite_term_id, bedes_term_id),
    unique (composite_term_id, order_number)
);

-- ApplicationRole
create table public.application_role_type (
    id int primary key,
    name varchar(30) not null unique,
    description varchar(200)
);
insert into
    application_role_type (id, name, description)
values
    (1, 'Owner', 'The owner of the mapping application')
;

-- Mapping Application
create table public.mapping_application (
    id serial primary key,
    name varchar(100) not null unique,
    description varchar(500),
    scope_id int not null references public.scope (id) default 1
);

-- Links authenticated users to mapping applications
create table public.mapping_application_roles (
    id serial primary key,
    app_id int not null references public.mapping_application (id),
    role_id int not null references public.application_role_type (id),
    user_id int not null references auth.user (id),
    created_date timestamp default now(),
    unique (app_id, user_id)
);

create table public.app_field (
    id int primary key,
    name varchar(100) unique not null,
    description text 
);

insert into public.app_field (id, name) values
    (1, 'Data Type'),
    (2, 'Units'),
    (3, 'Source'),
    (4, 'Table'),
    (5, 'Group'),
    (6, 'Notes'),
    (7, 'Field Code'),
    (8, 'EnumeratedValue')
;

create table public.term_type (
    id int primary key,
    name varchar(50) not null unique
);
insert into public.term_type (id, name) values
    (1, '[Value]'),
    (2, 'Constrained List')
;

create table public.app_term (
    id serial primary key,
    name varchar(100) not null,
    description varchar(900),
    app_id int references public.mapping_application (id) on delete cascade not null,
    field_code varchar(200),
    uuid uuid not null unique,
    term_type_id int not null references public.term_type (id),
    unit_id int references public.unit(id),
    unique (app_id, name)
);
create index on public.app_term (uuid);

create table public.app_term_list_option (
    id serial primary key,
    app_term_id int references public.app_term (id) on delete cascade not null,
    name varchar(500) not null,
    description varchar(1000),
    unit_id int references public.unit(id),
    uuid uuid not null unique,
    unique (app_term_id, name)
);

create table public.app_term_additional_data (
    id serial primary key,
    app_term_id int references public.app_term (id) on delete cascade not null,
    app_field_id int references app_field (id) not null,
    value text,
    unique(app_term_id, app_field_id)
);

-- create table public.app_enumerated_values (
--     id serial primary key,
--     app_term_id int references public.app_term (id),
--     value text not null
-- );
-- create unique index on public.app_enumerated_values (app_term_id, md5(value));

create table public.atomic_term_maps (
    id serial primary key,
    bedes_term_uuid uuid not null references public.bedes_term (uuid),
    bedes_list_option_uuid uuid references public.bedes_term_list_option (uuid),
    app_term_id int not null references public.app_term (id) on delete cascade,
    app_list_option_uuid uuid references public.app_term_list_option (uuid)
);

create table public.atomic_term_list_option_maps (
    id serial primary key,
    bedes_list_option_uuid uuid not null references public.bedes_term_list_option (uuid),
    app_term_id int not null references public.app_term (id),
    app_list_option_uuid uuid references public.app_term_list_option (uuid)
);

-- create table public.bedes_term_maps (
--     id serial primary key,
--     mapped_term_id int not null references public.mapped_terms (id) on delete cascade,
--     bedes_term_id int not null references public.bedes_term (id) on delete cascade,
--     order_number int not null,
--     unique (mapped_term_id, order_number)
-- );

create table public.composite_term_maps (
    id serial primary key,
    app_term_id int not null references public.app_term (id) on delete cascade,
    app_list_option_uuid uuid references public.app_term_list_option (uuid),
    bedes_composite_term_uuid uuid not null references public.bedes_composite_term (uuid) on delete cascade
);

-- table that containst he different states an application can be in as it's waiting
-- for a mapping request to be made public.
create table public.promote_request_status (
    id int primary key,
    name varchar(30) unique not null
);

-- create the different states for an application's public mapping request
insert into public.promote_request_status (id, name) values
    (1, 'Pending'),
    (2, 'Approved'),
    (3, 'Rejected')
;

-- table that contains the requests for a mapping application to be made public
create table public.application_promote_request (
    id serial primary key,
    app_id int not null references public.mapping_application (id),
    status_id int not null references public.promote_request_status (id) default 1,
    notes varchar(1000),
    request_time timestamp default now()
);

-- table that contains the requests for a composite term to be made public
create table public.composite_term_promote_request (
    id serial primary key,
    composite_term_id int not null references public.bedes_composite_term (id),
    status_id int not null references public.promote_request_status (id) default 1,
    notes varchar(1000),
    request_time timestamp default now()
);
