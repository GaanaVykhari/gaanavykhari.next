'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { SessionProvider } from 'next-auth/react';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'var(--font-pt-mono), "PT Mono", monospace',
  fontFamilyMonospace: 'var(--font-pt-mono), "PT Mono", monospace',
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
  components: {
    Container: {
      defaultProps: {
        size: 'lg',
      },
      styles: {
        root: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace',
        },
      },
    },
    Text: {
      defaultProps: {
        fontFamily: 'var(--font-pt-mono)',
      },
      styles: {
        root: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
      },
    },
    Title: {
      defaultProps: {
        fontFamily: 'var(--font-pt-mono)',
      },
      styles: {
        root: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
      },
    },
    Button: {
      defaultProps: {
        fontFamily: 'var(--font-pt-mono)',
      },
      styles: {
        root: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
      },
    },
    TextInput: {
      defaultProps: {
        fontFamily: 'var(--font-pt-mono)',
      },
      styles: {
        input: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
        label: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
        header: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
        navbar: {
          fontFamily: 'var(--font-pt-mono), "PT Mono", monospace !important',
        },
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications />
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}
