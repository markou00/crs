import '@mantine/core/styles.css';

import { ColorSchemeScript } from '@mantine/core';
import Provider from '@/lib/Providers';

import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import './layout.css';

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
