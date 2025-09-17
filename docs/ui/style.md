Below is a cohesive doc that combines **design + sitemap + dashboard spec** that combines:

1. **Your BrandBlueprint sitemap/content outline** (roles, dashboards, workshops, admin, etc.)
2. **The visual language and features** from the dashboard UI references you uploaded (dark theme, collapsible sidebar, cards, KPIs, activity feeds).
3. **The interaction + theming rules** I explained earlier (black base, brand accent `#FFCC00`, rounded cards, tooltips, hamburger collapse, persistence).
4. Some sample screenshots are attached of the style /ui/style.png
5. Some sample screenshots are attached to show actual layout and nav using our sitemap /ui/dashboard-v1.png etc
6. lets include also mockups for the interactive brand guide.. /ui/Home.jpg

---

# 📍 Unified Dashboard + Sitemap Spec

## 1. Global Design System

- **Theme:** Dark (`#0E0E10` background), cards `#17171A`, border `#2A2A30`.
- **Accent color:** `#FFCC00` for CTAs, active pills, focus rings.
- **Radii:** 16px (cards), 12px (buttons), full (chips).
- **Sidebar:** Collapsible (260px expanded → 80px mini), hamburger toggle, tooltips on hover.
- **Top bar:** Contextual actions (filters, add-new, notifications).
- **Cards:** Elevated, 24px padding, title row + body content, optional footer.
- **Typography:** Inter/Manrope; H1 24/700, body 14/500, micro 12/600.
- **Interaction:** Hover darkens, focus ring `#FFCC00`, animations 200ms ease.

---

## 2. App Structure (from BrandBlueprint)

### Public / Marketing

```
/home
/features
/pricing
/how-it-works
/case-studies
/about
/contact
/demo
/blog/[slug]
/auth (login, signup, reset)

```

### Authenticated App

```
/app
├── /dashboard (role-based landing)
├── /onboarding
│   ├── organization-setup
│   ├── business-setup
│   └── team-setup
├── /admin (Super Admin only)
│   ├── organizations
│   ├── system
│   │   ├── questions
│   │   ├── modules
│   │   ├── strategies
│   │   └── analytics
│   └── billing
├── /organizations/[orgId]
│   ├── overview
│   ├── businesses
│   ├── team
│   ├── settings
│   └── library (questions, modules, strategies)
├── /businesses/[businessId]
│   ├── overview
│   ├── profile
│   ├── projects
│   │   ├── /new
│   │   └── /[projectId]
│   │       ├── overview
│   │       ├── workshop
│   │       │   ├── modules
│   │       │   └── /[moduleId]/questions/[questionId]
│   │       ├── progress
│   │       ├── portal (brand guide)
│   │       ├── deliverables
│   │       └── exports
└── /reports

```

---

## 3. Dashboards (by role)

### Super Admin Dashboard

- **KPIs row:** Total Orgs, Businesses, Active Projects, Monthly AI Requests. Number of Questions, Active Modules, Active Strategy Templates..
- **Table:**
  - Organizations (name, businesses, users, plan, status, actions).
  - Projects (name, organization, percentage, modules or streategies, status, actions)
- Quick buttons: (for super admin only)
  - New Module
  - New Strategy
  - New Question
  - New Business
- **Cards:**
  - Platform Health (uptime, AI response time, satisfaction).
  - Projects (how many, percentages )
  - Recent Activity (new orgs, new projects, model updates, features).

### Organization Dashboard

- **Header KPIs:** Businesses, Projects, Users, Current Plan.
- **Tabbed content:**
  - Businesses (list + add/edit).
  - Users (admins, invites).
  - Projects (cross-business).
  - Reports (usage, exports, AI activity).

### Business Dashboard

- **Hero card:** Business name + plan status.
- **Tiles:** Active projects, users, subscription.
- **CTA:** `+ New Project`.
- **Grid list:** Projects (name, type, progress %, last activity).

### Project Workspace

- **Header:** Project name + progress bar.
- **Top Bar:** Modules (with icons + progress) > Category > Question .. Maybe some sort of dropdown that shows all question in the module so users can quickly jump to other. display how many questions … something like 4 out of 12 in module xy .. remember, we have modules, moer than one, inside a project.. and a module has
- **Main content:** Active Question:
  - 1: the Main Question Name
  - 2: The 6 tip question framework must include:
    - Examples & Suggestions
    - Expert Tips & Guides
    - Why This Matters
    - In other words (Kid-Friendly) Version
    - Alternative Formats
    - CONFIDENCE CALIBRATION
  - 3: A way for the user to answer the question. This is a question feed, as user can iterate and add more than one.
  - 4: Answer approval step .. (a way for user to ‘approve’ a answer to make final)
- **Right sidebar:** AI assitant .. also chat feed, but in addition we could include here extr athigns like: also should have the show/hide feature…
  1 section with this: - suggest purpose framework - show industry examples - ask guiding questions - review my draft
- 2: a AI chat window, to type anything for the AY …
  3: button ‘ask ai’
  4: a way to ‘use the’ ai response, a way to iterate on the AI response,a way to ‘approve’ .. (use means, it would cop it over to the user box..)
- Elsewhere: Notes, comments, export panel.
- a way to ‘save’, ‘skip’ .. next/previous question..

### Brand Portal

- Interactive guide generated from approved answers.
- Tabs: Strategy | Verbal | Visual | Customer | Applications.
- Export/share buttons top-right.

---

## 4. Sidebar Navigation (collapsed/expanded)

**Expanded (default):**

- Dashboard
- Organizations
- Businesses
- Projects
  - Workshop
- Brand Guide (drop, expands all internal sections)
- Activations

**ADMIN**

- Questions
- Modules
- Strategies

**SEPARATOR**

- Analytics
- Reports
- Settings
- Log out

**Collapsed (mini):**

- Only icons, tooltips on hover, brand accent dot for active item.
- Hamburger toggle in header to expand.
- Persistent state saved in `localStorage`.

---

## 5. Dashboard Card Types

- **KPI cards:** Label, number, % delta, optional sparkline.
- **List tables:** Data rows (orgs, businesses, projects).
- **Activity feeds:** Avatars, bold names, muted actions, inline brand highlights.
- **Tiles/grids:** Project or business summaries.
- **Chips/pills:** Status indicators (Active = green, Setup = yellow, Inactive = gray).

---

✅ With this merged structure:

- **Content + sitemap** = BrandBlueprint hierarchy
- **Visual style + theme** = dark dashboards you uploaded (rounded cards, accent purple in ref, replaced here with your brand yellow)
- **Features** = collapsible sidebar, tooltips, persistence, card grid layout, top bar actions, activity feeds.

---

Would you like me to now **produce a Figma-ready wireframe spec** (boxes, layout grid, spacing, typography) so you can hand it to design/dev? Or do you prefer a **React + Tailwind starter scaffold** with this exact sitemap + empty components?
