# Marketing Logic Model — inblock.io / Aqua Protocol Website

## Goal

Convert prospects who receive the inblock.io website link (via outbound, partner referral, or personal social channels) into demo bookings, deeply engaged readers, and qualified inbound interest — for both technical and non-technical audiences across multiple target industries.

**Acceptance criterion:**

- Demo / call bookings logged from sent links.
- Engagement depth on site: multi-page sessions, meaningful time-on-page, return visits.
- Strong inbound interest signals: substantive replies, partner inquiries, follow-up conversations after a link is sent.

**Out of scope:**

- Self-serve signup or product application living on the site (marketing only).
- Paid ads or SEO as the primary acquisition channel. SEO/GEO hygiene is implemented as best practice, but the conversion path is sent links — not strangers ranking us into existence.
- Standalone developer documentation portal (linked from the site, not hosted on it).
- Localized non-English versions (English-only for now, covering all named target markets).

---

## Inputs (What do we have?)

| Category | Asset | Status |
|---|---|---|
| Brand assets | Basic logos exist; visual system, tone-of-voice, and messaging guidelines | Needs update |
| Audience data | Primary persona: Product Manager for Agentic AI in US payroll companies. Secondary industries scoped: insurance (EU), payment/finance (EU, Germany), medical AI (EU), AI agent security (EU AI Act), real estate title & escrow (US) | Partial — primary persona clear; per-industry buyer detail needs to be sharpened |
| Market research | Competitor analysis and positioning documents | Available |
| Content assets | Existing copy drafts, case studies, and worked examples for some industries | Available — coverage uneven across verticals |
| Channels | The website itself (this project); outbound founder email/DM; partner / warm referral; personal social (LinkedIn, Twitter, Substack) | Available |
| Budget | [TBD — confirm with finance] | Pending |
| Tools | CMS / build stack / hosting / analytics platforms | TBD — needs decision |

> Every input must feed at least one activity below. An input without a consumer is noise.

---

## Causal Chain

### Assumptions

List conditions that must hold but are outside our control. Each assumption inverted is a risk.

1. A non-technical decision-maker who receives a sent link can grasp Aqua Protocol's practical value within the first ~2 minutes on the homepage — without prior context.
2. A technical evaluator (developer, architect, security lead) inside a target buyer will follow links to deep-dive pages and does not need protocol detail surfaced on the homepage.
3. Industry-specific landing pages convert sent prospects better than a single generic pitch — the per-industry effort pays back.
4. AI adoption pressure and emerging regulation (EU AI Act, agentic-AI security needs, US compliance shifts) are real buying triggers in the named industries — not just our framing of them.
5. Sent links arrive in contexts where recipients are willing to spend 2–10 minutes engaging (warm intro, follow-up after a meeting, active outbound).
6. Founders' personal social distribution (LinkedIn, Twitter, Substack) reaches people whose buying interest can be converted on-site.

### Activities -> Outputs -> Outcomes

#### Activity 1: Build the homepage (universal entry point for sent links)

- **Input required:** Brand assets; primary persona; positioning docs.
- **IF** we build a homepage that explains Aqua Protocol's value in concrete, non-technical terms within the first scroll, with a clear primary CTA (book a demo) and visible paths into industry pages and technical deep-dives,
- **THEN** we produce a single canonical landing surface that every sent link can point at,
- **AND IF** a non-technical PM can read the first scroll in under 2 minutes and articulate "what Aqua does and why it matters,"
- **THEN** that prospect either books a demo, clicks into an industry page, or replies to the sender with substantive interest.

#### Activity 2: Build per-industry landing pages

- **Input required:** Industry-specific positioning; case studies / drafts per vertical.
- **IF** we build a dedicated landing page for each target industry (US payroll, EU insurance, EU/DE payment-finance, EU medical AI, AI agent security, US real estate title & escrow),
- **THEN** we produce industry-specific entry points that map Aqua to a concrete pain in that buyer's world,
- **AND IF** the framing reflects what the prospect is actually feeling (regulation, AI agent risk, trust gaps),
- **THEN** industry-matched sent links convert at a higher rate than the generic homepage.

#### Activity 3: Build technical deep-dive pages

- **Input required:** Existing technical drafts; protocol documentation; security model write-ups.
- **IF** we build dedicated pages for technical evaluators (architecture overview, security model, integration approach, links out to full developer docs),
- **THEN** we produce a credible technical depth path that does not clutter the homepage,
- **AND IF** technical evaluators inside a target buyer follow these links and find what they need,
- **THEN** they validate Aqua internally and unblock the buying decision for their commercial counterpart.

#### Activity 4: Build case studies / proof pages

- **Input required:** Customer or pilot stories; testimonials; worked examples per industry.
- **IF** we publish case study pages tied to specific industries (real customers where available, well-developed worked examples otherwise),
- **THEN** we produce credibility artifacts that sent links and industry pages can lean on,
- **AND IF** prospects see a peer or peer-shaped scenario using Aqua,
- **THEN** trust rises and the demo CTA's pull strengthens.

#### Activity 5: Build company / about / team pages

- **Input required:** Founder bios and narrative; brand voice (once established).
- **IF** we publish about, team, and contact pages with a credible founder and company narrative,
- **THEN** we produce the trust-building corporate surface every prospect eventually checks,
- **AND IF** the team narrative is credible to a serious B2B buyer,
- **THEN** "who is behind this protocol" stops being a blocking objection.

