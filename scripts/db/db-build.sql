
create table public.term_category (
    id serial primary key,
    name varchar(100) not null unique
);
alter table public.term_category owner to bedes_admin;

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
alter table public.data_type owner to bedes_admin;
insert into public.data_type (name) values
    ('Constrained List'),
    ('Decimal'),
    ('Integer'),
    ('String'),
    ('Timestamp')
;

create table public.unit (
    id serial primary key,
    name varchar(30) not null unique
);
alter table public.unit owner to bedes_admin;
insert into public.unit (name) values
    ('$'),
    ('$/(Btu/hr-F)'),
    ('$/(ft3/min)'),
    ('$/(kBtu/hr)'),
    ('$/(kW-C)'),
    ('$/(m3/s)'),
    ('$/ft2'),
    ('$/ft3'),
    ('$/kBtu'),
    ('$/kVAR'),
    ('$/kW'),
    ('$/kWh'),
    ('$/m2'),
    ('$/m3'),
    ('$/unit'),
    ('A'),
    ('ACH'),
    ('acres'),
    ('Btu'),
    ('Btu/(hr-F)'),
    ('Btu/(hr-ft-F)'),
    ('Btu/(hr-ft2-F)'),
    ('Btu/(lb-F)'),
    ('Btu/hr'),
    ('Btu/s'),
    ('Btu/Wh'),
    ('C'),
    ('cal/hr'),
    ('ccf'),
    ('cd/m2'),
    ('cfh'),
    ('cfm'),
    ('cmh'),
    ('cooling tons'),
    ('cord'),
    ('count'),
    ('count/ft2'),
    ('count/m2'),
    ('cycles/kWh'),
    ('days'),
    ('DD'),
    ('deg'),
    ('F'),
    ('fc'),
    ('ft'),
    ('ft-lbf/hr'),
    ('ft-lbf/min'),
    ('ft/s'),
    ('ft2'),
    ('ft3'),
    ('ft3/(kBtu/cycle)'),
    ('gal'),
    ('gal/cycle'),
    ('gal/cycle/ft3'),
    ('gal/day'),
    ('gal/ft2'),
    ('gal/kBtu'),
    ('gal/kWh'),
    ('GHz'),
    ('gpm'),
    ('gram/hr'),
    ('GW'),
    ('GWh'),
    ('hectares'),
    ('hh'),
    ('hh:mm'),
    ('hh:mm:ss'),
    ('hh:mm:ss.sss'),
    ('hp'),
    ('hr'),
    ('hr-ft2-F/(Btu-in)'),
    ('hr-ft2-F/Btu'),
    ('hr/day'),
    ('hr/week'),
    ('hr/year'),
    ('Hz'),
    ('in'),
    ('in2'),
    ('in3'),
    ('J/(kg-K)'),
    ('kBtu'),
    ('kBtu/(gal/day)'),
    ('kBtu/ft2'),
    ('kBtu/hr'),
    ('kBtu/hr/ton'),
    ('kcf'),
    ('kcf/hr'),
    ('kg'),
    ('kg/hr'),
    ('kg/kWh'),
    ('kg/MMBtu'),
    ('kg/unit'),
    ('kgal'),
    ('kgal/ft2'),
    ('kgCO2e'),
    ('kgCO2e/gpd'),
    ('kgCO2e/MMBtu'),
    ('kHz'),
    ('klbs'),
    ('klbs/hr'),
    ('km'),
    ('kPa'),
    ('kph'),
    ('kW'),
    ('kW/ton'),
    ('kWh'),
    ('kWh/ft2'),
    ('kWh/m2'),
    ('L'),
    ('L/cycle'),
    ('L/cycle/m3'),
    ('L/day'),
    ('L/kBtu'),
    ('L/kWh'),
    ('L/m2'),
    ('L/min'),
    ('lbs'),
    ('lbs/ft2'),
    ('lbs/ft3'),
    ('lbs/hr'),
    ('lbs/kBtu'),
    ('lbs/kWh'),
    ('lbs/unit'),
    ('lbsCO2e'),
    ('linear ft'),
    ('loads/week'),
    ('lumens'),
    ('lux'),
    ('m'),
    ('m/s'),
    ('m2'),
    ('m2-K/(W-cm)'),
    ('m2-K/W'),
    ('m3'),
    ('m3/(kWh/cycle)'),
    ('m3/day'),
    ('m3/s'),
    ('Mcf'),
    ('Mcf/day'),
    ('mg'),
    ('mg/L'),
    ('Mgal'),
    ('Mgal/day'),
    ('MHz'),
    ('mi'),
    ('micro Hz'),
    ('micro V'),
    ('military time'),
    ('min'),
    ('Mlbs'),
    ('Mlbs/hr'),
    ('MM'),
    ('MM-DD'),
    ('MMBtu'),
    ('MMBtu/hr'),
    ('months'),
    ('mph'),
    ('MtCO2e'),
    ('mV'),
    ('MW'),
    ('MWh'),
    ('n/a'),
    ('Pa'),
    ('percent'),
    ('pixels'),
    ('pixels/in2'),
    ('ppi'),
    ('psi'),
    ('rpm'),
    ('s'),
    ('therms'),
    ('therms/hr'),
    ('ton'),
    ('ton-hr'),
    ('tonne'),
    ('V'),
    ('W'),
    ('W/(m-K)'),
    ('W/(m2-K)'),
    ('W/ft2'),
    ('W/K'),
    ('W/m2'),
    ('weeks'),
    ('weeks/year'),
    ('Wh'),
    ('Wh/((m3/s)/day)'),
    ('years'),
    ('YYYY'),
    ('YYYY-MM'),
    ('YYYY-MM-DD'),
    ('YYYY-MM-DD hh:mm'),
    ('YYYY-MM-DD hh:mm:ss'),
    ('YYYY-MM-DD hh:mm:ss.sss')
