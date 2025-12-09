import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideHttpClient} from "@angular/common/http";
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

import {MAT_DATE_LOCALE} from '@angular/material/core'; // Для установки локали
import localeRu from '@angular/common/locales/ru'; // Импорт русской локали
import {registerLocaleData} from '@angular/common'; // Регистрация локали

registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimations(), provideAnimationsAsync(),
    provideHttpClient(),
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'}
  ]
};