#### Activity 6: Wire conversion paths and measurement

- **Input required:** Analytics tooling; demo-booking system; inbound-reply tracking process.
- **IF** we wire demo booking, scroll depth, time-on-page, multi-page session tracking, and a manual inbound-reply log,
- **THEN** we produce observable signals corresponding to each acceptance criterion,
- **AND IF** the analytics fire correctly across pages,
- **THEN** we can verify outcomes (engagement, conversion) rather than only confirming pages shipped.

#### Activity 7: SEO/GEO hygiene (not acquisition)

- **Input required:** Page structure, metadata, structured data, performance budget.
- **IF** we apply baseline SEO/GEO best practice (semantic HTML, metadata, schema, fast LCP, accessible structure),
- **THEN** we produce a site that is technically discoverable and shareable without depending on this for traffic,
- **AND IF** sent links and personal-social shares dominate distribution,
- **THEN** SEO/GEO hygiene compounds organic discovery as a slow secondary channel — but the project's success does not hinge on it.

### Impact

**IF** all outcomes above are achieved — sent prospects engage, technical evaluators validate, industry-matched prospects convert, the team narrative removes objections, and the analytics let us see all of this — **THEN** the website wins clients and gains partners through warm-link conversion, fulfilling the stated goal.

**Sufficiency check:** Outcomes above primarily target client conversion (the explicit priority). Partner recruitment is served indirectly through Activities 1, 4, and 5 (homepage, proof, team) — likely sufficient but worth a dedicated review once we have early partner-channel data. If partner conversion lags, add Activity 8: a partner-specific page or motion.

---

## Boundary Conditions

| Category | Detail |
|---|---|
| **Invariants** | The site must work for both technical and non-technical readers on every page where both could land. No hype-without-substance. Protocol claims must be verifiable (link to evidence). Brand voice consistent across pages once tone-of-voice is set. |
| **Exclusions** | No product app, login, or self-serve onboarding on the site. No paid-ads or SEO-as-acquisition strategy. No standalone developer-docs portal hosted here. No localized non-English versions yet. |
| **Risks** | (1) Homepage fails the 2-minute test for non-technical readers — Aqua remains abstract, sent links die on arrival. (2) Per-industry effort fragments execution without producing measurable lift over the homepage. (3) Brand-voice gap (assets need work) leads to inconsistent tone across pages and dilutes credibility. (4) Analytics or booking instrumentation lags the page launch, so we ship pages but cannot verify outcomes. (5) Content coverage is uneven across the six target industries — some get strong proof, others ship empty. |
| **External factors** | EU AI Act enforcement timeline and interpretation. Pace of agentic-AI adoption in target industries (especially US payroll, the primary persona's home). Competitive movement in trust-infrastructure / verifiable-AI / provenance space. Platform changes on LinkedIn / Twitter / Substack that affect founder-distribution reach. |

---

## Validation Plan

| What to validate | How | When |
|---|---|---|
| Each page exists and meets spec | Page review checklist: audience clarity, primary CTA, working links, brand voice, performance budget | After each page completes |
| Non-technical 2-minute test (Activity 1) | Show the homepage to 5 unbiased non-technical readers; ask them to explain Aqua and its value after 2 min; pass = ≥4/5 land it | After homepage v1, again after v2 |
| Industry-page lift over homepage (Activity 2) | Compare demo-booking and engagement rates for sent links pointing at the matched industry page vs. the homepage for the same buyer profile | 2–4 weeks of sent-link data |
| Demo bookings from sent links | Booking-system attribution by referrer / UTM; weekly count by source (founder outbound, partner referral, social) | Weekly |
| Engagement depth | Time-on-page, scroll depth, multi-page session rate, return visits, segmented by entry page | Weekly |
| Inbound reply signal | Manual log of substantive replies, partnership inquiries, and follow-ups attributable to sent links | Weekly |
| Technical-evaluator path works (Activity 3) | Track click-through rate from homepage / industry pages into deep-dive pages; cross-check with sales-conversation feedback on what evaluators ask about | Monthly |
| Team / about narrative removes objections (Activity 5) | Sales-call qualitative feedback: are prospects still asking "who are you and why should I trust this?" after visiting | Monthly |
| Impact on pipeline | KPI review: demos booked → qualified opportunities → pilots / partner agreements signed | Monthly |

> Output ≠ Outcome. "We shipped the industry page" (output) is not the same as "matched prospects are converting on it" (outcome). Verify the outcome, not just the deliverable. Stop if the chain breaks: if the homepage fails the 2-minute test, do not keep building industry pages on top of a broken foundation — fix the foundation first.

---

## Working Notes for Claude

When working on tasks inside this project, Claude should:

- Treat this logic model as the source of truth for scope. If a request falls under "Out of scope" or "Exclusions," flag it and ask before proceeding.
- For any new page, copy artifact, or campaign idea, name the activity it belongs to and the assumption it depends on. If it does not map to one, the model needs updating before the work starts.
- When proposing new content, default to the "non-technical 2-minute test" framing first, then layer in technical depth via deep-dive pages — not on the homepage.
- Track every page against the validation table. Shipping ≠ done. Done = outcome observed.
- Surface assumption failures early. If user testing or analytics contradict an assumption above, raise it before continuing execution and propose a revised chain.
