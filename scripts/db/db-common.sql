-- Create database objects common to the entire database.
-- This script should be run prior to any other scripts,
-- as other database objects are dependent on these objects.

-- uncomment and provide the epb_user password to create the user
-- do not push this up to origin with the password in place.
-- create user epb_user with encrypted password '';

-- function for updating the modified_date for applicable tables
create or replace function update_modified_date()   
returns trigger as $$
begin
    new.modified_date = now();
    return new;   
end;
$$ language 'plpgsql';
alter function update_modified_date owner to bedes_admin;
