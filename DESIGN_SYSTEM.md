# 🎨 Loyalty App Design System

## Color Palettes

### Palette 1 - Green Nature Theme
```css
#191A19  /* Very Dark Gray - Almost Black */
#1E5128  /* Dark Forest Green */
#4E9F3D  /* Bright Green */
#D8E9A8  /* Light Lime Green */
```

### Palette 2 - Deep Teal Theme
```css
#0F0F0F  /* Deep Black */
#232D3F  /* Dark Blue-Gray */
#005B41  /* Dark Teal */
#008170  /* Medium Teal */
```

---

## 🎨 Color Strategy

### Light Mode Strategy
**Custom designed for optimal daylight viewing:**
- Fresh, clean aesthetic with professional green tones
- High contrast for excellent readability
- Soft shadows and subtle backgrounds
- Inviting and trustworthy feel
- Perfect for extended use in bright environments

### Dark Mode Strategy
**Mixed both palettes for premium dark experience:**

| Element | Color Source | Purpose |
|---------|--------------|---------|
| Base Background | `#0F0F0F` (P2) | Deepest black for OLED screens |
| Card Background | `#191A19` (P1) | Slightly elevated surfaces |
| Elevated Elements | `#232D3F` (P2) | Blue-gray for hierarchy |
| Primary Brand | `#008170` (P2) | Teal for main actions |
| Secondary Brand | `#4E9F3D` (P1) | Green for accents |
| Success States | `#4E9F3D` (P1) | Bright green visibility |
| Gradients | P1 + P2 Mix | Smooth teal-to-green transitions |

**Result:** A sophisticated dark mode that combines the depth of blacks/teals with the vibrant energy of greens.

---

## 🌓 Theme Assignments

### Light Mode (Custom Clean Design)
```css
:root[data-theme="light"] {
  /* Backgrounds - Clean whites and soft grays */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F7F9FC;       /* Soft blue-gray background */
  --bg-tertiary: #E8F5E9;        /* Very light green tint */
  --bg-elevated: #FFFFFF;
  --bg-card: #FFFFFF;

  /* Text - Excellent readability */
  --text-primary: #1A202C;       /* Almost black with slight warmth */
  --text-secondary: #4A5568;     /* Medium gray */
  --text-tertiary: #A0AEC0;      /* Light gray */
  --text-inverse: #FFFFFF;
  --text-on-brand: #FFFFFF;

  /* Brand - Fresh green with teal accents */
  --brand-primary: #2D9C54;      /* Fresh medium green */
  --brand-secondary: #22C55E;    /* Bright vibrant green */
  --brand-accent: #10B981;       /* Emerald accent */
  --brand-hover: #247A43;        /* Darker green for hover */

  /* Brand gradients for special elements */
  --gradient-primary: linear-gradient(135deg, #2D9C54 0%, #22C55E 100%);
  --gradient-subtle: linear-gradient(135deg, #E8F5E9 0%, #F0FDF4 100%);

  /* Borders & Dividers - Subtle and clean */
  --border-light: #E2E8F0;
  --border-medium: #CBD5E0;
  --border-dark: #A0AEC0;

  /* Shadows - Soft and modern */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15);
  --shadow-colored: 0 8px 16px rgba(45, 156, 84, 0.2);

  /* Semantic Colors - Vibrant and clear */
  --success: #22C55E;
  --success-bg: #D1FAE5;
  --success-border: #86EFAC;
  --error: #EF4444;
  --error-bg: #FEE2E2;
  --error-border: #FCA5A5;
  --warning: #F59E0B;
  --warning-bg: #FEF3C7;
  --warning-border: #FCD34D;
  --info: #3B82F6;
  --info-bg: #DBEAFE;
  --info-border: #93C5FD;
}
```

