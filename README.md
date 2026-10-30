# BlockerGraph AI
### Intelligent Project Dependency & Blocker Management System

[![Build & Tests](https://img.shields.io/badge/tests-10%20passed-emerald)](file:///tests/engine.test.ts)
[![Graph Engine](https://img.shields.io/badge/engine-CPM%20%2B%20DFS%20Cycles-blue)]()
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node%20%7C%20Supabase-violet)]()

> **BlockerGraph AI** is an intelligent project dependency and blocker management platform. It combines **Directed Acyclic Graph (DAG) cycle detection**, **Critical Path Method (CPM) forward/backward pass algorithms**, and a **predictive Delay Impact Simulator** to give engineering teams mathematical foresight into complex delivery schedules.

---

## 1. Executive Overview & Problem Solved

Traditional task boards (Kanban, Scrum, Trello) treat tasks as independent cards arranged in static vertical columns. In modern software engineering:
1. **Hidden Cascading Delays:** A single delay in an architectural task (e.g., API Gateway or Database Schema) cascades to 5+ downstream dependencies, causing late deliveries without warning.
2. **Circular Dependency Deadlocks:** Cross-team dependencies frequently form accidental cyclic loops ($A \rightarrow B \rightarrow C \rightarrow A$), locking sprints.
3. **Guesswork in Schedule Slippage:** When a bottleneck occurs, project leads cannot quantify the exact impact on the final release date without tedious manual recalculations.

**BlockerGraph AI replaces guesswork with graph theory and explainable algorithms.**

---

## 2. Architecture & System Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BLOCKERGRAPH AI SYSTEM TOPOLOGY                       │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client Frontend (Vite + React + TS) ]
   ├── Interactive Canvas (@xyflow/react)
   │     ├── Custom TaskNode (Glow effects, Float metrics, Dynamic Status)
   │     ├── Directed Smoothstep Edges (Critical Path, Blocked Dashes)
   │     └── Cycle Alert Modal (Visualizes exact circular loop paths)
   ├── Delay Impact Simulator (Real-time slider, schedule comparison waterfall)
   ├── Project Intelligence Panel (Zero-float warnings, bottleneck hub analysis)
   └── Analytics Dashboard (Recharts status and priority distributions)
             │
             │ REST API (JSON via Vite Proxy)
             ▼
 [ Backend Core Engine (Node.js + Express + TypeScript) ]
   ├── src/engine/graph.ts         -> DFS Cycle Detection & Topological Sort
   ├── src/engine/cpm.ts           -> Forward (ES/EF) & Backward (LS/LF) CPM Pass
   ├── src/engine/blocker.ts       -> Dynamic Blocker Evaluation & Suggestions
   ├── src/engine/simulator.ts     -> CPM Schedule Delay Propagation
   └── src/engine/intelligence.ts  -> Explainable Insights & Bottleneck Generator
             │
             ▼
 [ Storage Layer (Hybrid Supabase PostgreSQL / Local Persistence) ]
   ├── src/db/schema.sql           -> Production Supabase Tables, RLS & Foreign Keys
   ├── src/db/seed.ts              -> 16 Realistic Cloud SaaS Engineering Tasks
   └── data/db.json                -> Zero-friction standalone local persistence
```

---

## 3. Core Graph & Scheduling Algorithms

### A. Critical Path Method (CPM)
BlockerGraph AI implements the classical **Critical Path Method** on directed acyclic graphs:
- **Forward Pass:** Computes Earliest Start ($ES$) and Earliest Finish ($EF$):
  $$ES_i = \max_{p \in \text{Pred}(i)} (EF_p + \text{lag}), \quad EF_i = ES_i + \text{duration}_i$$
- **Backward Pass:** Computes Latest Finish ($LF$) and Latest Start ($LS$):
  $$LF_i = \min_{s \in \text{Succ}(i)} (LS_s - \text{lag}), \quad LS_i = LF_i - \text{duration}_i$$
- **Float / Slack:**
  $$\text{Slack}_i = LS_i - ES_i$$
- **Critical Path:** All tasks where $\text{Slack}_i = 0$. Any delay on these tasks immediately pushes out the entire project release date by an equal amount of days.

### B. Cycle Detection Engine
- Uses **Depth-First Search (DFS) with three-state coloring** ($0 = \text{unvisited}, 1 = \text{visiting in current recursion stack}, 2 = \text{fully visited}$).
- Automatically intercepts **self-dependencies** ($A \rightarrow A$) and **transitive cycles** ($A \rightarrow B \rightarrow C \rightarrow A$).
- Extracts and returns the exact node sequence path (e.g., `["Task 4", "Task 7", "Task 13", "Task 4"]`) so users clearly understand why the link was rejected.

### C. Blocker Detection Engine
- A task is dynamically evaluated as **Blocked** when it is incomplete and has at least one unfinished prerequisite.
- Computes transitive downstream fan-out count.
- Generates human-explainable next unblocking actions.

### D. Delay Impact Simulator
- Allows interactive simulation of $+N$ days of delay on any task.
- Re-executes the topological CPM forward and backward pass under the shifted conditions.
- Identifies downstream tasks whose start dates are forced later.
- Flags **Tasks at Risk** (where simulated finish date exceeds user-defined hard deadlines).

---

## 4. Realistic 16-Task Demonstration Dataset

The project is pre-loaded with **Nebula Orchestrator v2.0 - Cloud Infrastructure Release**:
1. `Task 01`: System Architecture & API Specs (Completed)
2. `Task 02`: PostgreSQL DB Schema & Migrations (Completed)
3. `Task 03`: Auth Service & RBAC Tokens (Completed)
4. `Task 04`: API Gateway & Edge Routing (In Progress, Critical Path Hub)
5. `Task 05`: Stripe Billing & Subscription Webhooks (Blocked by API Gateway)
6. `Task 06`: Real-Time WebSocket State Engine (In Progress)
7. `Task 07`: AI Autonomous Workload Balancer (Blocked by API Gateway)
8. `Task 08`: Glassmorphic Design System Components (Completed)
9. `Task 09`: Interactive Dependency Graph Canvas (In Progress)
10. `Task 10`: Real-Time Telemetry & Metrics UI (Blocked)
11. `Task 11`: End-to-End Cypress Integration Tests (Blocked)
12. `Task 12`: SOC2 Compliance & Penetration Audit (Blocked)
13. `Task 13`: High-Concurrency Stress & Load Testing (Blocked)
14. `Task 14`: Multi-Region Kubernetes Canary Deployment (Blocked)
15. `Task 15`: Global DNS Failover & Production Cutover (Blocked)
16. `Task 16`: Post-Launch APM Observability & Alerts (Blocked)

---

## 5. Hackathon Demonstration Walkthrough

Follow this step-by-step sequence to demonstrate the complete capability:

| Step | Action | Expected Result |
|---|---|---|
| **1. Overview** | Launch dashboard | View KPI cards: 16 tasks, 20 dependencies, active blockers, and progress bar. |
| **2. Interactive Graph** | Click "Dependency Graph" tab | View full React Flow canvas with custom styled nodes, status pills, and avatars. |
| **3. Identify Blocker** | Click on "Stripe Billing & Subscription Webhooks" | Drawer opens on the right. Blocker engine pinpoints prerequisite: *"Waiting on API Gateway & Edge Routing (David Kim)"*. |
| **4. Delay Simulation** | Click "Delay Simulator" tab. Select "API Gateway" and drag slider to **+2 Days** | Real-time CPM recalculation reveals: Project delivery shifts by **+2 days**, 5 downstream tasks shifted, and Tasks at Risk are highlighted in red. |
| **5. Cycle Prevention** | Connect "SOC2 Compliance Audit" or "Global DNS Cutover" back to "System Architecture" | System immediately intercepts the connection and displays the **Circular Dependency Rejected Modal**, explaining the exact cycle loop. |
| **6. Critical Path** | Toggle "Highlight Critical Path" on the graph | Longest path lights up in glowing amber; members have **0 float**. |
| **7. Reset Demo** | Click "Reset Seed" in top navbar | Instant 1-click restore to clean baseline demonstration state. |

---

## 6. Installation & Execution Guide

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### One-Command Setup & Run
From the project root:

```bash
# 1. Install root, server, and client dependencies
npm run install:all

# 2. Run both Backend API (port 5000) and Frontend (port 3000) concurrently
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 7. Automated Test Suite (Vitest)

Run the comprehensive automated test suite verifying all 10 core engineering requirements:

```bash
npm run test --prefix server
```

### Verified Test Cases:
1. `✓` Creating valid tasks
2. `✓` Creating valid dependencies
3. `✓` Rejecting self-dependencies ($A \rightarrow A$)
4. `✓` Detecting circular dependencies ($A \rightarrow B \rightarrow C \rightarrow A$)
5. `✓` Identifying blocked tasks
6. `✓` Identifying downstream affected tasks
7. `✓` Updating blocker status after task completion
8. `✓` Delay simulation (CPM schedule shift)
9. `✓` Critical path calculation (ES, EF, LS, LF, Float)
10. `✓` Invalid input handling (isolated nodes, empty graphs)

---

## 8. Database Schema (Supabase PostgreSQL)

The schema is defined in [`server/src/db/schema.sql`](file:///server/src/db/schema.sql).

To deploy directly to a remote Supabase project:
1. Copy the contents of `server/src/db/schema.sql`.
2. Open your Supabase Dashboard $\rightarrow$ **SQL Editor**.
3. Paste and run the script. It provisions:
   - `public.profiles`
   - `public.projects`
   - `public.tasks`
   - `public.task_dependencies` (with `CHECK (source_task_id != target_task_id)` and unique pair constraints)
   - `public.activity_logs`
   - Row Level Security (RLS) policies and performance indexes.

---

## 9. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, `@xyflow/react` (React Flow), Recharts, Lucide Icons
- **Backend:** Node.js, Express 4, TypeScript, tsx, Zod
- **Testing:** Vitest
- **Database:** Supabase PostgreSQL Schema + Local relational engine
