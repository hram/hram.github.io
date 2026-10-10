---
layout: default
title: "GitFlow as cement between planning and development"
description: "My GitFlow variant: versioned branches, parallel releases and fixes that move forward. How branches mirror the delivery plan instead of cherry-pick and revert."
date: 2026-10-10
lang: en
locale: en_US
translation_key: hram-git-flow-base
permalink: /en/articles/hram-git-flow-base/
nav_exclude: true
---

# GitFlow as cement between planning and development

![Two bricks, planning and development: on the left the joint is patched by a developer with cherry-pick and revert, on the right it is held together by GitFlow]({{ '/articles/hram-git-flow-base/assets/00-cement-hero.en.png' | relative_url }})

*Versioned branches, parallel releases, and one simple rule: release-planning problems should not automatically become developers' problems.*

"We're not shipping this feature yet. Take it out of the release." "And this one, on the contrary, needs to be pulled into the previous version, urgently." At some point requests like these become a routine part of development. You have to find the commits, run `cherry-pick` or `revert`, check the dependencies, figure out what you touched by accident, and reassemble the release scope.

The Git commands themselves are not the issue. Sometimes they really are needed. What always bothered me was something else: why is it the developer who, by default, fixes the consequences of decisions about release scope and timing?

Over the years I noticed that when the release process is poorly organized, this responsibility gradually migrates to the programmers. Nobody planned in time, somebody changed their mind, a dependency was missed, the dates were never agreed, so the developer will now assemble something out of commits.

For more than ten years, across different projects and companies, I have been using my own variant of GitFlow in which I try not to let that happen.

## A release should be planned, not reassembled at the last moment

The core idea of my approach is fairly strict: **management must plan the sequence of releases and define their scope**. What you call that role (product, release manager, delivery, or a team lead) matters less. What matters is that the responsibility does not vanish between job titles.

Development is responsible for implementing the tasks and for code quality. But developers should not routinely pick commits to match changed release plans.

That is exactly why, in my process, **a release is promoted as a whole**. When we move it from one stage to the next, we carry over the state of the release rather than selecting individual tasks from it by a list.

This does not mean the release scope cannot be discussed or changed. It means the normal place for that decision is planning, not the moment when the code is already assembled and someone asks a developer to pull a couple of changes out of it.

![Release scope is decided in planning, and the release moves to the next stage as a whole: develop/1.25.0 → alpha/1.25.0 with all its tasks]({{ '/articles/hram-git-flow-base/assets/01-plan-then-promote-whole.en.png' | relative_url }})

## Two independent processes: development and distribution

The first important separation is between development and distribution.

![Development and distribution: the develop stage on the left, alpha, beta and prod on the right; the boundary between them is strict and they must not be mixed]({{ '/articles/hram-git-flow-base/assets/02-development-vs-distribution.en.png' | relative_url }})

A development stage is always there. Let's call it `develop`. This is where the team implements the planned tasks and prepares the next version.

Then a different process begins: checking, sign-off, and distributing the release. How many stages it has and what they are called depends on the product. Somewhere `test → stage → prod` is enough. Somewhere you need `alpha → beta → prod`. Somewhere the chain is longer.

A developer does not need to understand how every distribution phase works in order to start on the next version. There are teams and roles for that, responsible for testing, readiness, and release.

![From stages to Git branches: develop, alpha, beta and prod become the branches develop/1.25.0, alpha/1.25.0, beta/1.25.0 and prod/1.25.0; a branch name is a stage plus a version]({{ '/articles/hram-git-flow-base/assets/03-stages-to-branches.en.png' | relative_url }})

For example, one possible route looks like this:

```text
develop/1.25.0 → alpha/1.25.0 → beta/1.25.0 → prod/1.25.0
```

These are not four shared branches for the whole project. They are four stages of one specific version, `1.25.0`. The next version will have its own branches, for example:

```text
develop/1.26.0 → alpha/1.26.0 → beta/1.26.0 → prod/1.26.0
```

and so on.

Code showing up in the next branch does not by itself mean the release is ready or shipped. The decision to promote is made by the people responsible for the stage, based on checks.

In my process, I am the one responsible for the handoff from development to the first distribution stage, as the development lead. For us this handoff is a signature. We hand a release over to testing only when all the planned functionality is implemented, covered by tests, and we have verified ourselves that it works. By doing so we are saying: everything that was planned is done in full, you can test it.

And what if something still didn't make it? Normally that shouldn't happen, but there is a safety net: all new functionality is developed behind feature flags. An unfinished feature can safely travel all the way to production; it simply won't be switched on. There is no need to cut it out of the release with `revert`.

After that, QA and delivery step in: they run their own checks and decide whether the release can move on.

This is how a release gets not only a version number but also a current state: the stage it has reached.

## Several versions live at the same time

Imagine the picture right now is this:

