---
layout: default
title: "I wanted to try SolidCraft. I ended up porting my CAD project in nine minutes"
description: "How Codex built a second CAD version of the Androsaur motorized phone stand in SolidCraft and checked it against the original build123d model."
date: 2026-11-21
lang: en
locale: en_US
translation_key: androsaur-stand-solidcraft
permalink: /en/articles/androsaur-stand-solidcraft/
nav_exclude: true
image: /articles/androsaur-stand-solidcraft/assets/cover.en.png
---

# I wanted to try SolidCraft. I ended up porting my CAD project in nine minutes

![Illustration of the Androsaur stand moving from build123d to SolidCraft in 9 minutes and 21 seconds.]({{ '/articles/androsaur-stand-solidcraft/assets/cover.en.png' | relative_url }})

SolidCraft kept showing up in my X feed. I got curious about the tool and how well an AI agent could work with it.

I decided to try it on a real project.

I've been designing [Androsaur Stand](https://github.com/androsaurs/androsaur-stand), a motorized phone stand, in build123d. It's a parametric assembly with two axes of rotation, Pan and Tilt, and a grip that adjusts to the width of the phone.

I asked Codex to port the project to SolidCraft and keep the existing build123d implementation.

**9 minutes and 21 seconds later, the agent reported that the second implementation was ready.**

That genuinely surprised me.

## Rebuilding the mechanism

Importing the parts was the first step.

The agent exported the geometry from the build123d model with the parts in their assembled positions. Then it rebuilt the mechanism in SolidCraft.

It recreated both axes of rotation, Pan and Tilt. It built a parametric grip with an adjustable width. Then it compared the new assembly with the original in four reference poses.

The result was a working assembly I could edit.

I can rotate the assembly around both axes in SolidCraft and change the width of the grip.

The original construction history stayed in build123d. The agent used that project as the basis for a second implementation and checked the result against the original.

The [build script](https://github.com/androsaurs/androsaur-stand/blob/08e38d4/solidcraft/build.py) and [grip parameters](https://github.com/androsaurs/androsaur-stand/blob/08e38d4/solidcraft/grip.json) are in the repository.

## Where the import broke

SolidCraft dropped the lower half of the enclosure during STEP import. The agent added it back as a mesh for visualization, so SolidCraft's solid-body interference checks still skip that part.

[A SolidCraft developer reproduced the issue](https://github.com/tangency-labs/solidcraft/issues/19955#issuecomment-7039263806).

That leaves a gap between the two models.

I still use build123d for 3D printing.

## What surprised me

I started this experiment out of curiosity about a new tool.

I came away with an unexpected result. **With an existing parametric model, an agent can move a design between CAD systems remarkably quickly.**

The original model stays in the project and serves as a reference for checking the new implementation.

How well this transfers to other CAD projects is still open. The nine-minute measurement starts after the initial setup for access to SolidCraft.

I'd never considered that I could get a second working version of my design in another CAD system this quickly.

That was the most interesting thing I learned from trying SolidCraft.
