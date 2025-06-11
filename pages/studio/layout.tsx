// app/layout.tsx (or wherever your layout is located)
import Script from 'next/script';

const bridgeScript = 'https://core.sanity-cdn.com/bridge.js';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Preload the script using <link> in <head> */}
      <head>
        <link rel="modulepreload" href={bridgeScript} as="script" />
      </head>
      {/* Load the script with Next.js Script component */}
      <Script
        src={bridgeScript}
        strategy="afterInteractive" // or "lazyOnload" depending on your needs
        type="module"
      />
      {children}
    </>
  );
}