```text
Version   Current stage
1.27.0    develop
1.26.0    develop
1.25.0    alpha
1.24.0    beta
1.23.1    prod
```

This is not an emergency and not an exception. It is the pipeline working normally.

`1.23.1` is already released. `1.24.0` is rolled out to test users, `1.25.0` is in internal testing. `1.26.0` and `1.27.0` are still in development: that is where the team is working on new tasks. Each release lives in its own chain, but they all belong to one product.

The five rows in the table are there for illustration. In real work, three or four versions are alive at once: one on beta, the next in internal testing, one more in active development. Sometimes functionality is ready one or two releases ahead.

![A matrix of versions and stages: stages develop, alpha, beta, prod horizontally, releases from newer to older vertically; each version has its current stage highlighted]({{ '/articles/hram-git-flow-base/assets/04-version-stage-matrix.en.png' | relative_url }})

At this point a question often comes up: where do you create the next release from, if the previous one has not reached production yet?

My rule is this: **a new version branches off from the current stage of the newest version**.

If the newest version is `1.24.0` and it is on `alpha`, then the new `develop/1.25.0` starts from `alpha/1.24.0`.
If the newest version is `1.65.0` on `beta`, then `develop/1.66.0` is created from `beta/1.65.0`.

You don't have to wait for `prod/1.24.0` to start working on `1.25.0`. And you don't need one eternal `develop` branch where the development of all future releases gets mixed together.

![The new version 1.25.0 is planned and branches off from alpha, the current stage of the newest version 1.24.0; there is no need to wait for prod]({{ '/articles/hram-git-flow-base/assets/05-new-release-origin.en.png' | relative_url }})

From here on I will call the version with the smaller number the "older" one and the version with the larger number the "newer" one: `1.24.0` is older than `1.25.0`.

This approach has an obvious consequence: new development can start from a version that is still going through checks. That is a deliberate decision. If bugs turn up later in the older version, they will have to be fixed there and then carried forward. That is exactly what the inheritance rule, described below, is for.

## How this differs from classic Git Flow

Out of habit I call my model GitFlow, but it is better not to confuse it with Vincent Driessen's classic model.

In classic Git Flow there is one permanent `develop` branch. It is the branch of the next release: features are merged into it once it is decided that they go into the nearest release, and a release branch is cut from it for stabilization. As long as there is one release, the scheme works well, and I don't consider it a bad one.

The questions start when the plan is longer than one release. There is no room for release N+2 in that scheme: its features either sit in feature branches waiting for the previous release's branch to be cut, or they get merged into the shared `develop` all mixed together. I have seen both many times. In the first case the branches fall behind the codebase and accumulate conflicts. In the second, `develop` stops reflecting anything definite, and if a feature ends up not being released, it has to be reverted. This is not a defect of Driessen's model, but a consequence of it having room for exactly one future release.

I do it the other way around. The product already has a delivery plan: which releases, in what order, and at what stage. It lives in the tracker; in my case that is Jira. I don't invent a separate scheme for Git. I reflect this plan in branches one to one: each release has its own chain of branches, each stage has its own branch, and the stage of a release on the board determines which of its branches is current.

![Top: the delivery plan in Jira, with release cards 1.27.0, 1.26.0, 1.25.0, 1.24.0 and 1.23.1 in stage columns. Bottom: GitLab, with the current-stage branch of each release in the same columns. A one-to-one match]({{ '/articles/hram-git-flow-base/assets/06-branches-mirror-release-cycle.en.png' | relative_url }})

The branches here are not a separate construction on top of the process but a mirror of the delivery plan: its imprint in explicit form. Several practical things follow from that:

- The next release does not have to wait. As soon as it appears in the plan, it has its own `develop/<version>`, and developers merge into it right away.
- The release scope is visible from the branch itself: `develop/1.25.0` contains what was planned for `1.25.0`, not everything that happened to get merged.
- The question "what do we revert" comes up rarely, because the scope is defined by the plan in advance and unfinished functionality is hidden behind a feature flag.

This comes at a price. Versions are isolated by scope, but they are not independent: a fix made in an older version has to be carried into all the newer ones, and the developers resolve the conflicts along the way. More on this rule below.

And a mirror does not make the plan better. If the plan is chaotic, the branches will show the same chaos. The difference is that it will be visible in the branches right away, instead of hiding in a queue of feature branches waiting for their release.

## While 1.24.0 is being tested, the team is already building 1.25.0

Here is a real situation from my project.

We created `develop/1.25.0` and started working on new tasks. At that time the previous version, `1.24.0`, was still at the `alpha` stage.

The testers found a bug. They may find a few more; for the process that changes nothing fundamental.

What do you do? Stop the development of `1.25.0` until `1.24.0` finally makes it to production? Or fix the defect only in the new version, leaving the old one in an undefined state?

Neither.

