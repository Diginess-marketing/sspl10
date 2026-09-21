export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
		'./src/pages/**/*.{js,ts,jsx,tsx}',
		'./src/components/**/*.{js,ts,jsx,tsx}',
		'./src/hooks/**/*.{js,ts,jsx,tsx}',
		'./src/lib/**/*.{js,ts,jsx,tsx}',
		'./src/types/**/*.{js,ts,jsx,tsx}',
		'./src/utils/**/*.{js,ts,jsx,tsx}',
	],
	// @ts-ignore
	safelist: [
		// Minimal safelist - only critical dynamic classes
		'bg-sport-orange',
		'text-sport-orange',
		'border-sport-orange',
		'border-sport-orange/20',
		'border-sport-orange/30',
		'border-sport-orange/50',
		'border-sport-orange/10',
		'border-sport-orange/25',
		'border-sport-orange/40',
		// Dialog centering classes
		'left-[50%]',
		'top-[50%]',
		'translate-x-[-50%]',
		'translate-y-[-50%]',
		// Hero image classes
		'object-cover',
		'object-center',
		'object-contain',
		'object-top',
		// Blue background for sections
		'bg-[#0A1929]',
		'bg-[#0B132B]',
		'text-white',
		'text-gray-300',
		// Gradient backgrounds for stats cards
		'bg-gradient-to-br',
		'from-[#F4A261]',
		'to-[#E76F51]',
		'from-[#5BC0BE]',
		'to-[#3A506B]',
		'from-[#E63946]',
		'to-[#9D0208]',
		'from-[#2A9D8F]',
		'to-[#1D3557]',
		'from-[#264653]',
	],
	blocklist: [
		// Block unused utilities to reduce CSS size
		'animate-cricket-bounce',
		'animate-stadium-wave',
		'animate-score-flash',
		'animate-wickets-fall',
		'animate-ball-spin',
		'animate-slow-spin',
		'animate-slow-spin-delayed',
		'animate-float-delayed',
		'animate-trophy-shine',
		'animate-marquee',
		'animate-marquee-gallery',
		'animate-marquee-gallery-reverse',
		'animate-hover-lift',
		'animate-click-bounce',
	],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
			'3xl': '1920px',
		},
		fontFamily: {
			'sans': ['Inter', 'system-ui', 'sans-serif'],
			'display': ['IBM Plex Sans Condensed', 'Roboto Condensed', 'sans-serif'],
			'heading': ['IBM Plex Sans Condensed', 'Roboto Condensed', 'sans-serif'],
			'body': ['Inter', 'system-ui', 'sans-serif'],
			'numbers': ['IBM Plex Sans Condensed', 'sans-serif'],
		},
		extend: {
			colors: {
				// SSPL Sport Pro Design System Tokens
				primary: {
					DEFAULT: '#0B132B', // midnightNavy
					light: '#1C2541', // stadiumBlue
					foreground: '#F8F9FA', // cloudWhite
				},
				secondary: {
					DEFAULT: '#E63946', // crimsonStrike
					foreground: '#F8F9FA',
					green: '#2A9D8F', // pitchGreen
				},
				accent: {
					DEFAULT: '#5BC0BE', // electricCyan
					foreground: '#0B132B',
				},
				neutral: {
					100: '#F8F9FA', // cloudWhite
					400: '#ADB5BD', // steelGray
					800: '#343A40', // charcoal
					900: '#0B132B', // matching primary
				},
				states: {
					success: '#2A9D8F',
					error: '#E63946',
					warning: '#F4A261',
					info: '#5BC0BE',
					disabled: '#6C757D',
				},

				// Map legacy variables to new system for compatibility during transition
				'sport-orange': '#CCFF00', // mapped to Tennis Ball Green
				'sport-teal': '#5BC0BE', // mapped to electricCyan
				'sport-dark': '#0B132B', // mapped to midnightNavy

				// Added Legacy CSS Migration Tokens
				'sspl-orange': '#CCFF00',
				'sspl-orange-hover': '#BBDD00',
				'sspl-tennis-ball-green': '#CCFF00',
				'sspl-tennis-ball-green-hover': '#BBDD00',
				'sspl-navy': '#001b69',
				'sspl-indigo': '#282974',
				'sspl-team-blue1': '#0074ba',
				'sspl-team-blue2': '#1d174f',
				'sspl-team-blue3': '#152549',

				// Standard UI mapping
				background: '#0B132B', // Default dark background
				foreground: '#F8F9FA', // Default light text
				card: '#1C2541', // stadiumBlue
				'card-foreground': '#F8F9FA',
				popover: '#1C2541',
				'popover-foreground': '#F8F9FA',
				border: '#343A40', // charcoal
				input: '#343A40',
				ring: '#5BC0BE', // electricCyan
			},
			boxShadow: {
				'card': '0 8px 24px rgba(0,0,0,0.15)',
				'hover': '0 12px 32px rgba(0,0,0,0.25)',
				'glow': '0 0 15px rgba(91, 192, 190, 0.4)', // Cyan glow
			},
			borderRadius: {
				'sm': '8px',
				'md': '12px',
				'lg': '16px',
				'xl': '24px',
			},
			spacing: {
				'gutter': '16px',
			},

			// Component specific colors
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))',
			},
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))',
			},
			sidebar: {
				DEFAULT: 'hsl(var(--sidebar-background))',
				foreground: 'hsl(var(--sidebar-foreground))',
				primary: 'hsl(var(--sidebar-primary))',
				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
				accent: 'hsl(var(--sidebar-accent))',
				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
				border: 'hsl(var(--sidebar-border))',
				ring: 'hsl(var(--sidebar-ring))',
			},

			// Design system colors
			'primary-text': '#1a1a1a',
			'brand-highlight': '#00A859',
			'interactive': '#0056b3',
		},
		// Typography system from design system
		fontSize: {
			// Display sizes
			'display-4xl': 'var(--text-display-4xl)',
			'display-3xl': 'var(--text-display-3xl)',
			'display-2xl': 'var(--text-display-2xl)',

			// Heading hierarchy
			'h1': 'var(--text-h1)',
			'h2': 'var(--text-h2)',
			'h3': 'var(--text-h3)',
			'h4': 'var(--text-h4)',
			'h5': 'var(--text-h5)',
			'h6': 'var(--text-h6)',

			// Body text
			'body-large': 'var(--text-body-large)',
			'body': 'var(--text-body)',
			'body-small': 'var(--text-body-small)',
			'caption': 'var(--text-caption)',

			// Mobile typography
			'mobile-display': 'var(--text-mobile-display)',
			'mobile-h1': 'var(--text-mobile-h1)',
			'mobile-h2': 'var(--text-mobile-h2)',
			'mobile-h3': 'var(--text-mobile-h3)',
			'mobile-body': 'var(--text-mobile-body)',
			'mobile-small': 'var(--text-mobile-small)',

			// Responsive clamp typography
			'body-clamp': 'clamp(0.875rem, 2vw, 1rem)',
			'subheading-clamp': 'clamp(1.125rem, 2.5vw, 1.25rem)',
			'headline-clamp': 'clamp(1.75rem, 3vw, 2rem)',
			'subheading': 'clamp(1.125rem, 2.5vw, 1.25rem)',
			'headline': 'clamp(1.75rem, 3vw, 2rem)',
		},
		fontWeight: {
			'thin': 'var(--font-weight-thin)',
			'light': 'var(--font-weight-light)',
			'normal': 'var(--font-weight-normal)',
			'medium': 'var(--font-weight-medium)',
			'semibold': 'var(--font-weight-semibold)',
			'bold': 'var(--font-weight-bold)',
			'extrabold': 'var(--font-weight-extrabold)',
			'black': 'var(--font-weight-black)',
		},
		lineHeight: {
			'tight': 'var(--line-height-tight)',
			'normal': 'var(--line-height-normal)',
			'relaxed': 'var(--line-height-relaxed)',
			'loose': 'var(--line-height-loose)',
		},
		letterSpacing: {
			'tight': 'var(--letter-spacing-tight)',
			'normal': 'var(--letter-spacing-normal)',
			'wide': 'var(--letter-spacing-wide)',
			'wider': 'var(--letter-spacing-wider)',
		},

		// Spacing system
		spacing: {
			'xs': 'var(--space-xs)',
			'sm': 'var(--space-sm)',
			'md': 'var(--space-md)',
			'lg': 'var(--space-lg)',
			'xl': 'var(--space-xl)',
			'2xl': 'var(--space-2xl)',
			'3xl': 'var(--space-3xl)',
			'4xl': 'var(--space-4xl)',
			'5xl': 'var(--space-5xl)',

			// Section spacing
			'section-hero': 'var(--section-hero)',
			'section-main': 'var(--section-main)',
			'section-compact': 'var(--section-compact)',
			'section-minimal': 'var(--section-minimal)',
			'section-hero-mobile': 'var(--section-hero-mobile)',
			'section-main-mobile': 'var(--section-main-mobile)',
			'section-compact-mobile': 'var(--section-compact-mobile)',
			'section-minimal-mobile': 'var(--section-minimal-mobile)',

			// Grid gutters
			'grid-gutter-desktop': 'var(--grid-gutter-desktop)',
			'grid-gutter-tablet': 'var(--grid-gutter-tablet)',
			'grid-gutter-mobile': 'var(--grid-gutter-mobile)',

			// 8-point grid spacing
			'grid-1': '8px',
			'grid-2': '16px',
			'grid-3': '24px',
			'grid-4': '32px',
		},

		// Container system
		maxWidth: {
			'container-sm': 'var(--container-sm)',
			'container-md': 'var(--container-md)',
			'container-lg': 'var(--container-lg)',
			'container-xl': 'var(--container-xl)',
			'container-2xl': 'var(--container-2xl)',
		},

		// Background gradients
		backgroundImage: {
			'gradient-primary': 'var(--gradient-primary)',
			'gradient-accent': 'var(--gradient-accent)',
			'gradient-hero': 'var(--gradient-hero)',
			'gradient-success': 'var(--gradient-success)',
			'gradient-warning': 'var(--gradient-warning)',
			'gradient-error': 'var(--gradient-error)',
			'gradient-info': 'var(--gradient-info)',
			'gradient-solid': '#ffffff',
			'gradient-solid-dark': '#ffffff',
			'gradient-energy': 'var(--gradient-energy)',
			'gradient-stadium': 'var(--gradient-stadium)',
			'gradient-sunset': 'var(--gradient-sunset)',
			'gradient-ocean': 'var(--gradient-ocean)',
			'gradient-green-blue': 'linear-gradient(to right, #00A859, #0056b3)',
			'gradient-cricket': 'linear-gradient(45deg, #00A859, #0056b3)',
			'pattern-dots': 'radial-gradient(circle, #00A859 1px, transparent 1px) 0 0 / 20px 20px',
			'pitch-lines': 'repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 2px, transparent 2px, transparent 20px)',
		},

		// Shadow system
		boxShadow: {
			'xs': 'var(--shadow-xs)',
			'sm': 'var(--shadow-sm)',
			'md': 'var(--shadow-md)',
			'lg': 'var(--shadow-lg)',
			'xl': 'var(--shadow-xl)',
			'2xl': 'var(--shadow-2xl)',
			'inner': 'var(--shadow-inner)',
			'elegant': 'var(--shadow-elegant)',
			'glow': 'var(--shadow-glow)',
			'card': 'var(--shadow-card)',
			'float': 'var(--shadow-float)',
			'inset': 'var(--shadow-inset)',
			'glass': 'var(--shadow-glass)',
			'sport': 'var(--shadow-sport)',
			'sport-lg': 'var(--shadow-sport-lg)',
			'accent': 'var(--shadow-accent)',
			'accent-lg': 'var(--shadow-accent-lg)',
			'stadium': 'var(--shadow-stadium)',
		},

		// Border radius system
		borderRadius: {
			'none': 'var(--radius-none)',
			'sm': 'var(--radius-sm)',
			'md': 'var(--radius-md)',
			'lg': 'var(--radius-lg)',
			'xl': 'var(--radius-xl)',
			'2xl': 'var(--radius-2xl)',
			'3xl': 'var(--radius-3xl)',
			'full': 'var(--radius-full)',
		},

		// Transition system
		transitionDuration: {
			'fast': 'var(--animation-fast)',
			'normal': 'var(--animation-normal)',
			'slow': 'var(--animation-slow)',
			'slower': 'var(--animation-slower)',
		},
		transitionTimingFunction: {
			'ease-in-out': 'var(--ease-in-out)',
			'ease-out': 'var(--ease-out)',
			'ease-in': 'var(--ease-in)',
			'ease-bounce': 'var(--ease-bounce)',
		},

		// Z-index scale
		zIndex: {
			'dropdown': 'var(--z-dropdown)',
			'sticky': 'var(--z-sticky)',
			'fixed': 'var(--z-fixed)',
			'modal-backdrop': 'var(--z-modal-backdrop)',
			'modal': 'var(--z-modal)',
			'popover': 'var(--z-popover)',
			'tooltip': 'var(--z-tooltip)',
			'toast': 'var(--z-toast)',
			'max': 'var(--z-max)',
		},
		keyframes: {
			// Component animations
			'accordion-down': {
				from: { height: '0', opacity: '0' },
				to: { height: 'var(--radix-accordion-content-height, auto)', opacity: '1' },
			},
			'accordion-up': {
				from: { height: 'var(--radix-accordion-content-height, auto)', opacity: '1' },
				to: { height: '0', opacity: '0' },
			},

			// Basic animations
			'fade-in': {
				'0%': { opacity: '0', transform: 'translateY(20px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' },
			},
			'fade-out': {
				'0%': { opacity: '1', transform: 'translateY(0)' },
				'100%': { opacity: '0', transform: 'translateY(20px)' },
			},
			'scale-in': {
				'0%': { transform: 'scale(0.95)', opacity: '0' },
				'100%': { transform: 'scale(1)', opacity: '1' },
			},
			'scale-out': {
				from: { transform: 'scale(1)', opacity: '1' },
				to: { transform: 'scale(0.95)', opacity: '0' },
			},
			'slide-in-right': {
				'0%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(0)' },
			},
			'slide-out-right': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(100%)' },
			},
			'slide-in': {
				'0%': { transform: 'translateX(50px)', opacity: '0' },
				'100%': { transform: 'translateX(0)', opacity: '1' },
			},
			'bounce-in': {
				'0%': { transform: 'scale(0.3) translateY(-50px) rotate(-180deg)', opacity: '0' },
				'50%': { transform: 'scale(1.05) translateY(-10px) rotate(-90deg)', opacity: '0.8' },
				'100%': { transform: 'scale(1) translateY(0) rotate(0deg)', opacity: '1' },
			},

			// Design system animations
			'spin': {
				'0%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(360deg)' },
			},
			'pulse': {
				'0%, 100%': { opacity: '1' },
				'50%': { opacity: '0.5' },
			},
			'bounce': {
				'0%, 100%': { transform: 'scale(1)' },
				'50%': { transform: 'scale(1.1)' },
			},
			'shimmer': {
				'0%': { backgroundPosition: '-200% 0' },
				'100%': { backgroundPosition: '200% 0' },
			},
			'pulse-glow': {
				'0%, 100%': { boxShadow: '0 0 20px hsl(var(--color-accent) / 0.5)' },
				'50%': { boxShadow: '0 0 30px hsl(var(--color-accent) / 0.8), 0 0 40px hsl(var(--color-accent) / 0.3)' },
			},

			// Cricket-themed animations
			'cricket-bounce': {
				'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
				'25%': { transform: 'translateY(-10px) rotate(5deg)' },
				'50%': { transform: 'translateY(-5px) rotate(0deg)' },
				'75%': { transform: 'translateY(-15px) rotate(-5deg)' },
			},
			'stadium-wave': {
				'0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
				'50%': { opacity: '0.8', transform: 'scale(1.1)' },
			},
			'score-flash': {
				'0%': { backgroundColor: 'hsl(var(--color-success))', transform: 'scale(1)' },
				'50%': { backgroundColor: 'hsl(var(--color-warning))', transform: 'scale(1.05)' },
				'100%': { backgroundColor: 'hsl(var(--color-success))', transform: 'scale(1)' },
			},
			'wickets-fall': {
				'0%': { transform: 'rotate(0deg) translateY(0)', opacity: '1' },
				'50%': { transform: 'rotate(45deg) translateY(20px)', opacity: '0.7' },
				'100%': { transform: 'rotate(90deg) translateY(50px)', opacity: '0' },
			},
			'ball-spin': {
				'0%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(360deg)' },
			},
			'slow-spin': {
				'0%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(360deg)' },
			},
			'slow-spin-delayed': {
				'0%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(-360deg)' },
			},
			'float': {
				'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
				'25%': { transform: 'translateY(-10px) rotate(5deg)' },
				'50%': { transform: 'translateY(-5px) rotate(0deg)' },
				'75%': { transform: 'translateY(-15px) rotate(-5deg)' },
			},
			'float-delayed': {
				'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
				'25%': { transform: 'translateY(-8px) rotate(-3deg)' },
				'50%': { transform: 'translateY(-12px) rotate(0deg)' },
				'75%': { transform: 'translateY(-6px) rotate(3deg)' },
			},
			'modal-appear': {
				'0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
				'100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
			},
			'pulse-gentle': {
				'0%, 100%': { transform: 'scale(1)', opacity: '1' },
				'50%': { transform: 'scale(1.02)', opacity: '0.9' },
			},
			'trophy-shine': {
				'0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 5px hsl(var(--color-warning) / 0.3))' },
				'50%': { filter: 'brightness(1.2) drop-shadow(0 0 20px hsl(var(--color-warning) / 0.6))' },
			},

			// Marquee animations
			'marquee': {
				'0%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(-100%)' },
			},
			'marquee-gallery': {
				'0%': { transform: 'translateX(0%)' },
				'100%': { transform: 'translateX(-50%)' },
			},
			'marquee-gallery-reverse': {
				'0%': { transform: 'translateX(-50%)' },
				'100%': { transform: 'translateX(0%)' },
			},
			'blob': {
				'0%': { transform: 'translate(0px, 0px) scale(1)' },
				'33%': { transform: 'translate(30px, -50px) scale(1.1)' },
				'66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
				'100%': { transform: 'translate(0px, 0px) scale(1)' },
			},
			'glitch': {
				'0%': { transform: 'translate(0)' },
				'20%': { transform: 'translate(-2px, 2px)' },
				'40%': { transform: 'translate(-2px, -2px)' },
				'60%': { transform: 'translate(2px, 2px)' },
				'80%': { transform: 'translate(2px, -2px)' },
				'100%': { transform: 'translate(0)' },
			},
			'scanline': {
				'0%': { transform: 'translateY(-100%)' },
				'100%': { transform: 'translateY(100%)' },
			},
			'neon-pulse': {
				'0%, 100%': { boxShadow: '0 0 5px #5BC0BE, 0 0 10px #5BC0BE' },
				'50%': { boxShadow: '0 0 20px #5BC0BE, 0 0 30px #5BC0BE' },
			},
		},
		animation: {
			// Component animations
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',

			// Basic animations
			'fade-in': 'fade-in var(--animation-normal) var(--ease-out)',
			'fade-out': 'fade-out var(--animation-normal) var(--ease-out)',
			'scale-in': 'scale-in var(--animation-fast) var(--ease-out)',
			'scale-out': 'scale-out var(--animation-fast) var(--ease-out)',
			'slide-in-right': 'slide-in-right var(--animation-normal) var(--ease-out)',
			'slide-out-right': 'slide-out-right var(--animation-normal) var(--ease-out)',
			'slide-in': 'slide-in var(--animation-normal) var(--ease-out)',
			'bounce-in': 'bounce-in 0.8s var(--ease-bounce)',

			// Design system animations
			'spin': 'spin var(--animation-spin-duration) linear infinite',
			'pulse': 'pulse var(--animation-pulse-duration) var(--ease-in-out)',
			'bounce': 'bounce var(--animation-bounce-duration) var(--ease-bounce)',
			'shimmer': 'shimmer 2s linear infinite',
			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',

			// Cricket-themed animations
			'cricket-bounce': 'cricket-bounce 1.5s ease-in-out infinite',
			'stadium-wave': 'stadium-wave 2s ease-in-out infinite',
			'score-flash': 'score-flash 0.5s ease-out',
			'wickets-fall': 'wickets-fall 0.8s ease-out',
			'ball-spin': 'ball-spin 2s linear infinite',
			'slow-spin': 'slow-spin 8s linear infinite',
			'slow-spin-delayed': 'slow-spin-delayed 10s linear infinite',
			'float': 'float 3s ease-in-out infinite',
			'float-delayed': 'float-delayed 4s ease-in-out infinite 1s',
			'modal-appear': 'modal-appear 0.6s ease-out',
			'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
			'trophy-shine': 'trophy-shine 3s ease-in-out infinite',

			// Marquee animations
			'marquee': 'marquee var(--marquee-duration) linear infinite',
			'marquee-gallery': 'marquee-gallery 50s linear infinite',
			'marquee-gallery-reverse': 'marquee-gallery-reverse 60s linear infinite',

			// Combined animations
			'enter': 'fade-in var(--animation-normal) var(--ease-out), scale-in var(--animation-fast) var(--ease-out)',
			'exit': 'fade-out var(--animation-normal) var(--ease-out), scale-out var(--animation-fast) var(--ease-out)',

			// Hover animations
			'hover-lift': 'transform var(--animation-normal) var(--ease-in-out)',
			'click-bounce': 'transform var(--animation-click-duration) var(--ease-out)',
			'blob': 'blob 7s infinite',
			'float-slow': 'float 6s ease-in-out infinite',
			'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
			'glitch': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
			'scanline': 'scanline 4s linear infinite',
			'neon-pulse': 'neon-pulse 2s infinite',
		},
	},

	plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
	// Performance optimizations - keep most plugins enabled for layout safety
	corePlugins: {
		// Only disable truly unused features
		fontVariantNumeric: false,
		touchAction: false,
		scrollSnapType: false,
	},
	// Enable JIT mode for better performance
	mode: 'jit',
	// Restrict variants to only what's used
	future: {
		hoverOnlyWhenSupported: true,
	},
};
