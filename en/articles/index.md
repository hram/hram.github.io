---
layout: default
title: Articles
description: "Real-world case studies on building software with coding agents: what I delegate, where agents fail, how I verify the work. Android and beyond."
lang: en
locale: en_US
translation_key: articles
permalink: /en/articles/
nav_order: 1
---

# Articles

Real-world engineering case studies about building software with coding agents: what I delegate, where agents fail, how I verify their work, and what remains the engineer's responsibility.

Original articles in Russian: [Статьи]({{ '/articles/' | relative_url }}).

## One Layout Wasn't Enough: Rendering a Whole Android Screen Without Running the App

How a coding agent got a composed Android screen — an Activity with a toolbar, a Fragment, RecyclerView rows and a loading overlay — rendered from real XML with explicit data, plus a replay recipe for every render.

[Read the article]({{ '/en/articles/android-ui-renderer-composed-screens/' | relative_url }}){: .btn .btn-blue }

[The android-ui-renderer-mcp project](https://github.com/hram/android-ui-renderer-mcp)

## What a Coding Agent Taught Me About A/B Test Telemetry

How a coding agent designed the analytics for an A/B/C experiment with a new Android price-tag scanner: a scan-session event model, the Firebase to BigQuery export, and a one-row-per-session layer it queries for me.

[Read the article]({{ '/en/articles/price-tag-scanner-ab/' | relative_url }}){: .btn .btn-blue }

## One Master Prompt, Five Steps: How a Coding Agent Built a 4-Platform Kotlin App

The real prompts behind a self-hosted Kotlin Multiplatform messenger: an architecture-contract master prompt and five sequential steps, from the shared contract to a self-review. All of them are public.

[Read the article]({{ '/en/articles/family-messenger/' | relative_url }}){: .btn .btn-blue }

[The family-messenger project](https://github.com/hram/family-messenger)

## From a Paper Map to a Problem Split

How I combined a scan of an orienteering map, a GPS track, and an official race
protocol to find recurring mistakes on specific legs of a course.

[Read the article]({{ '/en/articles/orienteering/' | relative_url }}){: .btn .btn-blue }

[The orienteering project](https://github.com/hram/orienteering)

## I Gave a Coding Agent Eyes for Android UI — but an Image Was Not Enough

Why a screenshot of an Android interface was only the first step for a coding agent. And how a View tree made it possible to check layout geometry without manually reviewing every result.

[Read the article]({{ '/en/articles/android-ui-renderer-mcp/' | relative_url }}){: .btn .btn-blue }

## A Coding Agent Almost Fixed My CameraX Bug with a Delay. Why I Stopped It

How we investigated a rotation mismatch between Preview and ImageAnalysis on an Android tablet. And why we stopped the first, seemingly workable fix that relied on a delay.

[Read the article]({{ '/en/articles/camerax-agent/' | relative_url }}){: .btn .btn-blue }

## I Sped Up Development with AI Agents. Testing Became the Bottleneck

Why an AI agent needs an MCP for Allure TestOps when a human can just open a browser — and how the agent started carrying meaning between code, the TMS, and MockServer.

[Read the article]({{ '/en/articles/allure-testops-mcp/' | relative_url }}){: .btn .btn-blue }

[The allure-testops-mcp project](https://github.com/hram/allure-testops-mcp)

## I Didn't Need Another Gas Station Tracker

How a personal family portal stopped being a fuel monitor and became an assistant that decides "go for 95-octane or wait" — and stays quiet until it matters.

[Read the article]({{ '/en/articles/gdebenz/' | relative_url }}){: .btn .btn-blue }

## I Wanted AI to Improve My Resume

Why "update my resume with AI" turned into a private fact base about my own career — and how the agent became more useful once it stopped writing text and started asking questions about metrics.

[Read the article]({{ '/en/articles/career-portal/' | relative_url }}){: .btn .btn-blue }

## How I Turned AI into a Personal Coach

Why screenshots from Mi Fitness stopped being enough after a run — and how a personal portal gave an AI coach the training history, recovery metrics, and how-I-feel context it needed.

[Read the article]({{ '/en/articles/running-portal/' | relative_url }}){: .btn .btn-blue }

[The running-portal project](https://github.com/hram/running-portal)
