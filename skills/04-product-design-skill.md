# Web App Design & Development Best Practices

---

## 🧱 Architecture & Routing

- Use **React Router** for apps with multiple views/pages (dashboard, platform, site, tool)
- Create a shared **Layout component** for navigation, header, and footer
- Organize code:
  - `/pages` → routes
  - `/components` → reusable UI
  - `/data` → mock data
- Use **TypeScript interfaces** for type safety

---

## 🎨 Visual Design

### Color System
- Choose **1–2 primary colors** aligned with purpose:
  - Blue → professional / trust
  - Green → finance / health
  - Purple → creative

### Layout Patterns
- **Hero sections** for landing pages with clear value proposition
- **Card-based layouts** for browseable content
- **Sidebar + main content** for filtering/navigation
- **Sticky headers** for persistent navigation

### Spacing
- Use generous white space
- Maintain consistent padding (`p-4`, `p-6`, `p-8`)

### Typography
- Maintain clear hierarchy using **font-weight**
  - Prefer `semibold` for headings over drastic font-size changes

---

## 🧭 User Experience

### Navigation
- Always visible navigation
- Clear active states
- Mobile-responsive **hamburger menu**

### Search & Filters
- Implement for browseable content
- Provide:
  - Clear filter controls
  - Result counts

### Empty States
- Show helpful messages when no data exists
- Suggest next actions

### Status Indicators
- Use badges for:
  - Availability
  - Status
  - Categories
- Apply consistent color coding

### Trust Signals
- Include:
  - Ratings
  - Reviews
  - Testimonials
  - Key stats

### CTAs (Call-to-Actions)
- Use clear, action-oriented text:
  - ✅ "Book a Session"
  - ✅ "Get Started"
  - ❌ Avoid "Click Here"

---

## 📱 Responsive Design

- Follow a **mobile-first approach**
- Use grid layouts:
  - `grid-cols-1`
  - `md:grid-cols-2`
  - `lg:grid-cols-3`
- Stack elements:
  - Vertical on mobile
  - Horizontal on desktop
- Show/hide elements appropriately:
  - Hamburger menus
  - Filter sidebars
- Test all breakpoints:
  - `sm`, `md`, `lg`, `xl`

---

## 🗂️ Content & Data

- ❌ No Lorem Ipsum
  - Use realistic, contextual content

### Diverse Mock Data
- Include variety in:
  - Names
  - Demographics
  - Locations
  - Stats

### Realistic Details
- Use believable:
  - Company names
  - Job titles
  - Locations
  - Metrics

### Images
- Use **Unsplash**
- Select images with specific, relevant search terms

---

## 🧩 Components & Patterns

- Reuse existing UI components from your component library
- Create custom components for repeated patterns:
  - `MentorCard`
  - `ProfileHeader`
- Use icons from **lucide-react**
- Implement proper image handling:
  - Always include `alt` text

---

## 🧱 Page Structure

### Home / Landing Page
- Hero
- Value Propositions
- How It Works
- Featured Content
- Social Proof
- Call-to-Action (CTA)

### Browse / List Page
- Filters Sidebar
- Grid/List of Items
- Pagination or "Load More"

### Detail / Profile Page
- Header with key info
- Tabs / Sections
- Sidebar with stats and actions
- Reviews / Social Proof

---

## ⚡ Interactions

- Hover states on:
  - Cards
  - Buttons
- Active states in navigation
- Smooth transitions:
  - `transition-colors`
  - `transition-shadow`
- Include:
  - Loading states
  - Disabled states

---

## ⚙️ Functional Features

- Live search/filtering (instant updates)
- Support combined:
  - Sort
  - Filters
- Provide **Clear Filters** button
- Add:
  - Breadcrumbs
  - Back navigation
- Ensure linking between related pages:
  - Browse → Profile → Back to Browse

---

## ♿ Accessibility

- Use proper **semantic HTML**
- Add labels for all form inputs
- Include `alt` text for images
- Ensure keyboard navigation support (leveraging component library)

---