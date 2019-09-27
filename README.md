# BEDES Manager
The BEDES Manager is a web-based application for managing the superset of BEDES Atomic and Composite Terms and the related application mappings in which they are used.

The BEDES Manager is built using Angular 7, a Node.js Express server running the backend, and a PostgreSQL database.

# Running the BEDES Manager

There are 2 different ways to run the BEDES Manager:

1. [docker-compose](https://docs.docker.com/compose/)
2. the console using Node.js

# Setting up Environment Variables

The applicaton uses enviornment variables, taken from a file named `.env` in the project root directory, for various configuration parameters.

The `/sample.env` file contains all of the enviornment variables used by the application.  Create a copy of this file and rename it to `.env`.
At a minimum, the passwords for the `bedes-manager` user needs to be set.

<!-- ## Quick Start

1. Create a copy of `sample.env` and rename it to `.env`. Edit the `.env` file to make sure all passwords are entered.
2. `make init_docker` - Builds dependent Docker images and creates the database volume.
3. `docker-compose up` - Builds the images, if they don't exist, and brings up the app.
4. `docker-compose logs`, or the console output if running in the foreground, will indicate when the database has been built and the node.js server is ready to accept connections.
5. `make run_scripts_data_init` - Load the initial set of BEDES terms and create the bedes admin/user test accounts. -->

# Running BEDES Manager with Docker Compose

To launch the BEDES Manager using docker-compose:

1. Set the environment variables, as indicated above, in the `.env` file.
2. Build the dependent Docker images:
```
$ make init_docker
```
3. Start the Docker containers:
```
$ docker-compose up
```

Running `docker-compose up` will launch 3 containers:

1. The PostgreSQL database container.
    * Initialization scripts passed into the container are in `./bedes-db/docker-entrypoint-initdb.d`, will run whenever a database needs to be initialized.
2. The Backend Node.js image
3. The Frontend Nginx image.

## Loading Test Data and Setting up User Accounts

Running `docker-compose up` will initially load a database with all of the BEDES tables, but no data or users created.

To load the initial set of BEDES terms, the `bedes-admin` account, and the test user accounts:

```
$ make run_scripts_data_init
```

This will laucnch another Docker container that attachees to the docker network defined in the `.env` file, and run 3 separate scripts located in `scripts/ts`, that perform each of the three actions listed above.

The user information for the `bedes-admin` and test user accounts are set in the `.env` file.

# Running BEDES Manager with Node.js

The BEDES Manager requires Node.js 10.

## Install npm dependencies

Install all npm dependencies by running `npm install` in these directories:
1. bedes-frontend/
2. bedes-common/
3. bedes-backend/
4. scripts/ts

## Setup the PostgreSQL database

The database was built using PostgreSQL 11.

The easiest way to get the database up and running is:

```
$ cd bedes-db
$ make run
```

This will launch a Docker container running PostgreSQL, the version of which is defined in the `.env` file.

Note: the various scripts in the package assume a Docker instance of PostgreSQL, so running a local non-Docker version of PostgreSQL will require some modifications to the scripts.

## Loading Test Data and Setting up User Accounts 

To load the initial set of BEDES terms, the `bedes-admin` account, and the test user accounts:

```
$ make load-dev-data
```

This will run 3 separate scripts located in `scripts/ts`, that perform each of the three actions listed above.

The user information for the `bedes-admin` and test user accounts are set in the `.env` file.

## Starting the Frontend and Backend

Once the database is up and running, and has user accounts + test data loaded:

Start the Node.js Express server

```
$ cd bedes-backend
$ npm start
```

and

Start the Angular development server
```
$ cd bedes-frontend
$ npm start
```
