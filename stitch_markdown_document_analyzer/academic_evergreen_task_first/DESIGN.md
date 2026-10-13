---
name: Academic Evergreen Task-First
colors:
  surface: '#F6F8F7'
  surface-dim: '#E5EBE8'
  surface-bright: '#FFFFFF'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#F6F8F7'
  surface-container: '#E8F2EE'
  surface-container-high: '#E5EBE8'
  surface-container-highest: '#D8E0E5'
  on-surface: '#1F2933'
  on-surface-variant: '#5F6B76'
  inverse-surface: '#1F2933'
  inverse-on-surface: '#FFFFFF'
  outline: '#5F6B76'
  outline-variant: '#D8E0E5'
  surface-tint: '#2F7662'
  primary: '#245C4D'
  on-primary: '#ffffff'
  primary-container: '#E8F2EE'
  on-primary-container: '#173B32'
  inverse-primary: '#2F7662'
  secondary: '#173B32'
  on-secondary: '#ffffff'
  secondary-container: '#E8F2EE'
  on-secondary-container: '#173B32'
  tertiary: '#2F7662'
  on-tertiary: '#ffffff'
  tertiary-container: '#E8F2EE'
  on-tertiary-container: '#173B32'
  error: '#B42318'
  on-error: '#ffffff'
  error-container: '#FEE2E2'
  on-error-container: '#991B1B'
  primary-fixed: '#E8F2EE'
  primary-fixed-dim: '#2F7662'
  on-primary-fixed: '#173B32'
  on-primary-fixed-variant: '#245C4D'
  secondary-fixed: '#E8F2EE'
  secondary-fixed-dim: '#2F7662'
  on-secondary-fixed: '#173B32'
  on-secondary-fixed-variant: '#245C4D'
  tertiary-fixed: '#E8F2EE'
  tertiary-fixed-dim: '#2F7662'
  on-tertiary-fixed: '#173B32'
  on-tertiary-fixed-variant: '#245C4D'
  background: '#F6F8F7'
  on-background: '#1F2933'
  surface-variant: '#E5EBE8'
  brand-surface-tint: '#E8F2EE'
  accent-warm: '#B7791F'
  accent-warm-surface: '#FFF4D6'
  text-main: '#1F2933'
  border-subtle: '#D8E0E5'
  surface-white: '#FFFFFF'
  page-canvas: '#F6F8F7'
  status-info: '#1E40AF'
  status-info-surface: '#DBEAFE'
  status-warning: '#854D0E'
  status-warning-surface: '#FEF3C7'
  status-success: '#166534'
  status-success-surface: '#DCFCE7'
  status-danger: '#991B1B'
  status-danger-surface: '#FEE2E2'
  status-muted: '#374151'
  status-muted-surface: '#E5E7EB'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-lg-medium:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a formal, authoritative, yet approachable campus administrative experience. Designed specifically for university facility scheduling, reservations, and management, the interface prioritizes task completion, spatial readability, and procedural transparency over decorative flourishes. 

The aesthetic is anchored in **Modern Institutional Minimalism**:
- **Tone**: Dependable, disciplined, welcoming, and rigorously structured.
- **Visual Stance**: High-clarity layouts utilizing deep collegiate greens, generous calm negative spaces, crisp structural boundaries, and clear typographical hierarchies.
- **Philosophy**: Non-destructive interactions and immediate scannability. Content is presented with clear states, explicit guidance, and zero reliance on ambiguous iconography or raw technical jargon.

## Colors

The color system is built upon collegiate forest greens complemented by muted slate neutrals and functional semantic state tokens.

