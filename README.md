# BEDES Manager
The BEDES Manager is a web-based application for managing the superset of BEDES Atomic and Composite Terms and the related application mappings in which they are used.

## Setting up the Environment

### Environment and Environment Variables
Environment variables used throughout the app are set in the *.env files located in `./environment`.
There should be a xyz.env file for each xyz.sample.env file in the folder, where all of the
runtime parameters and passwords should be set to one's own specification.

## Running the BEDES Manager
There are two ways to run the BEDES Mapping Manger in your local environment:

1. Docker Compose - Runs all components in a single command.
2. Local installation of Node.js and PostgreSQL, running each component seprately.

### Docker Compose
To launch the BEDES Manager using docker-compose:

1. All of the environment variables, as indicated above, should be set.
2. at the project root type:

```
$ make angular
$ docker-compose up
```

The `make angular` command runs the angular build in the context of a Docker container. The resulting output of which should be in `./bedes-frontend/dist/Bedes-App`. The nginx Dockerfile copies this build directory when building the nginx image.

Running `docker-compose up` will launch 4 containers:

1. The PostgreSQL database container.
    * Initialization scripts passed into the container are in `./bedes-db/docker-entrypoint-initdb.d`, will run whenever a database needs to be initialized.
2. The Backend Node.js image
3. The Frontend Nginx image, which uses the build folder generated from the `make angular` command.
4. The **Scripts** container
    * When the containers are started, this container checks the `public.bedes_term` table for any entries. If there are no records present, this container initiates the scripts to load:
        I. The `BEDES V2.2.xlsx` file.
        II. The `BEDES_all-terms_V2-2.xml` file.
        III. The `BEDES_all-terms_V2-2.xml` file.

### Node.js and PostgreSQL
Running the components in your local environment requires Node.js and PostgreSQL to be running on your machine.

### Building the Database

#### Install Command
A Makefile in the app root provides a quick method of building the database and install the npm packages:

        $ make install

This command will:

1. Run the PostgreSQL Docker image
2. Build the database objects.
3. Install the npm packages

#### PostgreSQL 11.0

The BEDES Manager uses PostgreSQL 11.0, which can be running locally or remotely.

Docker is not required to run the BEDES Mapping Manger, but there's `Docker run` commands defined in `/bedes-db/Makefile`
which make using the PostgreSQL Docker image easier than setting it up locally.

To install and run the official Docker PostgreSQL 11.0 image:

    // Docker (https://www.docker.com/) should already be installed and running
    // Both .env files described above should already be setup with secure passwords
    $ cd bedes-db/
    $ make install_and_run

One could also point the BEDES Manager database to a different host using the `/.env` file instead of running it locally.

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

To load the initial set of BEDES Terms:

        $ cd scripts/ts
        $ npm run load-all

This runs the loads the BEDES terms from the `/bedes-mappings/BEDES V2.2.xlsx`, and then supplements missing information (eg UUID) from the `BEDES_all-terms_V2-2.xml` and `BEDES_all_list_options_V2-2.xml` files.
    