// Register service worker for PWA support
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        console.log('ServiceWorker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, show update notification
                console.log('New content available, please refresh.');
              }
            });
          }
        });
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    });
  }
}

// Check if app is installed as PWA
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// Prompt user to install PWA
export function promptInstall(): Promise<boolean> {
  return new Promise((resolve) => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        resolve(choiceResult.outcome === 'accepted');
        (window as any).deferredPrompt = null;
      });
    } else {
      resolve(false);
    }
  });
}

// Listen for install prompt
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
  });
}
