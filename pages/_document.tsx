import Document from 'next/document'
import { Head, Html, Main, NextScript } from 'next/document'
// import { ServerStyleSheetDocument } from 'next-sanity/studio'

export default class MyDocuments extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Cookiebot script */}
          {/* <script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid="9699f32c-598b-4346-a216-dbd982c3a659"
            data-blockingmode="auto"
            type="text/javascript"
            async
          ></script> */}
          {/* End Cookiebot script */}

          {/* Illow script */}
          <script src="https://platform.illow.io/banner.js?siteId=993c923f-5a12-4a60-95aa-6d14fa7480a4"></script>
          {/* End Illow script */}

          {/* Google Tag Manager */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){
                  w[l]=w[l]||[];
                  w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});
                  var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
                  j.async=true;
                  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                  f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-TCLS38JM');
              `,
            }}
          />
          {/* End Google Tag Manager */}
        </Head>
        <body>
          {/* Google Tag Manager (noscript) */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
                <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TCLS38JM"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
              `,
            }}
          />
          {/* End Google Tag Manager (noscript) */}
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
