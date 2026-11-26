import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      const slimKey = 'elimika_cache_slimmed_v7_2027';
      if (!localStorage.getItem(slimKey) && 'caches' in window) {
        caches
          .keys()
          .then((keys) => {
            keys.forEach((k) => {
              if (!k.includes('v7-2027')) {
                caches.delete(k);
              }
            });
          })
          .catch(() => {});
        localStorage.setItem(slimKey, '1');
      }
    } catch {
      // ignore storage errors
    }

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const reg of registrations) {
          reg.update().catch(() => {});
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      })
      .catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(<App />);

