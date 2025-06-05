export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
      <>
        <head>
          <link rel="preload" href="https://core.sanity-cdn.com/bridge.js" as="script" />
        </head>
        <script src="https://core.sanity-cdn.com/bridge.js" async type="module" />
        {children}
      </>
    )
  }