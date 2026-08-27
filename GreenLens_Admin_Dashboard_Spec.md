# GreenLens — Municipal & Admin Dashboard Module
### Role Specification & Technical Scope (Team Member: Municipal Dashboard / Admin Portal Lead)

---

## 1. Role Overview

**Owner responsibilities:** The web-based command-center portal used by municipal officers, supervisors, and system administrators — as distinct from the citizen-facing mobile app. This covers incident monitoring, dispatch, the digital twin visualization, admin/user management, data configuration, reporting/export, and system audit.

**Position in system architecture:**

```
Municipal/Admin Web Portal (this role)
    ├── Executive Dashboard
    ├── Real-Time Incident Monitoring
    ├── AI-Powered Dispatch
    ├── Digital Twin Visualization
    ├── Administration Portal (Users, Roles, Data Config)
    ├── Reporting & Export
    └── System Audit Log
         ↓
    FastAPI Backend
         ↓
    AI Service (consumes flood-risk scores, image analysis results)
```

This role does not build the AI models themselves — it consumes AI outputs (flood risk scores, image analysis, dispatch priority) via API and presents them to municipal staff. It also does not build the citizen mobile app or field-team app (those are separate roles).

---

## 2. Core Modules to Build

### 2.1 Executive Dashboard

**Source: PRD/Master Doc Section 6.1**

Single-screen overview for leadership. Must display:

| Metric | Description |
|---|---|
| Total reports | All-time or filtered by date range |
| Verified reports | Reports confirmed by municipal review |
| Open incidents | Currently unresolved |
| Critical blocked drains | High/critical severity drainage issues |
| Predicted flood-risk areas | Pulled from AI Flood Risk Engine |
| Active cleanup operations | In-progress field work |
| Completed cleanups | Resolved count |
| Response time | Average time from report → dispatch → resolution |
| Waste collected | Aggregate volume/weight |
| Environmental impact | CO₂ reduction, drainage capacity restored, etc. |
| High-risk communities | Ranked list by flood/waste risk |

Should support date-range filtering and drill-down (click a metric → see underlying report list).

---

### 2.2 Real-Time Incident Monitoring

**Source: Master Doc Section 6.2**

Live/near-live feed for officers to monitor:
- Newly submitted reports
- AI classifications as they come in
- Critical incidents (auto-highlighted)
- Flood alerts
- Field-team activity status
- Unresolved incidents (with aging indicators — e.g., "48 hours pending")

**Build note:** Consider WebSocket or polling-based live updates so officers see new critical reports without manual refresh.

---

### 2.3 AI-Powered Dispatch System

**Source: Master Doc Section 7**

**Incident Prioritization** — the dashboard must display an AI-ranked queue based on:
- Blockage severity
- Waste volume
- Distance to drainage
- Rainfall forecast
- Flood risk score
- Population affected
- Historical flooding at that location
- Proximity to critical infrastructure

**Automated Dispatch Directive** — surface AI-generated directives in a readable format, e.g.:
> "CRITICAL — Dispatch cleanup team to Drain Segment D-104 within 4 hours. Heavy rainfall predicted within 18 hours. Estimated blockage: 78%."

**Assignment workflow** — officers must be able to:
- Assign a field team to an incident
- Set/override priority
- Set a deadline
- Add instructions
- Track assignment status (Assigned → In Progress → Completed)

**Dependency:** This module consumes the AI service's prioritization/scoring output — coordinate the exact response schema with the AI Integration lead.

---

### 2.4 Digital Twin Visualization

**Source: Master Doc Sections 5.2, 5.3**

A map-based view of the drainage network (built on GIS data owned by the Map/GIS teammate, but the *officer-facing UI and interaction layer* for it belongs here). Each segment on the map should be clickable to reveal its profile:

- Segment ID
- Location / geographic coordinates
- Drainage type
- Capacity
- Current blockage %
- Last inspection date
- Last cleanup date
- Current risk level
- Historical flooding record
- Nearby waste reports

Officers should be able to visually distinguish, at a glance:
- Healthy segments
- Blocked segments
- High-risk segments
- Recently cleaned segments
- Segments requiring inspection

Color coding should follow the severity convention used elsewhere in the app:
🟢 Low → 🟡 Moderate → 🟠 High → 🔴 Critical

---

### 2.5 What-If Analysis (Officer Tool)

**Source: Master Doc Section 4.5**

Officers should be able to run simulations directly from the dashboard:
- What happens if blockage increases?
- What happens if 50mm of rain occurs?
- What happens if a drainage segment is cleaned?
- Which locations become critical under heavy rainfall?

