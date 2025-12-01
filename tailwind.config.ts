import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Sky Blue Gradient System
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        // Neutrals
        neutral: {
          white: '#FFFFFF',
          'almost-white': '#F8FAFC',
          'rich-dark': '#1E293B',
          'deep-dark': '#0F172A',
        },
        // Accents
        accent: {
          warm: '#FDE68A',
          coral: '#FCA5A5',
        },
        // Legacy support
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['56px', { lineHeight: '1.1', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h1': ['40px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h2': ['32px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0.01em' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],
        'micro': ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.02em' }],
      },
      backgroundImage: {
        'gradient-sky': 'var(--gradient-sky)',
        'gradient-cloud': 'var(--gradient-cloud)',
        'gradient-orb': 'var(--gradient-orb)',
      },
      borderRadius: {
        lg: "24px",
        md: "16px",
        sm: "12px",
        xl: "24px",
        '2xl': "24px",
      },
      boxShadow: {
        'soft': '0 8px 32px rgba(14, 165, 233, 0.12)',
        'lift': '0 12px 40px rgba(14, 165, 233, 0.15)',
        'orb': '0 0 60px rgba(14, 165, 233, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