### Dark Mode (Mixed Palette 1 + 2 - Premium Dark)
```css
:root[data-theme="dark"] {
  /* Backgrounds - Deep and rich using both palettes */
  --bg-primary: #0F0F0F;         /* P2: Deep black base */
  --bg-secondary: #191A19;       /* P1: Very dark gray for cards */
  --bg-tertiary: #232D3F;        /* P2: Dark blue-gray for elevated elements */
  --bg-elevated: #1E1E1E;        /* Slightly lighter than primary */
  --bg-card: #191A19;            /* P1: Consistent card background */

  /* Text - High contrast and readable */
  --text-primary: #F7FAFC;       /* Near white */
  --text-secondary: #CBD5E0;     /* Light gray */
  --text-tertiary: #718096;      /* Medium gray */
  --text-inverse: #0F0F0F;
  --text-on-brand: #FFFFFF;

  /* Brand - Mixed teal and green from both palettes */
  --brand-primary: #008170;      /* P2: Medium teal primary */
  --brand-secondary: #4E9F3D;    /* P1: Bright green secondary */
  --brand-accent: #00A896;       /* Lighter teal for accents */
  --brand-hover: #00997B;        /* Slightly lighter teal for hover */

  /* Brand gradients - Mixing both palettes */
  --gradient-primary: linear-gradient(135deg, #005B41 0%, #008170 50%, #4E9F3D 100%);
  --gradient-subtle: linear-gradient(135deg, #232D3F 0%, #1E5128 100%);

  /* Borders & Dividers - Subtle in dark */
  --border-light: #2D3748;
  --border-medium: #4A5568;
  --border-dark: #718096;

  /* Shadows - Deep and dramatic */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.6);
  --shadow-lg: 0 10px 24px rgba(0, 0, 0, 0.7);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.8);
  --shadow-colored: 0 8px 16px rgba(0, 129, 112, 0.4);

  /* Semantic Colors - Bright and visible in dark */
  --success: #4E9F3D;            /* P1: Bright green for success */
  --success-bg: #1E512833;
  --success-border: #4E9F3D66;
  --error: #FF6B6B;
  --error-bg: #FF6B6B1A;
  --error-border: #FF6B6B66;
  --warning: #FFD93D;
  --warning-bg: #FFD93D1A;
  --warning-border: #FFD93D66;
  --info: #008170;               /* P2: Teal for info */
  --info-bg: #00817033;
  --info-border: #00817066;

  /* Special dark mode enhancements */
  --glow-teal: 0 0 20px rgba(0, 129, 112, 0.3);
  --glow-green: 0 0 20px rgba(78, 159, 61, 0.3);
}
```

---

## 📐 Spacing & Sizing

```css
/* Spacing Scale */
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;

/* Border Radius */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;

/* Max Widths */
--max-width-sm: 640px;
--max-width-md: 768px;
--max-width-lg: 1024px;
--max-width-xl: 1280px;
```

---

## 🔤 Typography

```css
/* Font Families */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
--font-mono: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## 🎯 Component Styles

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--brand-primary);
  color: var(--text-on-brand);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--brand-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--brand-primary);
  padding: var(--space-3) var(--space-6);
  border: 2px solid var(--brand-primary);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--brand-primary);
  color: var(--text-on-brand);
}

/* Icon Button */
.btn-icon {
  background: transparent;
  border: none;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--brand-primary);
}
```

### Cards
```css
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-compact {
  padding: var(--space-4);
}

.card-header {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}
```

### Form Inputs
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-secondary);
  border: 2px solid var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: var(--font-sans);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--brand-primary);
  background: var(--bg-primary);
  box-shadow: 0 0 0 4px var(--brand-accent);
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input-error {
  border-color: var(--error);
}

.input-error:focus {
  box-shadow: 0 0 0 4px var(--error-bg);
}
```

---

## 📱 User App Layouts

### Navigation Bar (Bottom)
```
Height: 70px
Background: var(--bg-elevated)
Border-top: 1px solid var(--border-light)
Shadow: var(--shadow-lg) (reversed - shadow on top)

Items:
- Icon: 24px
- Label: var(--text-xs)
- Active state: var(--brand-primary)
- Inactive state: var(--text-tertiary)
- Active indicator: 3px rounded line above icon
```

### Home Screen
```
Structure:
1. Header (fixed)
   - Points Badge (large, prominent)
   - Theme Toggle (top-right)

2. Quick Stats Row
   - Total Scans
   - Favorite Stores
   - This Month Points

3. Recent Activity Section
   - Last 5 transactions
   - Card-based layout

4. CTA Button
   - "Scan Receipt" - full-width, sticky at bottom
```

### Scan Screen
```
- Full-screen camera view
- Overlay: rgba(0,0,0,0.5)
- Scanner Frame:
  * Size: 280x280px
  * Border: 3px dashed var(--brand-accent)
  * Corners: Animated brackets (12px L-shapes)
  * Animation: Breathing pulse (scale 1 to 1.05)

- Instructions: Top overlay
- Flash Toggle: Top-right icon button
- Gallery Upload: Bottom-left icon button
```

---

## 💼 Admin Dashboard Layouts

### Sidebar Navigation
```
Width: 260px (expanded) / 70px (collapsed)
Background: var(--bg-elevated)
Border-right: 1px solid var(--border-light)

Header:
- Logo + App Name (hidden when collapsed)
- Collapse Toggle

Menu Items:
- Icon (24px) + Label
- Hover: var(--bg-tertiary)
- Active: var(--brand-primary) background + white text
- Padding: var(--space-3) var(--space-4)
- Border-radius: var(--radius-md)
- Margin: var(--space-1) var(--space-3)
```

### Dashboard Cards (Stats)
```
Grid: 4 columns on desktop, 2 on tablet, 1 on mobile
Gap: var(--space-4)

