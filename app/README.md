# Stop Motion App

The [Stop Motion App](https://kits.blog/) is built the Ionic framework.

## Prerequirements

- Ionic CLI 5.x.x
- Node 14.16.x

## Main tasks

Task automation is based on [NPM scripts](https://docs.npmjs.com/misc/scripts) and [Ionic scripts](https://ionicframework.com/docs/cli/).

Tasks                               | Description
------------------------------------|---------------------------------------------------------------------------------------
npm start                           | Run development server on `http://localhost:8080/` (bs default)
ionic serve                         | Run development server on `http://localhost:8100/` (default)
ionic build                         | Create build inside www folder

## Web

### Build and deploy to firebase

``ionic build --prod``

## Project structure

```
global.scss                  app global styles
src/                         project source code
|- app/                      app components
|  |- app.component.*        app root component (shell)
|  |- app.component.html     app root component template
|  |- app.component.scss     app root component styles
|  |- app.module.ts          app root module definition
|  |- components/            global components (header, footer etc.)
|  |- directives/            shared directives
|  |- enums/                 app related enumerations (network status)
|  |- interfaces/            app related interfaces (header options)
|  |- models/                app related data models (topics, exams, sections)
|  |- pages/                 app pages (login, register, lists...)
|  |- pipes/                 shared pipes
|  |- services/              shared services
|- assets/                   app assets (images, fonts, translations...)
|- environments/             environment related configuration
|- theme/                    scss variables
|- index.html                html entry point
www/                         compiled version
```
