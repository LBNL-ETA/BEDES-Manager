
create table public.term_type (
    id serial primary key,
    name varchar(100) not null unique
);

insert into public.term_type (name) values
    ('Global'),
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
-- insert into public.data_type (name) values
--     ('Constrained List')
-- ;

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
    unit_id int references public.unit (id) not null
);
