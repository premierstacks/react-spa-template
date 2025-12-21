import './index.scss';

document.querySelectorAll('link[rel="preload"][as="style"]').forEach((link) => {
  if (link instanceof HTMLLinkElement) {
    link.rel = 'stylesheet';
  }
});

import 'core-js/actual';

import './observability';

navigator.serviceWorker.register('/sw.js')
  .then(() => {
    console.log('Service Worker registered successfully.');
  })
  .catch(() => {
    console.error('Service Worker registration failed.');
  });

void import('./bootstrap');
