# Blood Sugar Monitoring System - Design Guidelines

## Design Approach
**Medical Professional Interface Design** - Drawing inspiration from modern healthcare platforms like Epic MyChart, Zocdoc, and clinical dashboards. Clean, trustworthy, data-focused with emphasis on readability and clarity.

## Core Design Principles
1. **Clinical Trust**: Professional aesthetic that instills confidence in medical data
2. **Data Clarity**: Information hierarchy that prioritizes critical health metrics
3. **Accessible by Default**: WCAG AA compliance minimum for medical applications
4. **Calm Interface**: Reduced cognitive load through generous whitespace and clear structure

## Typography System

**Font Family**: 
- Primary: `font-sans` (Inter or system fonts via Tailwind)
- Monospace: `font-mono` for precise numerical data (blood sugar readings, timestamps)

**Scale**:
- Page Headers: `text-3xl font-semibold` (Dashboard titles)
- Section Headers: `text-xl font-semibold` (Card titles, form sections)
- Metric Display: `text-4xl font-bold` (Large numerical stats)
- Body Text: `text-base` (General content, form labels)
- Small Text: `text-sm text-gray-600` (Timestamps, secondary info)
- Data Values: `font-mono text-lg` (Blood sugar readings)

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of `4, 6, 8, 12, 16` for consistency
- Component padding: `p-6` or `p-8`
- Section gaps: `gap-6` or `gap-8`
- Page margins: `px-4 md:px-8 lg:px-12`
- Card spacing: `space-y-6`

**Grid System**:
- Dashboard Layout: Sidebar (256px fixed) + Main content (fluid)
- Stats Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Patient Lists: Single column tables with alternating row backgrounds
- Forms: Single column max-width `max-w-2xl` for readability

## Component Library

### Navigation
**Sidebar** (Dashboards):
- Fixed left sidebar, full height
- Logo/brand at top with `h-16`
- Navigation items with `px-6 py-3`
- Active state: subtle background tint
- Icon + label horizontal layout with `gap-3`

**Top Navbar** (Landing/Public):
- Horizontal, `h-16`, max-width container
- Logo left, actions right
- Transparent on landing hero, solid on scroll

### Cards & Containers
**Stat Cards**:
- `bg-white rounded-lg shadow-sm border border-gray-100`
- Icon in colored circle (teal/blue tint) at top left
- Large metric value with `text-4xl font-bold`
- Label below in `text-sm text-gray-600`
- Padding: `p-6`

**Data Cards** (Patient info, readings):
- Same base styling as stat cards
- Content organized with `space-y-4`
- Dividers between sections using `border-t`

### Forms & Inputs
**Input Fields**:
- `rounded-lg border border-gray-300`
- Height: `h-12` for text inputs
- Padding: `px-4`
- Focus state: `focus:ring-2 focus:ring-teal-500 focus:border-teal-500`
- Labels: `text-sm font-medium mb-2 block`

**Buttons**:
- Primary: `rounded-lg px-6 py-3 font-medium` (teal background)
- Secondary: Same size, lighter background or outline
- Icon buttons: `w-10 h-10 rounded-lg` centered icon

**Form Layout**:
- Vertical stack with `space-y-6`
- Multi-column for related fields: `grid-cols-2 gap-4`
- Submit actions at bottom with `pt-6 border-t`

### Data Visualization
**Charts** (Recharts):
- Container: `bg-white rounded-lg shadow-sm p-6`
- Minimum height: `h-80` for readability
- Responsive width: `w-full`
- Grid lines: subtle gray
- Data points: teal/blue accent colors
- Tooltips: white background with shadow

**Tables**:
- Header: `bg-gray-50` with `font-semibold text-sm`
- Rows: `border-b` with alternating backgrounds
- Cell padding: `px-6 py-4`
- Hover state: subtle background change
- Action buttons in last column

### Status Indicators
**Category Badges** (Normal/Borderline/Abnormal):
- `rounded-full px-3 py-1 text-xs font-medium`
- Normal: green tint background
- Borderline: yellow/amber tint
- Abnormal: red tint
- Never use full saturation colors in medical context

### Recommendations Display
**Recommendation Cards**:
- Source indicator (AI vs Specialist) as badge at top
- Icon (lightbulb for AI, user-doctor for specialist)
- Advice text in `text-base` with adequate line height
- Timestamp in `text-sm text-gray-500`
- Contained in white card with `space-y-3`

## Page-Specific Layouts

### Landing Page
**Hero Section**:
- Full viewport height on desktop `min-h-screen`
- Medical-themed background image (clinical setting, technology, or abstract data visualization)
- Content overlay with semi-transparent white panel using backdrop blur
- Headline `text-5xl font-bold` 
- Subheadline `text-xl text-gray-600`
- CTA buttons with `gap-4` horizontal layout
- Buttons over hero use `backdrop-blur-md bg-white/80` treatment

**Feature Sections**:
- 3-column grid on desktop showing key features
- Icon + title + description pattern
- Each feature in card format with `p-8`
- Section padding: `py-16`

### Patient Dashboard
**Layout Structure**:
1. Stats cards row at top (3 columns)
2. Chart section below (full width card)
3. Two-column layout: Log form (left) + Recommendations (right)
4. All sections with consistent `gap-6`

### Specialist Dashboard
**Patient List**:
- Filter controls at top with `gap-4` layout
- Table with patient info, last reading, status
- Click row to expand/navigate to detail view
- Detail view: Patient header + tabs (History, Charts, Alerts)

### Staff Dashboard
**Configuration Cards**:
- Threshold ranges in visual slider representation
- Form inputs with current values pre-filled
- Save button prominent at bottom

### Admin Dashboard
**Split Layout**:
- User creation form: Left panel, `max-w-xl`
- Reports center: Right panel, wider
- Both sections in cards with clear headers

## Images
**Hero Image**: Professional medical technology or clinical monitoring theme - modern, clean, trust-inspiring. Show glucose monitoring devices, healthcare professionals, or abstract data visualization. Image should be high-quality, slightly desaturated to maintain professional tone.

**Placement**: Full-width hero section background on landing page only. All dashboard pages are data-focused without decorative imagery.

## Animations
Minimal, purposeful only:
- Page transitions: subtle fade
- Loading states: spinner for data fetching
- Chart animations: gentle ease-in on render
- No hover animations except subtle scale on clickable cards

## Accessibility Requirements
- All form inputs with explicit labels
- Color not sole indicator of status (use icons + text)
- Sufficient contrast ratios (4.5:1 minimum)
- Focus indicators on all interactive elements
- Table headers properly associated
- Chart data available in table format alternative