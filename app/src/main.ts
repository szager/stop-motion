import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '@environment/environment';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';
import { AppModule } from './app/app.module';


if (environment.production) {
  Sentry.init({
    dsn: 'https://abbe8393199b4dc7be6f61c1e16fd1a7@o59683.ingest.sentry.io/5902066',
    integrations: [
      new Integrations.BrowserTracing({
        // TODO add live url
        tracingOrigins: ['https://stop-motion.web-punks.com'],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  enableProdMode();
  window.console.log = () => { };
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
