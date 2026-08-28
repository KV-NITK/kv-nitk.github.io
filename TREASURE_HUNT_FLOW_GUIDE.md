# 🏆 Kannada Vedike Treasure Hunt — Complete 8-Location Game Flow

## 📌 Executive Summary

This guide details the complete end-to-end flow of the **Hudugata Hudakata 2026 Treasure Hunt**, from **Location 0 (Start Line)** with **Clue 1**, through all 8 campus locations, to the **Final Victory (Location 8)**.

---

## 🗺️ 8-Location Route Lifecycle Diagram

```text
                       [ START / LOCATION 0 ]
              Team Registration & Path Assigned (Path 11)
                                │
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ STEP 1: Clue 1  ──►  Location 1: LHC                      │
  └─────────────────────────────┬─────────────────────────────┘
                                │ Scan QR ➔ Coordinator Accepts
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ STEP 2: Clue 2  ──►  Location 2: Main Pavilion           │
  └─────────────────────────────┬─────────────────────────────┘
                                │ Scan QR ➔ Coordinator Accepts
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ STEP 3: Clue 3  ──►  Location 3: Srinivas Library         │
  └─────────────────────────────┬─────────────────────────────┘
                                │ Scan QR ➔ Coordinator Accepts
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ STEP 4: Clue 4  ──►  Location 4: Mega Hostel Complex      │
  └─────────────────────────────┬─────────────────────────────┘
                                │ Scan QR ➔ Coordinator Accepts
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ STEP 5: Clue 5  ──►  Location 5: ATB (Applied Mech)       │
  └─────────────────────────────┬─────────────────────────────┘
                                │ Scan QR ➔ Coordinator Accepts
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ STEP 6: Clue 6  ──►  Location 6: Main Lawn                │
  └─────────────────────────────┬─────────────────────────────┘
                                │ Scan QR ➔ Coordinator Accepts
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ STEP 7: Clue 7  ──►  Location 7: SAC Complex              │
  └─────────────────────────────┬─────────────────────────────┘
                                │ Scan QR ➔ Coordinator Accepts
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ STEP 8: Clue 8  ──►  Location 8: Beach Gate (Finish Line)  │
  └─────────────────────────────┬─────────────────────────────┘
                                │ Scan QR ➔ Coordinator Accepts
                                ▼
                 🎉 [ HUNT COMPLETED & VICTORY ] 🎉
```

---

## 🔄 Complete Step-by-Step Execution Lifecycle

### Phase 0: Squad Registration & Initial Setup (Location 0)
1. **IRIS Authentication**: Student logs in via `https://kannadavedike.nitk.ac.in/team-registration`.
2. **Squad Creation**: Leader registers squad name (e.g., `Team Garuda`) and adds 2–3 squad members (roll numbers starting with `26`).
3. **Path Assignment**: Coordinator assigns `path_id = 11` via API:
   ```http
   PATCH /api/coordinator/teams/:teamId/path
   Header: x-coordinator-passcode: your-secret-passcode
   Body: { "pathId": 11 }
   ```
4. **Initial Team State**:
   - `teams.score = 1000`
   - `teams.current_step_no = 1`
   - `teams.path_id = 11`

---

### Step 1: Clue 1 ➔ Location 1 (LHC)

1. **Get Game State**: Frontend polls `GET /api/teams/game-state`:
   ```json
   {
     "success": true,
     "team": {
       "teamName": "Team Garuda",
       "score": 1000,
       "currentStep": 1,
       "pathId": 11,
       "status": "active"
     },
     "currentStep": {
       "stepNo": 1,
       "clue": {
         "id": 101,
         "text": "Where future engineers attend daily lectures near the green lawn.",
         "variant": 1
       },
       "location": {
         "id": 1,
         "name": "LHC (Lecture Hall Complex)"
       }
     }
   }
   ```