The bug is fixed where it was found: right in `alpha/1.24.0`, at the same stage of the same release. QA keeps checking that release to get it to shipping. Meanwhile, the development of `1.25.0` does not stop.

In our scenario, once the testing of `1.24.0` is complete and it is promoted to the next stage, we explicitly carry the accumulated fixes, via a merge request, into the current-stage branch of `1.25.0`. Not one `cherry-pick` at a time, but by merging the older release's changes into the newer one.

![Release 1.25.0 is being developed on develop, release 1.24.0 is being fixed on alpha; after the checks 1.24.0 moves to beta, and the fixes are carried along the dashed arrow, via a merge request, into the current-stage branch of 1.25.0]({{ '/articles/hram-git-flow-base/assets/07-parallel-release-bugfix.en.png' | relative_url }})

Two different movements of changes happen here, and they must not be confused.

The first is horizontal: `1.24.0` goes through its distribution stages, for example `alpha → beta → prod`.
The second is between versions: the changes made in the older `1.24.0` after the branch-off must end up in the newer `1.25.0`.

Note the order: in this example we do not drag every fix into the new version the moment it appears. First the checking of the older release is completed. On other projects the checkpoints may differ, but the requirement itself does not change: fixes must not get lost.

Conflicts do happen in such a merge, but as a rule they are simple. They occur in shared files where different releases each append a line: string resources, the list of feature flags, analytics events. Two new lines, one under the other, simply both stay.

This is what I consider real independence of development from distribution. QA calmly brings its release to the state it needs. Developers carry on with the next version. And the link between them rests on a clear inheritance rule, not on manually picking individual commits.

## Fixes must move forward

I state the rule like this: **a fix made in an older version must end up in all the newer versions that have already branched off from it**. This is that second movement of changes: not through the stages of one version, but between versions.

Where is the line between "fix it at the current stage" and "ship a hotfix"? For us it is at beta. Beta is already a rollout to a test group of users, practically almost a release. If an important bug is found on `alpha`, it is fixed right there and the release moves on. If it is found in `beta/1.24.0`, that is already a hotfix: the fix is made in a new patch version, `1.24.1`, which continues its way from beta.

The same principle works for a critical bug in production.

Suppose a problem is found in `prod/1.62.0` that cannot wait for the next regular release. A patch version, `1.62.1`, is created from that version. The fix goes through its own cycle of checks and release there.

After the release, the fix is carried into the newer releases: for example, into the current stage of `1.63.*`, and then further, if even newer versions have already branched off.

![A bug is found in prod/1.62.0, patch 1.62.1 goes through its own cycle and reaches prod, after which the fix is carried along the dashed arrow into alpha, the current stage of release 1.63.0, and further]({{ '/articles/hram-git-flow-base/assets/08-hotfix-forward-inheritance.en.png' | relative_url }})

## Why not cherry-pick and revert, and what it costs

Over the last five years, as far as I remember, we resorted to `cherry-pick` and `revert` to change a release's scope once or twice. The business really wanted a feature moved into an earlier release, and we went along with it. For me that is the normal difference between a rule and an exception: sometimes a request is worth stepping outside the process.

The problem starts when the exception becomes the way you ship the product. Once selective transfer is a standard procedure, planning gets a cheap workaround: "Let's build everything first and decide what to ship later." As long as there is always a developer with `cherry-pick` at hand, the process has no reason to change.

So we do the opposite: the scope and order of releases are defined in advance, a release moves as a whole, and whatever is unfinished is hidden behind a feature flag. Responsibility is split like this:

- **management** defines the scope and sequence of releases;
- **the development lead** is responsible for the version being ready to hand over to distribution;
- **QA and delivery** are responsible for the checks and for the decisions to promote through the stages;
- **developers** implement the tasks, fix defects, and resolve conflicts when changes are carried between versions.

The approach has a price. You have to run several versions in parallel, remember to merge fixes from older releases into newer ones, and agree on checkpoints and rare exceptions. In a team where the release scope is, as a matter of principle, decided at the last moment and selective delivery of changes is the core business model, this process will be inconvenient.

I am not claiming this is a universal recipe. I am describing why it works for me and why I have been carrying these rules from project to project for more than ten years.

## Instead of a conclusion

GitFlow is usually discussed in terms of branch names and a set of Git commands. Something else matters more to me.

A product has two kinds of work: release planning and development. Different people do them, and both are needed. If there is no reliable joint between them, it gets patched by hand: with requests to "take the feature out", with `cherry-pick`s and `revert`s. The developers pay for it.

My GitFlow is the cement in that joint. The branches are not an invented scheme but the delivery plan in explicit form: each release has its own chain, each stage has its own branch. That is why several releases live at the same time, testing an old version does not stop the development of a new one, and fixes are not lost on the way to the next versions.

**Versioned branches and merge rules only make the agreement about responsibility visible. It is that agreement the joint rests on.**