;

create table public.definition_source (
    id serial primary key,
    name text not null unique
);
alter table public.definition_source owner to bedes_admin;
insert into public.definition_source (name) values
    ('LBNL'),
    ('LBNL/IEP'),
    ('Solar Cells'),
    ('BEDES Beta'),
    ('EPA'),
    ('ENERGY STAR'),
    ('DOE'),
    ('NREL'),
    ('BuildingSync'),
    ('LBNL/BEDES-Beta'),
    ('ASHRAE'),
    ('IBPSA-USA'),
    ('LBNL/BEDES Beta'),
    ('RETS'),
    ('ESPM'),
    ('RESO'),
    ('BEDES-Beta/ESPM'),
    ('BEDES-Beta/ESPM/EIA/CMS'),
    ('ESPM/CENSUS/NAICS'),
    ('BEDES-Beta/ESPM/NAICS'),
    ('BEDES-Beta/NAICS'),
    ('BEDES-Beta/ESPM/CAST/NAICS'),
    ('BEDES-Beta/CAST'),
    ('ESPM/NAICS'),
    ('BEDES-Beta'),
    ('Food Service Survey'),
    ('BEDES-Beta/ESPM/CAST'),
    ('BEDES-Beta/CAST/NAICS'),
    ('NAICS'),
    ('OSHA'),
    ('CPUC'),
    ('US Census'),
    ('LBNL/AIA'),
    ('ASHRAE 105-2007\r Standard Methods of Determining, Expressing, and Comparing Building Energy Performance and Greenhouse Gas Emissions'),
    ('WELL Building Standard'),
    ('Home Innovation Research Labs'),
    ('PHIUS'),
    ('LEED v4 Guide'),
    ('LBNL/HPXML'),
    ('LBNL/ESPM'),
    ('LBNL/NREL'),
    ('LBNL/ASHRAE'),
    ('LBNL/EPLUS'),
    ('SEE Action'),
    ('FGDC'),
    ('USPS'),
    ('ePB'),
    ('Seattle'),
    ('CTS, ePB'),
    ('BEDES Beta, HPXML'),
    ('ICP'),
    ('CTS'),
    ('HPXML'),
    ('IPMVP'),
    ('LBNL/BEDES Beta 2.4'),
    ('BEDES Beta 2.4'),
    ('LBNL/CAST'),
    ('CAST'),
    ('LBNL/CEC'),
    ('LBNL/HPXML/CAST'),
    ('IBC/ASTM'),
    ('NFRC'),
    ('NFRC 200-2014'),
    ('LBNL/HES-SF'),
    ('http://energyoptionsexplained.com/sealed-combustion-boilerfurnace/'),
    ('http://www.furnacecompare.com/faq/definitions/power_burner.html'),
    ('http://www.furnacecompare.com/faq/definitions/iid.html'),
    ('http://www.sabien-tech.co.uk/products/m2g/what-are-modulating-burners'),
    ('ASHRAE Wiki'),
    ('ASHRAE Wiki, AUC?'),
    ('TPE/BCL'),
    ('CEC'),
    ('Wikipedia'),
    ('PG&E'),
    ('AUC'),
    ('ASHRAE Wiki, AUC'),
    ('Gasification Technologies Council'),
    ('ANSI/ASHRAE, CEC HERS, DOE-NREL'),
    ('USDOE'),
    ('ESPM\r Glossary'),
    ('CEC Proposition 39'),
    ('Open EI'),
    ('SmartGrid.gov'),
    ('Greenbutton'),
    ('OpenEI'),
    ('OpenEI/LBNL'),
    ('GRESB'),
    ('Green Button')
