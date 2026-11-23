---
layout: default
title: "How I stopped reviewing every draft of a Remotion video"
description: "How I use my Remotion MCP App fork to let the agent spot and fix visual issues frame by frame before handing me the MP4 it has reviewed."
date: 2026-11-23
lang: en
locale: en_US
translation_key: remotion-mcp-app
permalink: /en/articles/remotion-mcp-app/
nav_exclude: true
image: /articles/remotion-mcp-app/assets/cover.en.png
---

# How I stopped reviewing every draft of a Remotion video

![With the original Remotion MCP App, the draft and feedback go back and forth between me and the agent. With my fork, the agent handles the review loop and sends me the finished MP4.]({{ '/articles/remotion-mcp-app/assets/cover.en.png' | relative_url }})

I ask the agent to make a video. It sends me a draft. I watch it, spot something that needs fixing, and send back my feedback. The agent makes the change, and I watch it again. This can go on for several rounds.

With my [fork of Remotion MCP App](https://github.com/hram/remotion-mcp-app), I give the agent the task and watch the video for the first time after it has already reviewed it. Along the way, the agent pulls frames, spots problems, fixes the composition, and checks it again. I may never know what was in the earlier drafts.

## Who handles the review loop?

**Original Remotion MCP App** — the agent makes a draft → I watch it and send feedback → the agent revises it → I watch it again.

**My fork** — I give the agent the task → it makes a draft → **it reviews, revises, and reviews again** → I get an MP4 it has checked.

In the original workflow, the next round starts when I review the revision and reply. With the fork, the agent uses my criteria to decide whether it needs another round. This [short demo with Russian captions]({{ '/articles/remotion-mcp-app/assets/video/remotion-frame-review-x-ru.mp4' | relative_url }}) shows how the agent handles the loop on its own.

## How the agent reviews its work

`inspect_frames` gives the agent a contact sheet of numbered frames from the current version directly in the MCP response. The agent can spot a blank opening frame or a title that gets cut off, for example. It fixes the composition and checks those frames again. If the problem persists or a new one appears, it checks again after the next revision.

For a 1920×1080 video, you can give the agent seven frames at 480×270 each. Remotion renders them directly at that size. The full-size video is rendered at the end, when the agent calls `export_video` and gets a link to the MP4.

I watch the finished file and decide whether to publish it. Sampled frames are useful for checking the layout and what appears on screen at specific points. I judge pacing and how smoothly the motion plays by watching the video.

## How to try it

To run the fork locally, you need Node.js 22.22.2 or later. Remotion may download Chrome Headless Shell on the first render. [Requirements and local setup](https://github.com/hram/remotion-mcp-app/blob/main/README.md#run-the-fork-locally)

```bash
git clone https://github.com/hram/remotion-mcp-app.git
cd remotion-mcp-app
npm ci
npm run dev -- --host 127.0.0.1 --port 3000
```

Connect your MCP client to `http://localhost:3000/mcp` using Streamable HTTP. Choose a model that can analyze images in MCP responses.

You can start with this prompt.

> Make a seven-second 1920×1080 video at 30 fps with no audio. Show a user selecting a route on a map. The map and title must already be visible in the first frame. Keep every label legible and fully inside the frame. Use `inspect_frames` to review seven frames, including the first and last frames and the points where scenes change. If you spot a problem, fix it and check the affected frames again. Keep going through this loop on your own. Once the frames meet the criteria, call `export_video` once with `muted: true` and send me the MP4 link.

Download the file while the server is running. If you're calling the tools from a script, use the same session ID when creating, reviewing, editing, and exporting the video. The server accepts `_meta["openai/session"]` or the `x-remotion-session-id` header. [Example MCP calls](https://github.com/hram/remotion-mcp-app/blob/main/examples/android-ui-renderer-x/pipeline.ts)
