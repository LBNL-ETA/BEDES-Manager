
create table public.term_type (
    id serial primary key,
    name varchar(100) not null unique
);

insert into public.term_type (name) values
    ('Global Terms'),
    ('Premises'),
    ('Contact'),
    ('Measures'),
    ('Envelope'),
    ('HVAC'),
    ('Loads'),
    ('Controls And Operation'),
    ('Generation And Storage Equipment'),
    ('Resources'),
    ('Emissions'),
    ('Waste')
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
    name varchar(100) not null unique
);

create table public.bedes_term (
    id serial primary key,
    name varchar(100) unique not null,
    term_type_id int references public.term_type (id) not null,
    data_type_id int references public.data_type (id) not null,
    source_id int references public.definition_source (id),
    unit_id int references public.unit (id) not null
);

create table public.bedes_term_list_option (
    id serial primary key,
    term_id int references public.bedes_term (id) on delete cascade not null,
    name varchar(150) not null,
    description text not null,
    unit_id int references public.unit (id) not null,
    definition_source_id int references public.definition_source (id)
);
-- Want to ensure uniqueness, but some terms have the same name and different descriptions
-- Use an md5 hash of the text field instead of using the actual text as the unique constraint.
-- e.g. Premises - Assessment Level
create unique index on public.bedes_term_list_option (term_id, name, md5(description));

create table public.app (
    id serial primary key,
    name varchar(100) not null unique
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

create table public.app_term (
    id serial primary key,
    app_id int references public.app (id) on delete cascade not null,
    field_code text not null unique,
    name varchar(100) not null,
    description text
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

create table public.mapped_terms (
    id serial primary key,
    app_id int references public.app (id) on delete cascade not null
);

create table public.app_term_maps (
    id serial primary key,
    mapped_term_id int not null references public.mapped_terms (id) on delete cascade,
    app_term_id int not null references public.app_term (id) on delete cascade
);

create table public.bedes_term_maps (
    id serial primary key,
    mapped_term_id int not null references public.mapped_terms (id) on delete cascade,
    bedes_term_id int not null references public.bedes_term (id) on delete cascade
);