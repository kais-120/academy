import { extendTheme } from '@chakra-ui/react';

// ---------------------------------------------------------------------------
// Palette — pensée pour une administration scolaire : bleus institutionnels,
// blancs et gris très clairs pour la lisibilité, une touche de vert sauge
// pour les indicateurs positifs, et un vert-eau discret pour les accents
// secondaires (repris du logo).
// ---------------------------------------------------------------------------

const colors = {
  brand: {
    50: '#EAF1FB',
    100: '#CEE0F6',
    200: '#A3C6EE',
    300: '#78ABE6',
    400: '#4D8FDD',
    500: '#2C6FD1', // bleu principal
    600: '#1B4B8F', // bleu institutionnel (marque)
    700: '#153A70',
    800: '#102B54',
    900: '#0B1D38',
  },
  accent: {
    50: '#EAF7F5',
    100: '#CDEBE7',
    200: '#9FD9D1',
    300: '#7CC7C0', // vert-eau du logo
    400: '#4FADA3',
    500: '#348B82',
  },
  positive: {
    50: '#EAF8EF',
    100: '#CDEEDA',
    300: '#7FD4A6',
    500: '#21A366', // vert statistiques positives
    600: '#188550',
  },
  warning: {
    50: '#FFF6E9',
    300: '#F7C878',
    500: '#E38F2C',
  },
  danger: {
    50: '#FDECEC',
    300: '#F0A0A0',
    500: '#D14343',
  },
  ink: {
    50: '#F7F9FC',   // fond général de l'app
    100: '#EEF2F8',
    200: '#E4E9F2',  // bordures
    400: '#94A3B8',
    500: '#64748B',
    700: '#334463',
    800: '#1F2E4A',
    900: '#101A2E',  // texte principal
  },
};

const fonts = {
  heading: `'Cairo', sans-serif`,
  body: `'Cairo', sans-serif`,
};

const styles = {
  global: {
    'html, body': {
      backgroundColor: 'ink.50',
      color: 'ink.900',
      fontFamily: 'body',
    },
    '#root': {
      minHeight: '100vh',
    },
    '*::selection': {
      backgroundColor: 'brand.200',
    },
    // scrollbars discrets, cohérents avec l'identité
    '*::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '*::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '*::-webkit-scrollbar-thumb': {
      background: 'var(--chakra-colors-ink-200)',
      borderRadius: '8px',
    },
    '*::-webkit-scrollbar-thumb:hover': {
      background: 'var(--chakra-colors-ink-400)',
    },
  },
};

const shadows = {
  card: '0 1px 2px rgba(16, 26, 46, 0.04), 0 8px 24px -12px rgba(27, 75, 143, 0.12)',
  cardHover: '0 4px 10px rgba(16, 26, 46, 0.06), 0 16px 32px -14px rgba(27, 75, 143, 0.18)',
  popover: '0 12px 32px -8px rgba(16, 26, 46, 0.22)',
};

const radii = {
  xl2: '1.25rem',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'xl',
    },
    variants: {
      solid: {
        bg: 'brand.600',
        color: 'white',
        _hover: { bg: 'brand.700', _disabled: { bg: 'brand.600' } },
        _active: { bg: 'brand.800' },
      },
      outline: {
        borderColor: 'ink.200',
        color: 'ink.700',
        _hover: { bg: 'ink.50', borderColor: 'brand.300' },
      },
      ghost: {
        color: 'ink.700',
        _hover: { bg: 'ink.100' },
      },
    },
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: '2xl',
        boxShadow: 'card',
        bg: 'white',
        border: '1px solid',
        borderColor: 'ink.200',
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 2.5,
      py: 0.5,
      fontWeight: '600',
      textTransform: 'none',
      fontSize: 'xs',
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          color: 'ink.500',
          fontFamily: 'body',
          fontWeight: '600',
          textTransform: 'none',
          letterSpacing: 'normal',
          borderColor: 'ink.200',
          bg: 'ink.50',
        },
        td: {
          borderColor: 'ink.100',
        },
      },
    },
  },
  Menu: {
    baseStyle: {
      list: {
        borderRadius: 'xl',
        boxShadow: 'popover',
        border: '1px solid',
        borderColor: 'ink.200',
        py: 2,
      },
      item: {
        borderRadius: 'md',
        mx: 1,
        w: 'calc(100% - 8px)',
      },
    },
  },
};

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors,
  fonts,
  styles,
  shadows,
  radii,
  components,
  config,
});

export default theme;
