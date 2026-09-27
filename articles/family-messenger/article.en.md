---
layout: default
title: "One Master Prompt, Five Steps: How a Coding Agent Built a 4-Platform Kotlin App"
description: "The master prompt and five step prompts a coding agent used to build a self-hosted Kotlin Multiplatform messenger for four platforms."
date: 2026-09-17
lang: en
locale: en_US
translation_key: family-messenger
permalink: /en/articles/family-messenger/
nav_exclude: true
---

# One Master Prompt, Five Steps: How a Coding Agent Built a 4-Platform Kotlin App

I wanted a coding agent to build something with real breadth: a backend, a shared data layer and four client targets (Android, iOS, Desktop, Web) on one codebase, with sync, delivery and read receipts, push notifications and a self-hosted deploy to a plain VPS.

That's not a CRUD app. In a normal team it would involve a backend developer, a mobile developer, someone for web, and an architecture discussion before anyone writes business logic.

Generating code wasn't the part I wanted to test. I wanted to see whether a complex, multi-surface product can be planned well enough that an agent carries it out coherently.

**The project is public on GitHub, and so is every prompt used to build it**, unedited:

- [`prompt.md`](https://github.com/hram/family-messenger/blob/main/promts/prompt.md): the master prompt
- [`step_1.md`](https://github.com/hram/family-messenger/blob/main/promts/step_1.md) to [`step_5.md`](https://github.com/hram/family-messenger/blob/main/promts/step_5.md): the five step prompts
- [github.com/hram/family-messenger](https://github.com/hram/family-messenger): the code they produced

This post walks through what's in those files and why the work was split the way it was. Keep them open in another tab; the wording matters more than my summary of it.

## Who did what

I described the idea to a web LLM (ChatGPT or Claude, I honestly don't remember which). It turned the idea into a large master prompt and then split it into five sequential step prompts. I then handed them one by one to a coding agent, which did the implementation. I didn't write the application code by hand.

So the plan below was drafted by an LLM from my requirements, not typed out by me from scratch. My part was the idea, the constraints I cared about, moving each step to the agent, and checking what came back.

## The problem with a single prompt

"Build me a family messenger in Kotlin" produces *something*. It doesn't reliably produce a system where the backend and four clients agree on the same DTOs, where sync survives a dropped connection, and where deployment is handled separately from application code.

With this much scope, everything is decided at once: data contracts, backend behavior, client architecture and infrastructure. The approach here was to split the work into a **contract** and a **sequence**.

## The master prompt as an architecture contract

The first file, [`prompt.md`](https://github.com/hram/family-messenger/blob/main/promts/prompt.md) (about 33 KB), isn't a feature request. It reads like a solution architect's document that fixes the boundaries before any code exists.

A few of its constraints, translated from Russian:

```text
- backend runs on an Ubuntu 24.04 VPS via Docker Compose, no Kubernetes
- no WebSocket; polling is the main way to get new messages
- FCM push is optional and Android-only; the system must work fully
  without it
- dependency injection on both backend and client goes through Koin
- a separate shared Kotlin module holds the request/response DTOs, enums
  and transport contracts, used by backend AND client, not duplicated
- closed registration by invite code only; no public sign-up
```

It also specifies the REST API (12 endpoints, from `register-device` to `messages/sync?since_id=...`), a single `{success, data, error}` response format, and a PostgreSQL schema with eight tables (`families`, `users`, `devices`, `invites`, `messages`, `message_receipts`, `location_events`, `auth_tokens`) and their fields.

None of this is exotic. These are the decisions a team would normally make in a design review. Here they were written down once, before the agent touched the repository.

## Five steps, each with its own boundary

The master prompt was then split into five step prompts. Each one names what it must *not* do:

| Step | Focus | Explicit constraint |
|---|---|---|
| [1](https://github.com/hram/family-messenger/blob/main/promts/step_1.md) | Monorepo skeleton, shared-contract module, skeleton backend and client wired to it | "Don't fully implement business logic yet; first build the right skeleton and shared contract." |
| [2](https://github.com/hram/family-messenger/blob/main/promts/step_2.md) | The whole backend: routing, auth, Exposed persistence, all endpoints | Use the shared-contract DTOs, no duplicates inside the backend, no TODO stubs instead of logic |
| [3](https://github.com/hram/family-messenger/blob/main/promts/step_3.md) | Infrastructure and deploy: Dockerfile, docker-compose, optional Caddy, deploy docs | No Kubernetes, no complex DevOps stack; understandable to someone new to VPS |
| [4](https://github.com/hram/family-messenger/blob/main/promts/step_4.md) | The whole client on Android, iOS, Desktop and Web: sync engine, local storage, UI | Shared code must be substantial, not decorative; push strictly optional |
| [5](https://github.com/hram/family-messenger/blob/main/promts/step_5.md) | Self-review as a principal engineer | Check the existing project against the contract and fix what can be fixed |

Step 1 stands out because it asks the agent to build *less* than it could in one pass. The shared transport contract had to exist as a real Kotlin module, connected to both sides in the Gradle files, before either side had real logic. The backend and client were built on top of it afterwards, not side by side with separate models.

Step 4 is where the "shared code must be substantial" rule becomes visible. The same panels are reused as a stack on mobile and as a split pane on desktop and web:

![The Kotlin Multiplatform client switching between a mobile stack layout and a desktop split-pane layout]({{ '/articles/family-messenger-habr/assets/adaptive-layout.gif' | relative_url }})

## Step 5: the step that doesn't add features

[`step_5.md`](https://github.com/hram/family-messenger/blob/main/promts/step_5.md) asks for nothing new. It asks the agent to review its own output in eight areas, fix what it can directly in the code, and then list the remaining problems and production risks:

```text
1. shared contract  - do backend and client really use the same DTOs?
2. backend API      - do the real endpoints match the documentation?
3. database/Exposed - are there enough indexes for sync and chat history?
4. infra            - does the backend actually start via Docker Compose?
5. KMP architecture - is commonMain substantial or decorative?
6. sync consistency - initial and incremental sync, retries, reconciliation
7. platform realism - can each target actually be launched?
8. security         - tokens, invite flow, family isolation, validation
```

This is the step that checks the distance between "the repository has 113 files" and "the repository does what the contract said." It's also the one that's easiest to drop once the first build works.

## What the plan produced

The result was roughly 13,000 lines of Kotlin and Gradle across 113 files: a Ktor, Exposed and PostgreSQL backend, a Compose Multiplatform client on all four targets, a shared-contract module used by both, and a deploy to a real VPS. The first large working version took about three days.

I want to be precise about what that proves. I didn't run a human team on the same spec in parallel, so this isn't a benchmark, and I'm not claiming it replaces a team. I spent three years at a company building mobile apps for clients, and my rough estimate for an MVP like this would be several specialists and at least a month. Treat that as one developer's gut feeling, not a measurement.

It also wasn't a finished product after step 5. I used it for about a week on real devices, including my kids' phones, with real push notifications. That's where the limits showed. Message statuses (`LOCAL_PENDING → SENT → DELIVERED → READ`) look simple on paper. In practice the unread counters drifted once several devices were involved. The git history shows the follow-up fixes: authorization, deployment, FCM, long polling, a stale sync cursor, behavior on network errors.

A good plan got me a coherent and large first version. It didn't replace testing against real multi-device use.

## What you can reuse

If you're about to give a coding agent something wider than a single service:

- **Write the constraints before the features.** The useful part of the master prompt isn't "build a messenger." It's "no WebSocket, polling, Koin on both sides, one shared DTO module." These are architectural decisions you make yourself instead of leaving them to the agent.
- **Put the shared contract in its own first step, without business logic.** Then both sides are built against the same compiled models.
- **Give infrastructure its own step** instead of tucking it into "build the backend."
- **End with a self-review against your own contract** as a separate step. Use the eight areas above or your own list.
- **Test the parts only real use can test.** Multi-device and multi-user flows are where a coherent-looking implementation can still disagree with itself.

To adapt this to your own project, start from the real files rather than this summary: [the prompts folder](https://github.com/hram/family-messenger/tree/main/promts) and [the full repository](https://github.com/hram/family-messenger).
