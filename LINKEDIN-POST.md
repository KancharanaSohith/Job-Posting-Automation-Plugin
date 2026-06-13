# LinkedIn Post Draft — Job Posting Automation Plugin

Use the **Recommended post** below. Attach your screenshots as a carousel (order at the bottom).

---

## Recommended post (copy from here)

Applied to a role on LinkedIn — and HR replied: “Sorry, that position is already closed.”

Sound familiar?

It happens because hiring intent, the company careers portal, and LinkedIn rarely stay in sync. A manager opens a role internally, HR posts it in multiple places, someone gets hired… but the job listing lives on for weeks.

So I started building something to fix that.

**The idea: a Job Posting Automation Plugin**

One workflow from “we need this role” → live posting → closed when filled.

→ Manager creates the role in Teams (one form, multiple openings)
→ HR completes a discussion + legal review before anything goes public
→ Each opening gets its own ID and its own listing on the company portal
→ HR syndicates to LinkedIn using the portal link
→ When a hire is confirmed, that portal listing closes
→ LinkedIn stays active until **all** openings for that role are filled

**What I’ve built so far (MVP):**

The backend engine that runs this full lifecycle — not slides, not a concept deck. The API is live and the flow works end-to-end:

• One submission → 3 separate requisitions, each with a unique ID
• HR approval gate before publish
• Mock company portal sync on publish
• Smart close: fill 1 opening → 1 portal listing removed, others stay live

Teams plugin UI and real portal integration are next — but the hardest part (lifecycle orchestration + HR gates + per-opening sync) is already running.

Swipe through the screenshots 👇 — health check, req creation, publish, and partial close in action.

If you’ve been on either side of stale job posts — hiring or applying — I’d genuinely love your feedback.

Would this help your organization?

#BuildInPublic #HRTech #Recruiting #Automation #JobSearch

---

## Shorter version (alternative)

Stale job posts waste everyone’s time.

Candidates apply to closed roles.
HR sends “sorry, already filled” emails.
Hiring managers think the req is still open.

I’m building a plugin to sync the full job lifecycle:

Teams → HR approval → Company portal → LinkedIn → Auto-close on hire

Each opening gets its own ID. LinkedIn closes only when all openings are filled.

Backend MVP is live — the screenshots show the full flow working: create → approve → publish → close on fill.

Teams UI + real portal hookup next.

Feedback welcome — especially from folks in HR or hiring.

---

## Screenshot carousel order

| Slide | Screenshot | Caption (optional) |
|-------|------------|-------------------|
| 1 | Health check (`/health`) or flow diagram | One synced lifecycle |
| 2 | 3 Req IDs from one form | 1 form → 3 unique openings |
| 3 | REQ_SUBMITTED notification | HR notified for review |
| 4 | Discussion completed + publish | HR gate before go-live |
| 5 | portalUrl + REQ_PUBLISHED | Live on company portal |
| 6 | Partial close notification | 1 filled → 1 listing closed |
| 7 | 2 reqs still open | LinkedIn stays until all filled |

**If using only 4 images:** health → 3 Req IDs → published → 2 still open.

---

## Before posting — quick checklist

- [ ] Server screenshots are readable (zoom/crop if needed)
- [ ] Carousel order matches the story (create → approve → publish → close)
- [ ] First line is the hook (no link or emoji before it)
- [ ] Optional: add context in first comment (your role, “building in public”)

---

## After restart — run the demo again (if needed)

```powershell
cd "C:\Users\kanch\Desktop\Personal Projects\Job-Posting-Automation-Plugin"
npm run dev
```

Health check: http://localhost:3000/health

Full API test steps are in `README.md`.
