import './index.scss';

document.querySelectorAll('link[rel="preload"][as="style"]').forEach((link) => {
  if (link instanceof HTMLLinkElement) {
    link.rel = 'stylesheet';
  }
});

import 'core-js/actual';

import './observability';

void import('./bootstrap');
