---
layout: default
title: "What a Coding Agent Taught Me About A/B Test Telemetry"
description: "I had never run an A/B test. A coding agent designed the scan-session events and the BigQuery layer it now queries to answer my questions."
date: 2026-09-24
lang: en
locale: en_US
translation_key: price-tag-scanner-ab
permalink: /en/articles/price-tag-scanner-ab/
nav_exclude: true
---

# What a Coding Agent Taught Me About A/B Test Telemetry

We had three designs for a new price-tag scanning screen in an Android app used by store staff. Claude Design produced the mockups, I showed them to colleagues and ran a vote. There was no clear winner.

So I suggested the obvious thing: if we can't decide, let the users decide. A routine Android task turned into an A/B/C test.

A coding agent wrote the new screen and all three layouts. That turned out to be the easy part, because I had never run an A/B test. I knew the idea from articles and videos: split users into groups, show different variants, collect metrics, compare. Between that description and a real experiment in production there were a lot of questions I couldn't answer:

- Which events should the app send, and with which parameters?
- How do you tell a normal scan attempt from a user who just closed the screen?
- How do you measure time?
- How do you tell "the code wasn't recognized because the user left" from "the app crashed"?
- How do you compare stores with very different scan volumes?
- And how do you analyze any of this afterwards?

Instead of reading another round of abstract examples, I went through the whole thing on the real task, with the agent. This post is about the parts you can reuse: the event model, the data layer, the traps in the Firebase to BigQuery export, and the one mistake no amount of SQL fixes.

## My first instinct: more actions, more events

My first idea was simple: the more behavior you want to analyze, the more events you send. I started instrumenting a separate event for everything: opening the scanner, a successful scan, an error, a "move closer" hint, various user actions.

The agent proposed a different model. For the experiment it mostly needed two events:

```text
barcode_scan_scanner_session_start
barcode_scan_scanner_session_finish
```

The difference was in what each event carried.

```text
session_start
  session_id, variant (A/B/C), store, device, launch source, ...

session_finish
  session_id, result, code type, scan duration,
  "too far" hints, mismatches during double confirmation,
  focus / zoom / torch usage, decoded on first try, ...
```

This was the most useful thing I learned in the whole project, before a single number came in. I would not have designed it this way myself.

I had thought of analytics as a list of events: something happens, you send an event. The agent effectively designed an entity, a **scan session**, and the two events were just how the start and the outcome of that session got delivered. From then on, questions could be asked about a whole scan attempt instead of about individual clicks.

## Firebase collects the data; it's not where you analyze it

Sending events to Firebase Analytics is easy. Analyzing this experiment in the Firebase console quickly isn't:

- start and finish are separate events;
- parameters are nested inside `event_params`;
- the two events have to be joined on `session_id`;
- sessions with a start but no finish have to be counted;
- results need slicing by variant, store, business unit and device model;
- you want p50 and p75, not just averages;
- the raw daily and intraday tables must not produce duplicates.

I had never worked with the Firebase Analytics export to BigQuery. The agent explained why the analysis needed it and then walked me through the setup: where to go, what to enable, what to click.

The learning order was reversed. Normally it's documentation, then an example, then test data, then finally a real project. Here the real task, the real events and the real users came first, and I learned exactly as much BigQuery as the agent needed to keep going.

## One row per session

Once the export worked, the next problem appeared. Raw Firebase events are an awkward interface even for an agent. To answer "how many successful sessions did variant B have?" you have to unpack `event_params`, find each start, find its finish, join them on `session_id`, handle missing finishes, and only then compute the metric. Doing that in every query means repeating a large block of SQL over and over.

The agent proposed a separate dataset, `scanner_ab`, with a prepared table `scanner_ab.sessions` in which **one row is one scan session**:

```text
Android app
  ↓
Firebase Analytics
  ↓
BigQuery events_*          (raw export)
  ↓
scanner_ab.sessions        (one row = one scan session)
  ↓
analysis queries
```

This is where I understood why analytics people build prepared layers at all. Raw events stay raw. The prepared layer turns them into the business entity you actually ask questions about.

## The traps between "export enabled" and "numbers you can trust"

This is how the pipeline actually works, including the details I would not have known to look for.

**Reaching BigQuery from a sandboxed agent.** The agent runs in a sandbox whose network policy blocks the BigQuery API. Instead of fighting that, it goes through Cloud Shell:

```bash
gcloud cloud-shell ssh --authorize-session --quiet \
  --command="bq query --use_legacy_sql=false '<SQL>'"
```

- Multi-line SQL with nested quotes is base64-encoded locally and decoded on the Cloud Shell side.
- The shell tool's timeout is raised to five minutes or more, otherwise long queries get cut off mid-run.
- Success is judged by reading stdout and stderr, not the exit code: `bq` sometimes exits with 0 after an internal error.

**`events_*` also matches the intraday tables.** A wildcard `FROM events_*` includes `events_intraday_YYYYMMDD`, so on the day the daily table lands, the same events show up twice. Deduplicate by `session_id`, or filter with `_TABLE_SUFFIX NOT LIKE 'intraday%'`.

