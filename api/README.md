# stop-motion-api

## Prerequirements

- Nestjs CLI 8.x.x
- Node 16.x.x

## Installation

```bash
# install
$ yarn install
```

## Code scaffolding

Run `nest g s service-name` to generate a new service. You can also use `ng generate decorator|controller|pipe|service|class|guard|interface|enum|module`.

## Running the app

Run `yarn run start:dev` for a dev server. Navigate to `http://localhost:9000/`. The app will automatically reload if you change any of the source files.

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Docker

Most import commands are simpflied inside Makefile.

```bash
make > will run default task, which is build
make build > will build api applications
make start  > will start api applications
make clean > will clean up api applications container
make update-deployment > will create network and build app and api
make stop-deployment > will stop app and api
make clean-deployment > will clean up containers and network

## Further help

To get more help on the Nestjs CLI use `ng help` or go check out the [Nestjs CLI Overview and Command Reference](https://docs.nestjs.com/cli/overview) page.