2. **Physical Search**: Team uses **Clue 1** to locate LHC on campus.
3. **Scan QR**: Team scans the physical QR code (`qr-lhc`) using the camera scanner in `GameDashboard.jsx`:
   ```http
   POST /api/scan
   Body: { "qrCode": "qr-lhc" }
   ```
4. **Scan Attempt Saved**: A record is created in `scan_attempts` (`status = "scanned"`, `is_correct = true`).
   - *UI Message*: `"Your scan has been submitted. Waiting for coordinator confirmation."`

5. **Coordinator Review & Progress Application**:
   - **Review**: `PATCH /api/coordinator/scans/:scanId` ➔ `{ "decision": "accepted" }`
   - **Apply Progress**: `POST /api/coordinator/scans/:scanId/apply-progress`
   - **PostgreSQL RPC Execution**:
     - `score` increases: $1000 + 100 = 1100$
     - `current_step_no` advances: $1 + 1 = 2$

---

### Step 2: Clue 2 ➔ Location 2 (Main Pavilion)
1. Next poll of `GET /api/teams/game-state` reveals **Clue 2** leading to **Location 2 (Main Pavilion)**.
2. Team scans `qr-pavilion` ➔ Coordinator accepts ➔ Progress applied:
   - `score = 1200`
   - `current_step_no = 3`

---

### Step 3: Clue 3 ➔ Location 3 (Srinivas Library)
1. `GET /api/teams/game-state` returns **Clue 3** leading to **Location 3 (Srinivas Library)**.
2. Team scans `qr-library` ➔ Coordinator accepts ➔ Progress applied:
   - `score = 1300`
   - `current_step_no = 4`

---

### Step 4: Clue 4 ➔ Location 4 (Mega Hostel Complex)
1. `GET /api/teams/game-state` returns **Clue 4** leading to **Location 4 (Mega Hostel Complex)**.
2. Team scans `qr-mega` ➔ Coordinator accepts ➔ Progress applied:
   - `score = 1400`
   - `current_step_no = 5`

---

### Step 5: Clue 5 ➔ Location 5 (ATB - Applied Mechanics)
1. `GET /api/teams/game-state` returns **Clue 5** leading to **Location 5 (ATB)**.
2. Team scans `qr-atb` ➔ Coordinator accepts ➔ Progress applied:
   - `score = 1500`
   - `current_step_no = 6`

---

### Step 6: Clue 6 ➔ Location 6 (Main Lawn)
1. `GET /api/teams/game-state` returns **Clue 6** leading to **Location 6 (Main Lawn)**.
2. Team scans `qr-lawn` ➔ Coordinator accepts ➔ Progress applied:
   - `score = 1600`
   - `current_step_no = 7`

---

### Step 7: Clue 7 ➔ Location 7 (SAC Complex)
1. `GET /api/teams/game-state` returns **Clue 7** leading to **Location 7 (SAC Complex)**.
2. Team scans `qr-sac` ➔ Coordinator accepts ➔ Progress applied:
   - `score = 1700`
   - `current_step_no = 8`

---

### Step 8: Clue 8 ➔ Location 8 (Beach Gate - Finish Line) & Victory!
1. `GET /api/teams/game-state` returns **Clue 8** leading to the final location: **Location 8 (Beach Gate)**.
2. Team scans `qr-beach` ➔ Coordinator accepts ➔ Final Progress applied:
   - `score = 1800`
   - `current_step_no = 9` (Completed)
   - `teams.status = "completed"`
3. **Victory UI**: The Game Dashboard displays the final completion trophy and congratulates the team on completing the hunt!

---

## 🛡️ Core Security & System Rules
1. **No QR Leakage**: `locations.qr_code` is never exposed in `GET /api/teams/game-state`.
2. **Backend Authority**: Progression and scoring are strictly controlled by PostgreSQL RPC functions, never by the client browser.
3. **Deduplication**: The `progress_applied = true` flag prevents duplicate scoring for the same scan attempt.