**The sessions table maintains itself.** It's updated by a `MERGE` keyed on `session_id` over a sliding window of `events_*`, which also absorbs the intraday duplicates, and runs as a daily scheduled query. Analysis never touches the raw events.

**The data disagreed with the documentation.** The experiment runbook said the launch parameter was `source`; in the real events it's `extra_source`. The runbook said a cancelled scan has `result = 'cancel'`; the real value is `cancel_back`. A query written from the docs returns zeros, with no error.

**Every parameter arrived as a string.** Numeric fields need `SAFE_CAST` before any arithmetic or quantiles.

**A metric can die silently.** `torch_used` stopped meaning anything once the torch button was removed on devices without a flash unit. The field is still in the data; it just no longer says anything about lighting.

## Asking questions instead of writing SQL

I now practically don't write these queries. I ask the agent in plain language:

> Compare A/B/C for the last three days.

> Break the results down by business unit.

> Analyze by device model.

> In the analytics there's a drop. Compare it with Crashlytics.

The agent works out which data it needs, writes the SQL, runs it and returns a table. One sentence from me can turn into a long query: period filtering, session assembly, `UNNEST(event_params)`, joining start and finish, checking for incomplete sessions, grouping by store and device, quantiles, guardrail metrics, cuts by variant. I couldn't write those queries without first learning BigQuery and analytical SQL properly.

The result comes back as a table with roughly this shape (illustrative, not real numbers):

| Variant | Sessions | Success | Cancel | p75 | TooFar |
|---|---:|---:|---:|---:|---:|
| A | … | … | … | … | … |
| B | … | … | … | … | … |
| C | … | … | … | … | … |

Then I ask the next question: "Now split B by tablet model", or "Is this a widespread problem or a few specific stores?"

What makes this work isn't that an LLM can write SQL. LLMs have done that for a while. It's that the agent designed the data it was later going to analyze: it chose the telemetry, implemented it in the app, explained how to get raw events into BigQuery, proposed the prepared layer, and then started using that layer for its own queries.

## The mistake SQL can't fix: what is your unit of experiment?

In our experiment, the variant is assigned to a **store**, not to a person or a scan.

That means a thousand scans in one store are not a thousand independent participants. If one large store scans far more than the others, you can't pour all sessions into one table and declare a winner. The analysis has to happen at the store level first, and only then can variants be compared.

On top of that, stores differ in things the experiment doesn't control: tablet models, lighting, staff, load, local technical problems.

The agent can find these limitations and build the right cuts. But the final conclusion can't become "the AI said B is better." Someone has to understand how the experiment was set up and what conclusion the data actually supports. Otherwise you get a very tidy table with the wrong meaning.

## The same telemetry turned out to be a diagnostic tool

At one point the data showed a noticeable drop, and the question changed from "which variant wins?" to "why did the numbers get worse?"

Because every attempt is a session, the same layer could answer that too: split the problem by store, by business unit, by device model; check whether it's one person, one tablet or a broad change; then line up the moment of degradation with Crashlytics. The pipeline built for a product experiment became part of a technical investigation.

The session model helps here in a way separate events don't. Cancelling the scanner is an explicit result inside `session_finish`. A session that has a start and no finish at all is a different signal, and that is the one worth checking against crash reports.

## What you can reuse

If you're instrumenting your first experiment:

- **Model the attempt, not the clicks.** A `session_start` / `session_finish` pair with a shared `session_id` and rich attributes gives you a complete record of each attempt. Many small events give you fragments you have to reassemble.
- **Put the variant and the context in the start event.** Variant, store, device and launch source are what you'll slice by later. If they're not on the session, every analysis starts with a join you didn't plan for.
- **Make "no finish" distinguishable from "cancelled".** An explicit cancel result plus a missing-finish count separates users who gave up from sessions that never ended.
- **Export to BigQuery early** if you need joins, quantiles and slices. The Firebase console is for collecting, not for this kind of analysis.
- **Build one prepared table with one row per attempt** and point every question at it, instead of re-deriving sessions from raw events in each query.
- **Check the real parameter names and values before trusting any metric.** Documentation drifts; a wrong value doesn't fail, it just returns zero.
- **Watch the `events_*` wildcard.** It includes the intraday tables and double-counts the day the daily table arrives.
- **Decide the unit of the experiment before reading any table.** If variants are assigned per store, analyze per store first.

## Who did what

The coding agent defined the events and their attributes, implemented the instrumentation in the Android app, explained why the analysis needed BigQuery and guided me through the export setup, proposed and built `scanner_ab.sessions`, and now writes and runs the queries, checks data quality, builds the cuts and compares drops with Crashlytics.

I brought the product question, asked the questions in plain language, and remain responsible for the part that doesn't come out of a query: how the experiment is set up and which conclusion the data actually allows.

I didn't become a BigQuery specialist or an analyst. But I can now work on a task that previously would have required learning several new tools first. I don't work with BigQuery through SQL; I work with the agent in the language of engineering questions, and the agent works with BigQuery through SQL.
