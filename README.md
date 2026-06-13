# Job Posting Automation Plugin

**Keep job listings accurate everywhere your company hires — from the first “we need this role” message to the moment the last seat is filled.**

---

## Who is this for?

This project is for **hiring managers, HR teams, and directors** who are tired of:

- Candidates applying to jobs that are **already closed**
- HR manually chasing down listings on LinkedIn and the company website
- No single place that knows whether a role is **still open or filled**

If you use **Microsoft Teams** (or Slack) to run your team, this plugin connects that daily workflow to your **company careers page** and **LinkedIn** — so listings stay in sync with reality.

---

## The problem (in plain terms)

Today, hiring often looks like this:

1. A director says *“We need a Senior Engineer”* in a Teams chat.
2. HR posts the job on the company website and LinkedIn.
3. Someone gets hired and onboarded.
4. **Nobody tells LinkedIn or the website to take the posting down.**

Weeks later, candidates still apply. HR has to reply: *“Sorry, that role is closed.”*

That hurts **candidate experience**, wastes **HR time**, and makes the company look disorganized.

---

## What this plugin does

It creates **one controlled path** from “we need to hire” to “this role is closed”:

```
Manager creates role in Teams
        ↓
HR reviews (discussion + legal sign-off)
        ↓
Job goes live on company careers portal (one page per opening)
        ↓
HR shares on LinkedIn (using the company portal link)
        ↓
When someone is hired → that listing comes down automatically
        ↓
LinkedIn post closes only when ALL openings for that role are filled
```

**You always know:** Is this job still open? Who approved it? When was it closed?

---

## How it works — step by step

| Step | Who | What happens |
|------|-----|--------------|
| 1 | **Manager or delegate** | Fills out one form: job title, description, number of openings (e.g. 3). Each opening gets its **own unique ID**. |
| 2 | **Hiring owner** | Submits the request for HR review. |
| 3 | **HR** | Joins a short call with the owner (scope, legal, compliance). After the call, HR marks **“Discussion completed”** with their work email. |
| 4 | **Hiring owner** | Reviews, edits if needed, and **publishes** to the company careers portal. |
| 5 | **HR** | Posts to LinkedIn and other job boards using the **company portal link**. |
| 6 | **Anyone confirming the hire** | Marks the opening as filled → that portal listing is removed. |
| 7 | **System** | When the **last** opening for that role is filled, HR is notified to close the LinkedIn post (or it closes automatically if LinkedIn API is enabled). |

---

## Key ideas (why this is different)

### One form, many openings

Need **3 Senior Engineers**? Submit once. The system creates **3 separate listings**, each with its own ID — so you always know which seat was filled.

### HR is always in the loop

Nothing goes public without HR approval. Legal and compliance stay protected.

### No silent edits

If job details need to change, the **hiring owner** updates them — not HR working alone. If the owner is away, a teammate creates a **new request**; the old one stays as a draft.

### LinkedIn stays smart

Closing **one** hire removes **one** portal page. LinkedIn stays live until **every** opening for that role under the same director is filled — because one LinkedIn post often covers multiple headcount.

### Rejection is final

If HR rejects a request, it does not get recycled. A fresh request is needed — keeping the audit trail clean.

---

## Who does what?

| Role | Can do |
|------|--------|
| **Hiring owner** (director / VP) | Edit job details, submit for HR, publish, confirm hires |
| **Delegate** (someone on the team) | Create requests when the owner is unavailable |
| **HR** | Mark discussion complete, reject requests, post to LinkedIn, close external listings |

---

## What exists today vs. what’s coming

| Today (MVP) | Coming next |
|-------------|-------------|
| Full hiring lifecycle logic (backend) | Teams plugin with forms and buttons |
| HR approval gates | Real company careers portal connection |
| Unique ID per opening | LinkedIn auto-close via API |
| Mock portal + team notifications | Slack / Outlook support |

**In simple terms:** the **engine** is built and tested. The **Teams screen** your managers will click is the next step.

---

## Example scenario

> **Priya** (Engineering Director) needs 3 Senior Engineers.  
> Her teammate **Alex** submits the form in Teams: “Senior Engineer × 3.”  
> **HR (Maria)** joins a 15-minute call, then marks discussion complete.  
> **Priya** publishes → 3 job pages appear on the company careers site.  
> **Maria** posts one LinkedIn listing linking to the portal.  
> First hire **Jamie** joins → 1 portal page closes. LinkedIn stays up (2 seats left).  
> Second and third hires join → remaining pages close → Maria gets a notice to close LinkedIn.

No candidate applies to a ghost job. No manual spreadsheet tracking.

---

## For technical readers

<details>
<summary><strong>Click to expand: setup, API, and architecture</strong></summary>

### Quick start

```bash
cd Job-Posting-Automation-Plugin
cp .env.example .env
npm install
mkdir -p data
npm run db:push
npm run dev
```

Server: `http://localhost:3000` · Health check: `http://localhost:3000/health`

### State machine

```
Draft → PendingHR → DiscussionCompleted → Published → Filled
                  ↘ Rejected (terminal)
Draft → Superseded → Archived
Published → Cancelled
```

### Architecture

```
Teams/Slack Plugin (Phase 2)
        ↓
REST API (Express + TypeScript)
├── RequisitionService (state machine)
├── PortalAdapter (mock → real CMS)
├── NotificationAdapter (console → Teams/Slack)
└── LinkedInAdapter (manual → API)
        ↓
SQLite (Prisma)
```

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/requisitions` | Create batch (N openings) |
| POST | `/api/batches/:batchId/submit` | Owner submits for HR |
| POST | `/api/hr/discussion-completed` | HR marks call complete |
| POST | `/api/hr/reject` | HR rejects (terminal) |
| POST | `/api/batches/:batchId/publish` | Owner publishes to portal |
| POST | `/api/requisitions/:reqId/fill` | Confirm hire, close listing |
| GET | `/api/requisitions/open` | List open postings |
| GET | `/health` | Health check |

See `.env.example` for configuration options.

### Troubleshooting (Windows)

If `npm run db:generate` fails with `EPERM` on `query_engine-windows.dll.node`:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
npm run db:generate
npm run dev
```

</details>

---

## License

MIT