### Palette Architecture
- **Primary (`#245C4D`)**: Primary action driver used for buttons, interactive controls, active pagination, and navigation highlights.
- **Secondary (`#173B32`)**: Dense institutional anchor for prominent headings, administrative sidebars, and high-contrast structural landmarks.
- **Tertiary (`#2F7662`)**: Mid-tone interaction tone for active icon strokes, subtle active states, and hovered structural items.
- **Neutral (`#5F6B76`)**: Baseline utility tone for secondary body text and metadata; borders use `#D8E0E5`.
- **Page Canvas (`#F6F8F7`) & Surface (`#FFFFFF`)**: Crisp separation between backdrop canvas and actionable elevated cards or sheets.

### Status System & Semantic Rules
Color must never serve as the sole conveyor of status. All badges pair background fills with high-contrast text and a corresponding outline icon:
- **Terkirim (`SUBMITTED`)**: Warning (`status-warning-surface` / `status-warning`).
- **Sedang diperiksa (`UNDER_REVIEW`)**: Informative Blue (`status-info-surface` / `status-info`).
- **Perlu perbaikan (`REVISION_REQUESTED`)**: Warning Amber (`status-warning-surface` / `status-warning`).
- **Menunggu persetujuan (`AWAITING_APPROVAL`)**: Warning Amber (`status-warning-surface` / `status-warning`).
- **Disetujui menunggu pembayaran (`AWAITING_PAYMENT`)**: Warning or info; use the same shared status tokens and display the payment deadline only when officially provided.
- **Disetujui (`CONFIRMED`)**: Forest Green (`status-success-surface` / `status-success`).
- **Ditolak (`REJECTED`)**: Crimson Red (`status-danger-surface` / `status-danger`).
- **Dibatalkan / Kedaluwarsa / Selesai (`CANCELLED`, `EXPIRED`, `COMPLETED`)**: Neutral Slate (`status-muted-surface` / `status-muted`).

## Typography

The typographic system utilizes **Inter** across all roles to ensure structural consistency, dense information scanning, and high legibility across screens of varying density.

### Hierarchy & Guidelines
- **Headlines (`headline-xl`, `headline-lg`)**: Reserved for dashboard greetings, primary venue names, and page-level section triggers. Employs tight negative letter spacing (`-0.01em` to `-0.02em`) for crisp presence.
- **Section Headers (`headline-md`, `headline-sm`)**: Anchors modal titles, summary cards, and administrative drawer titles.
- **Body (`body-lg`, `body-sm`)**: Set at standard line heights (1.4–1.5x) to maintain effortless reading for multi-line policy notes, booking terms, and campus notices.
- **Labels & Badges (`label-md`, `label-sm`)**: Medium to Semi-bold weights that maintain legibility at low point sizes inside data tables, chips, and badge components.

## Layout & Spacing

A strict **4px/8px incremental base unit** governs all spacing, horizontal margins, and vertical stacking.

### Grid & Responsiveness
- **Max Container Width**: Centered `1200px` for catalog, scheduling, and standard booking views.
- **Desktop Grid (≥ 1024px)**: 12-column layout with `24px` (`1.5rem`) gutters. Venue catalog items arrange into 3 symmetrical columns. Operational review interfaces switch to an asymmetric 2-column layout: main reservation dossier (8 columns) pinned beside the decision review sidebar (4 columns).
- **Tablet Grid (768px – 1023px)**: 8-column system with `20px` gutters. Venue catalog reflows to 2 columns.
- **Mobile Grid (< 768px)**: 4-column system with `16px` (`1rem`) gutters and `16px` canvas margins. Venue catalog collapses into a single-column stack.
- **Touch Ergonomics**: All interactive click/touch targets strictly enforce a minimum dimension of `44px` in height and width.

## Elevation & Depth

Visual hierarchy relies on **clean surface separation and low-contrast outlines** rather than heavy drop shadows:

- **Surface Level 0 (Canvas)**: Background viewport tinted in `#F6F8F7`.
- **Surface Level 1 (Panels & Cards)**: Base white `#FFFFFF` bounded by a crisp 1px hairline border (`#D8E0E5`). Elevation is bolstered by a soft, ambient, low-contrast shadow: `0 1px 3px 0 rgba(31, 41, 51, 0.04), 0 1px 2px -1px rgba(31, 41, 51, 0.04)`.
- **Surface Level 2 (Hover & Focus States)**: Slightly lifted cards and dropdown menus: `0 4px 6px -1px rgba(31, 41, 51, 0.07), 0 2px 4px -2px rgba(31, 41, 51, 0.05)`.
- **Surface Level 3 (Dialogs, Overlays & Sheets)**: Modals and mobile drawers: `0 20px 25px -5px rgba(31, 41, 51, 0.1), 0 8px 10px -6px rgba(31, 41, 51, 0.08)`.
- **Focus Indicators**: Focused inputs, links, and buttons display an accessible 2px solid ring in `#2F7662` offset by 2px white space.

## Shapes

The design system employs a structured, balanced shape language:

- **Inputs, Buttons, and Selectors**: Standardized at `8px` (`0.5rem`) corner radius to deliver balanced, neat interactive touchpoints.
- **Cards & Primary Modules**: Formatted at `10px`–`12px` (`0.625rem`–`0.75rem`) corner radius for modern separation without appearing overly playful or rounded.
- **Pill Badges**: Status tokens and tag elements use full radius (`9999px`) to immediately distinguish administrative metadata from clickable structural components.

## Components

### Buttons
- **Primary**: Background `#245C4D`, text `#FFFFFF`, minimum height `44px`, padding `0 20px`, corner radius `8px`, weight `600`. Hover state darkens to `#173B32`.
- **Secondary / Outline**: Background transparent, border `1px solid #D8E0E5`, text `#1F2933`, minimum height `44px`. Hover state applies `#E8F2EE` tint with `#245C4D` text.
- **Ghost**: Background transparent, text `#245C4D`, hover background `#E8F2EE`.

### Badges & Status Indicators
- **Structure**: Inline-flex, height `26px`, padding `0 10px`, pill-shaped (`9999px`), weight `600`, font size `12px`.
- **Rule**: Must include both an outline icon (`14px`) and the localized Indonesian status label (e.g., `Sedang diperiksa`, `Disetujui`).
- **Palette Pairing**:
  - `Disetujui`: `#DEF7EC` bg / `#0E6245` text.
  - `Sedang diperiksa` / `Disetujui menunggu pembayaran`: `#EBF5FF` bg / `#1E429F` text.
  - `Terkirim` / `Perlu perbaikan` / `Menunggu persetujuan`: `#FEF08A` bg / `#8F4B0E` text.
  - `Ditolak`: `#FDE8E8` bg / `#9B1C1C` text.
  - `Dibatalkan` / `Kedaluwarsa` / `Selesai`: `#F3F4F6` bg / `#4B5563` text.

### Form Inputs & Search Fields
- **Height**: Minimum `44px`.
- **Style**: Background `#FFFFFF`, border `1px solid #D8E0E5`, radius `8px`, horizontal padding `14px`, text `#1F2933` (`16px`). Placeholder colored in `#5F6B76`.
- **Focus**: Border `#2F7662` with a 2px outer focus halo.
- **Validation**: Error states show `#9B1C1C` border with inline helper text and error icon below.

### Cards (Venue & Dossier)
- **Style**: Background `#FFFFFF`, border `1px solid #D8E0E5`, radius `12px`, padding `20px` to `24px`.
- **Media**: Venue images maintain a consistent 16:9 or 4:3 aspect ratio, pinned flush at the card's top edge.
- **Interactive State**: Border transitions to `#2F7662` on hover with elevation transition to Level 2.

### Checkboxes & Radio Buttons
- **Dimensions**: Target area padded to `44px` touch target, indicator box `20px × 20px`, radius `4px` (checkbox) or circular (radio).
- **Checked State**: Fill `#245C4D`, icon white checkmark/dot.