Card Structure:
- Icon (top-left) - 40px, colored background circle
- Value (large) - var(--text-3xl), var(--font-bold)
- Label (below value) - var(--text-sm)
- Trend indicator (optional) - +/- percentage in green/red
```

### Data Tables
```
Header:
- Background: var(--bg-tertiary)
- Font: var(--font-semibold)
- Padding: var(--space-3) var(--space-4)

Rows:
- Hover: var(--bg-secondary)
- Padding: var(--space-4)
- Border-bottom: 1px solid var(--border-light)

Actions Column:
- Icon buttons (Edit, Delete)
- Spacing: var(--space-2) between buttons
```

---

## ✨ Animations & Transitions

```css
/* Standard Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## 🎯 Special Components

### Points Badge
```css
.points-badge {
  background: var(--gradient-primary);
  color: var(--text-on-brand);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-full);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-colored);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
  overflow: hidden;
}

/* Dark mode special glow effect */
:root[data-theme="dark"] .points-badge {
  box-shadow: var(--shadow-colored), var(--glow-teal);
}

.points-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmerBadge 3s infinite;
}

@keyframes shimmerBadge {
  0% { left: -100%; }
  100% { left: 100%; }
}

.points-badge-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}
```

### Toast Notifications
```css
.toast {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  min-width: 300px;
  max-width: 500px;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--bg-elevated);
  box-shadow: var(--shadow-xl);
  border-left: 4px solid var(--brand-primary);
  animation: slideInRight 0.3s ease;
  z-index: 9999;
}

.toast-success {
  border-left-color: var(--success);
}

.toast-error {
  border-left-color: var(--error);
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Loading Skeleton
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}
```

---

## 📋 Implementation Plan

### Phase 1: Theme Infrastructure (Day 1-2)
- [ ] Create `src/styles/variables.css` with all CSS custom properties
- [ ] Create `src/styles/global.css` with base styles
- [ ] Create `src/contexts/ThemeContext.jsx`
- [ ] Create `src/components/ThemeToggle.jsx`
- [ ] Add localStorage persistence
- [ ] Test theme switching

### Phase 2: Component Library (Day 3-5)
- [ ] Create `src/components/ui/Button.jsx`
- [ ] Create `src/components/ui/Card.jsx`
- [ ] Create `src/components/ui/Input.jsx`
- [ ] Create `src/components/ui/Badge.jsx`
- [ ] Create `src/components/ui/Toast.jsx`
- [ ] Create `src/components/ui/Skeleton.jsx`
- [ ] Create `src/components/ui/Modal.jsx`

### Phase 3: User App Redesign (Day 6-10)
- [ ] Redesign Navigation (BottomNav.jsx)
- [ ] Redesign HomePage with new layout
- [ ] Redesign ScanPage with new scanner UI
- [ ] Redesign ScanResultsPage
- [ ] Redesign HistoryPage with new cards
- [ ] Redesign StoresPage
- [ ] Redesign ProfilePage

### Phase 4: Admin Dashboard Redesign (Day 11-15)
- [ ] Create new Sidebar component
- [ ] Redesign DashboardPage with stat cards
- [ ] Redesign ProductsPage table
- [ ] Redesign ReviewsPage
- [ ] Update charts styling (Recharts theme)
- [ ] Redesign StoresPage
- [ ] Redesign UsersPage
- [ ] Redesign AnalyticsPage

### Phase 5: Polish & Refinement (Day 16-18)
- [ ] Add all animations
- [ ] Implement loading states
- [ ] Add micro-interactions
- [ ] Test responsive layouts
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## 🎨 Design Philosophy

1. **Modern & Clean**: Minimalist approach with ample whitespace
2. **Color Psychology**: Green = growth, rewards, positive actions
3. **Dark Mode First**: Both themes are equally polished
4. **Mobile-First**: Designed for mobile, scales to desktop
5. **Accessible**: High contrast ratios, keyboard navigation, screen reader support
6. **Performant**: Smooth animations, optimized rendering
7. **Consistent**: Same patterns and components throughout

---

## 📸 Mockup Notes

### User App Inspiration
- **Style**: Modern fintech (Revolut, Cash App)
- **Feel**: Clean, trustworthy, rewarding
- **Focus**: Points display, easy scanning

### Admin Dashboard Inspiration
- **Style**: Modern analytics (Stripe, Mixpanel)
- **Feel**: Professional, data-rich, efficient
- **Focus**: Quick insights, easy management

---

## ✅ Ready to Implement?

**Is this design system approved?** If yes, we'll proceed with:
1. Setting up the theme infrastructure
2. Creating the reusable component library
3. Applying the redesign to User App
4. Applying the redesign to Admin Dashboard

**Any changes needed?** Let me know and I'll adjust the design system!
