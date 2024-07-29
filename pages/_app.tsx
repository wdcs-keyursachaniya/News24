// @ts-nocheck
import { useEffect } from 'react';
import '../styles/index.css'

function MyApp({ Component, pageProps }) {
  // components/ScriptLoader.js (continued)
  useEffect(() => {
    const handleConsentUpdate = () => {
      if (window.illow && window.illow.getConsent) {
        const consent = window.illow.getConsent();

        // Assuming `consent` has properties like `ad_storage` and `analytics_storage`
        gtag('consent', 'update', {
          ad_storage: consent.ad_storage ? 'granted' : 'denied',
          analytics_storage: consent.analytics_storage ? 'granted' : 'denied',
        });
      }
    };

    // Attach listener to Illow CMP for consent changes
    window.addEventListener('illow:consentUpdate', handleConsentUpdate);

    return () => {
      window.removeEventListener('illow:consentUpdate', handleConsentUpdate);
    };
  }, [window]);

  return <Component {...pageProps} />
}

export default MyApp
