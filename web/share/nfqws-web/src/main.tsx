import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppRouterProvider } from '@/components/AppRouterProvider';

import { createAppRouter } from '@/utils/createAppRouter';

import './index.css';

const router = createAppRouter();

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  const render = () => {
    root.render(
      <StrictMode>
        <AppRouterProvider router={router} />,
      </StrictMode>,
    );
  };

  if (import.meta.env.MODE === 'development') {
    enableMocking().then(render);
  } else {
    render();
  }
}

async function enableMocking() {
  const { worker } = await import('./mocks/browser');

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}
