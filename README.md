# BEDES Mapping Manager
The Bedes Mapping Manager is a web-based application for managing the superset of BEDES Atomic and Composite Terms and the related application mappings in which they are used.

## Setting up the Environment

### Environment and Environment Variables
All of the application components use environment variables to set various configuration parameters. The app expects environment files named `.env` in both the app root and /bedes-db.  Sample .env files, named sample.env, can be found in both locations.

#### Creating the Environment Files
Copy `/sample.env` to `.env`, and set the passwords.  Do the same thing with the `/bedes-db/sample.env` file.

### Building the Database

#### Install Command
A Makefile in the app root provides a quick method of building the database and install the npm packages:

        $ make install

This command will:

1. Run the PostgreSQL Docker image
2. Build the database objects.
3. Install the npm packages

#### PostgreSQL 10.5

The BEDES Mapping Manager uses PostgreSQL 10.5, which can be running locally or remotely.

Docker is not required to run the BEDES Mapping Manger, but there's `Docker run` commands defined in `/bedes-db/Makefile`
which make using the PostgreSQL Docker image easier than setting it up locally.

To install and run the official Docker PostgreSQL 10.5 image:

    // Docker (https://www.docker.com/) should already be installed and running
    // Both .env files described above should already be setup with secure passwords
    $ cd bedes-db/
    $ make install_and_run

One could also point the BEDES Mapping Manager database to a different host using the `/.env` file instead of running it locally.

#### Building the Tables

The database object definitions can be found at `/scripts/db/db-build.sql`.


The Makefile at `/scripts/db/Makefile` defines commands to:

- Build all the database objects (executes the `db-build.sql` script):

        $ make db_build_all

- Drop all the database objects (executes the `db-drop.sql` script):

        $ make db_drop_all

- rebuilding the database (combination of the two make commands above):

        $ make db_rebuild_all


## Populating the Database

The TypeScript files for loading the BEDES terms and application mappings can be found at `/scripts/ts`.

There's 2 main modules for loading the BEDES terms and application mappings:

1. `term-loader`: Loads the BEDES terms from the `/bedes-mappings/BEDES V2.1_0.xlsx` file.

        $ cd scripts/ts
        $ npm run load-terms

2. `mappings-loader`: Loads the application mappings from the various files in `/bedes-mappings`

        $ cd scriprts/ts
        $ npm run load-mappings
    
    Currently only `/bedes-mappings/BPI-2200-S HPXML to BEDES V2 Mapping 20161026_0.xls` can be loaded.