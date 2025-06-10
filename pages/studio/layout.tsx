const bridgeScript = 'https://core.sanity-cdn.com/bridge.js'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script src={bridgeScript} async type="module" />
      {children}
    </>
  )
}