;

create table public.sector (
    id int primary key,
    name text not null unique
);
alter table public.sector owner to bedes_admin;
insert into public.sector (id, name) values
    (1, 'n/a'),
    (2, 'Multifamily'),
    (3, 'Residential'),
    (4, 'Commercial')
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
alter table public.bedes_term owner to bedes_admin;
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
alter table public.bedes_term_list_option owner to bedes_admin;
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
alter table public.bedes_term_sector_link owner to bedes_admin;
create index on public.bedes_term_sector_link (term_id);
create index on public.bedes_term_sector_link (sector_id);

-- visibility of objects
create table public.scope (
    id int primary key,
    name varchar (30) not null unique
);
alter table public.scope owner to bedes_admin;
insert into public.scope (id, name) values
    (1, 'Private'),
    (2, 'Public'),
    (3, 'Approved')
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
    scope_id int not null references public.scope (id) default 1,
    created_date timestamp default now(),
    modified_date timestamp default now()
);
alter table public.bedes_composite_term owner to bedes_admin;
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
alter table public.bedes_composite_term_details owner to bedes_admin;

-- ApplicationRole
create table public.application_role_type (
    id int primary key,
    name varchar(30) not null unique,
    description varchar(200)
);
alter table public.application_role_type owner to bedes_admin;
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
alter table public.mapping_application owner to bedes_admin;

-- Links authenticated users to mapping applications
create table public.mapping_application_roles (
    id serial primary key,
    app_id int not null references public.mapping_application (id) on delete cascade,
    role_id int not null references public.application_role_type (id),
    user_id int not null references auth.user (id),
    created_date timestamp default now(),
    unique (app_id, user_id)
);
alter table public.mapping_application_roles owner to bedes_admin;

create table public.app_field (
    id int primary key,
    name varchar(100) unique not null,
    description text 
);
alter table public.app_field owner to bedes_admin;

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
alter table public.term_type owner to bedes_admin;
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
    unit varchar(50),
    unique (app_id, name)
);
alter table public.app_term owner to bedes_admin;
create index on public.app_term (uuid);

create table public.app_term_list_option (
    id serial primary key,
    app_term_id int references public.app_term (id) on delete cascade not null,
    name varchar(500) not null,
    description varchar(1000),
    unit varchar(50),
    uuid uuid not null unique,
    unique (app_term_id, name)
);
alter table public.app_term_list_option owner to bedes_admin;

-- create table public.app_term_additional_data (
--     id serial primary key,
--     app_term_id int references public.app_term (id) on delete cascade not null,
--     app_field_id int references app_field (id) not null,
--     value text,
--     unique(app_term_id, app_field_id)
-- );
-- alter table public.app_term_additional_data owner to bedes_admin;

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
alter table public.atomic_term_maps owner to bedes_admin;

create table public.atomic_term_list_option_maps (
    id serial primary key,
    bedes_list_option_uuid uuid not null references public.bedes_term_list_option (uuid),
    app_term_id int not null references public.app_term (id),
    app_list_option_uuid uuid references public.app_term_list_option (uuid)
);
alter table public.atomic_term_list_option_maps owner to bedes_admin;

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
alter table public.composite_term_maps owner to bedes_admin;