This is a UI over the AI service's simulation endpoint (`POST /flood-risk/simulate`) — this role builds the interface and input controls; the AI lead owns the underlying computation.

---

### 2.6 Infrastructure Maintenance Management

**Source: Master Doc Section 20**

Municipal authorities should be able to manage, via the dashboard:
- Drainage inspections (schedule and log)
- Maintenance schedules
- Cleaning schedules
- Infrastructure defects (log and track)
- Repair requests
- Maintenance history (per segment)
- Contractor assignments

Goal: move the municipality from reactive → predictive maintenance over time.

---

### 2.7 Administration Portal

**Source: Master Doc Section 21**

**User Management** — administrators manage accounts for:
- Citizens
- Municipal officers
- Field workers
- Supervisors
- Administrators

**Roles & Permissions (RBAC)** — implement role-based access control matching:

| Role | Main Access |
|---|---|
| Citizen | Reports, map, rewards (mobile app only — not this portal) |
| Field Worker | Assigned tasks only |
| Supervisor | Field operations |
| Municipal Officer | Dashboard, dispatch, analytics |
| Administrator | Full system management |

This dashboard is primarily used by the bottom four roles in that table (not citizens).

---

### 2.8 Data Management

**Source: Master Doc Section 22**

Admins need CRUD screens for configuring:
- Municipalities
- Communities
- Drainage segments
- Waste categories
- Incident categories
- Risk thresholds (e.g., what blockage % = "Critical")
- Reward rules
- Notification templates
- Cleanup teams
- Weather API configuration

---

### 2.9 Reporting & Export

**Source: Master Doc Section 23**

Generate and export:
- Daily / weekly / monthly reports
- Flood-risk reports
- Waste reports
- Cleanup reports
- Citizen participation reports
- Environmental impact reports

**Export formats:** PDF, Excel/CSV

---

### 2.10 System Audit & Accountability

**Source: Master Doc Section 26**

Every significant action across the platform should be visible in an audit log here, including:
- Who submitted a report
- Who verified it
- Who assigned it
- Who completed the cleanup
- Who approved a reward
- Timestamp of each action
- Location of field activity
- Any changes made to incident information

This log view is admin/officer-only and supports municipal accountability — should be filterable by user, date range, and action type.

---

## 3. API Contract (This Role Consumes/Depends On)

```
GET  /reports                    → Incident feed for monitoring
GET  /map/incidents              → Map data for digital twin view
GET  /map/drainage               → Drainage segment profiles
GET  /map/flood-risk             → Risk scores per segment
POST /flood-risk/simulate        → What-if analysis (owned by AI lead)
GET  /leaderboard                → For officer visibility into community engagement (optional)
```

**Admin-specific endpoints this role likely needs to define with the Backend dev** (not explicitly listed in the PRD's mobile-focused API section, since that section covers the citizen app):
```
GET/POST/PATCH /admin/users              → User & role management
GET/POST/PATCH /admin/drainage-segments  → Digital twin data config
GET/POST       /admin/dispatch           → Assignment workflow
GET            /admin/audit-log          → System audit trail
GET            /admin/reports/export     → PDF/CSV export
POST           /admin/maintenance        → Inspection/repair scheduling
```

---

## 4. Suggested MVP Priority Order

**Must Have:**
1. Executive Dashboard (core metrics)
2. Real-time incident monitoring feed
3. Incident assignment workflow (manual, even before full AI prioritization)
4. Basic digital twin map view (segment status only)
5. User management + RBAC

**Should Have:**
6. AI-powered dispatch prioritization display
7. Reporting & export (PDF/CSV)
8. System audit log

**Later:**
9. What-if simulation UI
10. Infrastructure maintenance scheduling
11. Full data management config screens (waste categories, reward rules, etc.)

---

## 5. Dependencies on Other Team Members

| Depends on | What's needed |
|---|---|
| AI Integration Lead | Flood risk scores, dispatch prioritization output, image analysis results to display |
| Backend/API Dev | Auth, reports API, admin-specific endpoints listed above |
| Map/GIS Dev | Drainage segment geodata to render the digital twin map |
| Field Ops Dev | Assignment status updates (completed/in-progress) to reflect on this dashboard |
| Rewards Dev | Citizen participation numbers for the executive dashboard's engagement metrics |

---

## 6. Success Metrics This Role Is Measured Against

**Source: PRD Section 17 (Municipal Impact category)**

- Average response time
- Percentage of reports resolved
- Critical incidents resolved before rainfall
- Cleanup completion rate

---

*Document prepared for team task allocation — GreenLens Mobile App project.*
