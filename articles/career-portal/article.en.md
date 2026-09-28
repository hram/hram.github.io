---
layout: default
title: "I wanted AI to improve my resume. I ended up building a fact base about my own career"
description: "How a personal career portal turned 'update my resume with AI' into a private fact base where an agent asks about metrics and suggests roles, but never invents achievements."
date: 2026-09-19
lang: en
locale: en_US
translation_key: career-portal
permalink: /en/articles/career-portal/
nav_exclude: true
---

# I wanted AI to improve my resume. I ended up building a fact base about my own career

![Career Portal's start page: jobs, projects and generated resumes in one place]({{ '/articles/career-portal/assets/00-start-page.png' | relative_url }})

I want to find a new job. It sounds like a familiar task: open a job board, update my recent positions, add a few achievements, and start applying.

For me, that scenario broke down before I even got to the wording.

Over the last six months, the way I develop software has changed a lot. More and more of the mechanical work — reading a codebase, writing code, fixing things, refactoring, part of the analysis — I hand off to AI agents. Formally I'm still a developer and tech lead. But the familiar line "Android Tech Lead" describes less and less of what I actually do.

And an uncomfortable question showed up: **what job should I even be looking for next?**

I could have opened my old resume and added "working with Claude and Codex." But that felt like solving a new problem with an old method.

That's how the Career Portal started.

At first I thought of it as a more convenient way to prepare a resume with AI. In the end, the resume turned out to be the last step. The core system became a private knowledge base about my own professional life.

## Why I didn't want to start with a job board

A public resume has a strange property: every thought immediately has to look like a finished publication.

Sometimes I just want to write down: I liked working on this kind of task; I don't want this role anymore; on this project I was effectively more than just an Android developer; here I managed people but don't remember the exact team size; this achievement feels important, but I don't know how to phrase it yet.

That's not a resume yet. It's material for a future resume.

There's a more practical barrier too. I don't want every intermediate edit to a public CV to read as a signal that "I'm job hunting again." I needed a place where I could think about my career calmly, without publishing every thought.

So the Career Portal got a plain private "About me" section. I can write there fairly freely. The system says outright: this field is for me only, and AI will use it as context later.

![Free-form profile notes — private context, not a finished resume]({{ '/articles/career-portal/assets/01-profile-private-context.png' | relative_url }})

This is where the project started to diverge from a typical AI resume builder.

The usual flow looks roughly like this:

```text
old CV + job posting → LLM → improved CV
```

The problem is that my old CV was already a heavily trimmed version of my professional history. If I didn't think something was important and didn't write it down for ten years, the model doesn't know about it either.

So I flipped the task around:

```text
facts and context first → then AI → and only then a resume
```

## The resume stopped being the storage for my career

In the Career Portal I keep a profile, jobs, projects, skills, and notes.

The key thing is that context is split by level.

- **Profile** — who I am in general and what I want.
- **Job** — what role I held during that period.
- **Project** — specifically what I did there, with what stack, in what role, and with what result.

That can look excessive until you try to describe several years at one company.

For example, at one company I might have an Android project where I'm responsible for the mobile app and the team. Next to it, a Kotlin/Ktor BFF, where I act as a backend developer and architect. Somewhere else, KMP, internal tooling, CI/CD, or platform work show up.

If you dump all of that into one big "Work experience" field, AI very easily mixes contexts up. Technology from one project ends up next to an achievement from another, and a Tech Lead role starts spreading automatically onto work where I was a regular developer.

So an important principle for me became: **it's not enough to save a fact — you need to save the context in which that fact was true.**

## The most useful thing AI did wasn't generating text

After filling in the profile, you can click "Check profile."

I expected roughly the usual set of advice: trim the text, reorder paragraphs, make the wording stronger.

Instead, the agent started asking questions.

![AI reviews the profile and asks clarifying questions]({{ '/articles/career-portal/assets/02-profile-ai-review.png' | relative_url }})

For example, I wrote that I managed Android teams. The agent asked: **exactly how many people were on the teams?**

I wrote about being fully remote. It clarified: am I considering hybrid in St. Petersburg, or remote only?

I listed several possible career directions. It asked me to define which of these is a current goal and which is just a dream or a possible option.

At the job level, the questions get even more uncomfortable — in a good way.

![Reviewing a job entry: AI looks for metrics, gaps and weak phrasing]({{ '/articles/career-portal/assets/03-job-ai-review.png' | relative_url }})

The phrase "significantly sped up development" stops looking like an achievement. The agent asks: **by how much? Did the release cycle go from six weeks to two? Was it one release a month and now it's four?**

The phrase "reduced incident response time" gets a follow-up: from what value to what value?

Moved development from a contractor to in-house? Good. What was the team size? What was the project's scale? What changed in terms of timelines, cost, or speed?

At the project level, everything gets even more concrete.

![Reviewing a specific project]({{ '/articles/career-portal/assets/04-project-ai-review.png' | relative_url }})

I have a strong number: crash-free rate grew from roughly 60% to 99.8%. There's almost nothing for the agent to improve here — there's a clear "before → after."

Right next to it sits the phrase "significantly sped up development." To me, that's clear: I remember the context and know what I'm talking about. To someone opening the resume for the first time, it's almost an empty claim.

And this is where the Career Portal unexpectedly changed how I think about resumes.

I always assumed metrics were primarily a manager's territory. It turned out that if I want to explain my own work well, I need metrics just as much.

How many people were on the team? How many devices in production? How many stores? How many releases? How did cycle time change? What was the error rate? What volume of operations went through the system?

Not everything has to be measured in money. But there's a huge difference between "I improved the process" and "before → after."

The most useful result of AI's work wasn't that it can write about me. **It's that it can ask about the things I didn't think to write down myself.**

## Then AI asked a more important question: what can this experience even be called

My original problem wasn't that I couldn't phrase `Head of Mobile` nicely.

The problem was that I wasn't sure I should even be looking for `Head of Mobile`.

That's a fundamentally different order of operations.

I don't want to pick a title first and then stretch a biography over it. I want to collect what I actually did as honestly as possible first, and only then see which professional roles follow from that.

So the Career Portal has a "Suggest a role" feature.

AI looks at the profile, experience, projects, stack, and results, then proposes possible positioning options and explains why they fit.

![AI suggests possible roles based on accumulated experience]({{ '/articles/career-portal/assets/05-role-suggestions.png' | relative_url }})

In my case, the options included `Head of Mobile`, `Mobile Engineering Manager`, and later `Lead Android Architect`, `Mobile Platform Lead`, and a few other directions.

Here, the boundary of responsibility matters to me.

AI **doesn't decide who I should be**. It proposes a hypothesis and shows the arguments drawn from my own history. I can accept the role, edit it, or ignore it entirely.

It feels less like a career-guidance test and more like an outside view: "given this set of facts, on the market it could plausibly be framed as these roles."

## One biography, several resumes — and that's fine

When I save a role, it becomes a separate way of looking at the same knowledge base.

![Saved roles: several ways to present one professional history]({{ '/articles/career-portal/assets/06-saved-roles.png' | relative_url }})

This is something I used to phrase worse.

`Head of Mobile`, `Lead Android Architect`, and `Mobile Platform Lead` aren't three different versions of me. It's the same professional history with a different selection of facts.

For `Head of Mobile`, it makes sense to bring team management, hiring, moving development in-house, engineering standards, and release processes to the top.

For `Lead Android Architect` — Android/Kotlin, architectural decisions, stability, modernization, hands-on work.

For `Mobile Platform Lead` — CI/CD, platform mechanisms, feature toggles, KMP, internal engineering infrastructure.

If there's one fact base and AI isn't allowed to invent achievements, this isn't "bending the biography to fit a job posting." It's a normal choice of which part of a real history is relevant.

## Only now does resume generation show up

After choosing a role, the Career Portal can do two things.

The first is help search for job postings in that direction.

The second is assemble a resume for the chosen role.

If I find a specific interesting job posting, I can go even narrower and build a version of the resume tailored to its requirements.

Here I deliberately don't want to build the system around the question:

> "Am I an 82% match for this job?"

I need a different question:

> **"What from my actual experience needs to be shown for this resume to answer this job posting's requirements?"**

That's a different way of framing the task.

In the first case, the system effectively hands down a verdict on the candidate. In the second, the job posting becomes context for selecting and emphasizing facts.

The result is saved as a separate resume.

![Generated resumes for different roles]({{ '/articles/career-portal/assets/07-generated-resumes.png' | relative_url }})

I deliberately leave the last step manual. The portal hands back the result in a form that's easy to review and copy — in the UI and as files — and then I decide what actually gets published.

That's not an incidental detail. I don't want the agent to invent a role, write a document, and then send it out into the world without a human in between. For career data, I don't want that kind of autonomy.

## My accountant wife showed me this isn't just a programmer's problem

Later I made the portal multi-user and loaded my wife's resume into it. She's an accountant.

And the same pattern repeated.

Instead of generic phrases, AI started asking:

- How many legal entities were you handling?
- How many invoices did you issue for clients on average per month?
- How many write-off transactions for materials?
- What was the monthly volume?

In other words, the mechanism turned out to have nothing to do with Android, Kotlin, or software architecture.

A person writes: "I worked on X."

AI answers: "what was the scale of X, and what can back that up?"

And the person goes back to their actual history and fills it in with facts.

To me, that matters more than a model's ability to rearrange words in a resume.

## How it's built technically

The Career Portal itself is fairly down-to-earth in terms of stack: FastAPI, Jinja2, and SQLite. I deliberately didn't build a heavy SPA around the idea.

The database holds a profile, jobs, nested projects, skills, education, notes, roles, generated resumes, and data for working with job postings. You can import PDF/DOCX: the text is parsed first, then a preview is built, and only after confirmation does the data land in the database. If the profile is already filled in, a destructive replacement requires separate confirmation.

Over time, the AI layer also stopped being tied to a single model: the project now has the Claude CLI, the Codex CLI, and an OpenAI-compatible provider. Integration with the job board was added after the first MVP.

The project has kept an interesting genesis trail. In the master plan, the roles were spelled out directly: Claude in chat is the architect, Claude Code is the executor, I'm the owner.

On the question of authorship: an agent wrote every line of the portal's code, start to finish. I didn't write a single line in it, and I didn't read a single line of it either. My part was the task, the roles, the specs, and the decisions about what the product should be.

## There's a problem: after all this work, almost nobody writes to me

At this point I'd really like to end the article on a high note.

Something like: I built a system, AI found the right role, produced the perfect resume, and employers lined up.

That's not the result I have.

I'm currently using the portal for an actual job search. The resume has become much more detailed and evidence-backed. I found plenty of gaps in my own professional history, added metrics, and looked at roles differently.

But there are almost no calls or messages.

I don't know why.

Maybe it's the market. Maybe it's my positioning. Maybe it's the resume itself. Maybe I'm optimizing the wrong part of the process entirely.

There's even an uncomfortable hypothesis: if you spend a long time improving a resume together with AI, you can end up in a local maximum. The document keeps getting more logical to me and to the model, but that doesn't necessarily mean it works better in actual hiring.

I don't have the data yet to state that as a fact.

That's exactly why I don't call the Career Portal a system that "solved my job search."

It solved a different problem: it gave me a place where my professional history is stored separately from its publications; it forced me to turn claims into evidence; it helped me see several possible career roles; it taught me to build different resumes out of the same fact base.

Whether those resumes actually work is still up to the market to prove.

## What I took away from this

Before this project, I thought of a resume as the main document about my own career.

Now — as one of its temporary snapshots.

What actually matters comes earlier: facts, context, projects, real roles, scale, numbers, preferences, and constraints.

If that base is weak, AI will just rewrite weak material nicely.

If the base is good, AI becomes far more useful: it can find a gap, ask an uncomfortable question, suggest an unexpected way to position yourself, and assemble different documents for different purposes out of the same history.

But there are things I don't hand over to it.

It doesn't decide who I should be. It doesn't invent achievements for me. It doesn't decide whether it's worth applying. And it doesn't publish the final version on my behalf.

Probably the main result of this project so far is this:

**I wanted AI to write about me better. It turned out that first I needed to know and prove my own professional history much better myself.**

This project is just one of the stories about how I use AI agents in real development. I've accumulated several of these by now: from Android tools and MCP services to personal portals, automation, and DSP. I've collected them on a separate page — ["A galaxy of AI projects"](https://hram.github.io/project-galaxy.html).

There you can see what's already been built, what tasks I handed to agents, and what those experiments turned into in the end. If any project catches your interest, write to me. There's a good chance the next article will be about exactly that one.
