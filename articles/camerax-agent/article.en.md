---
layout: default
title: "A Coding Agent Almost Fixed My CameraX Bug with a Delay. Why I Stopped It"
description: "How a coding agent and I traced a CameraX rotation mismatch on an Android tablet, rejected a timing workaround, and verified the root cause."
date: 2026-09-15
lang: en
locale: en_US
translation_key: camerax-agent
permalink: /en/articles/camerax-agent/
nav_exclude: true
---

# A Coding Agent Almost Fixed My CameraX Bug with a Delay. Why I Stopped It

My Android app has a barcode scanner built on CameraX. I ran into a strange
bug on a tablet: turn the device through 180°, and the camera preview on
screen still looks right, but the frames received by the analyzer are
upside down.

It was as though the same camera had two different orientations at the
same moment:

``` text
Camera
├── Preview       → the user sees everything correctly
└── ImageAnalysis → the frame is rotated by 180°
```

The bug itself turned out to be fairly small. How we tracked it down was
more interesting.

Lately, I have been doing almost all my development through coding agents.
For this task, the agent worked directly with the project: it changed code,
ran `adb`, captured `logcat` output, analyzed the results, and updated the MR.

That left one operation it could not yet perform:
physically turning the tablet around.

It made for a rather unusual kind of pair programming.

## “Start Recording. I’ll Rotate the Screen”

One debugging cycle went exactly like this:

``` text
Me: start recording, I'll open the screen

Agent:
Starting a fresh CameraXBarcodeCamera log capture.
Recording started.

Me: the screen is open

Agent:
Recorded: displayRotation=1, imageRotation=0,
frame 1920×1080...

Me: start recording, I'll rotate the screen

Agent:
Starting a fresh log capture for the rotation.
Recording started.

Me: rotated it
```

The agent ran `adb logcat` on the connected tablet, collected data, changed
the instrumentation, and asked me to repeat the experiment.

That is already quite a way from “paste an error into ChatGPT and ask it
to write some code.”

In practice, we were following a standard engineering loop:

``` text
hypothesis
→ adjust diagnostics
→ experiment on the device
→ data
→ next hypothesis
```

The agent was simply handling most of the mechanical work.

## Then Came “Let’s Wait a Little”

At one point, the agent noticed something interesting.

After I physically rotated the tablet, the display-change callback had
already fired, but `previewView.display.rotation` still held the old value.

About half a second later, the value became correct.

The agent’s conclusion was:

> post is not enough. We need to wait for previewView.display.rotation
> to actually change before rebinding.

That was where I stopped the work.

I did not know the right solution yet. I did not know whether we needed a
different listener, whether we should change the `ImageAnalysis` settings,
or whether the problem lay deeper in YUV processing.

But “the value updates a little later, so let’s wait for it and then rebind
the camera” looked like a red flag to me.

Half a second on this tablet. How long on another one? What exactly are we
waiting for? And why should rotating the camera require recreating the
use cases at all?

I asked the agent to stop making fixes and prove the cause first.

## Not “Fix It,” but “Show Me Where the State Diverges”

We added several values to the diagnostics:

``` text
Configuration.orientation
displayRotation
Preview.targetRotation
ImageAnalysis.targetRotation
ImageProxy.rotationDegrees
```

Then we repeated the experiment.

Before rotation, we got:

``` text
Configuration.orientation=2
displayRotation=1
analysisTargetRotation=1
imageRotation=0
```

After rotation:

``` text
Configuration.orientation=2
displayRotation=3
analysisTargetRotation=1
imageRotation=0
```

At that point, the bug was barely a mystery anymore.

The tablet had physically moved from:

``` text
ROTATION_90 → ROTATION_270
```

But to Android, both positions were still landscape:

``` text
ORIENTATION_LANDSCAPE → ORIENTATION_LANDSCAPE
```

So `Configuration.orientation` stayed at `2`.

The display itself already knew its rotation was now `3`. But
`ImageAnalysis` was still using the old value:

``` text
display                 ROTATION_270
ImageAnalysis.target    ROTATION_90
```

As a result, `ImageProxy.rotationDegrees` also stayed at `0`.

We now had more than a hypothesis that “CameraX seems to lag sometimes.”
We had a specific, measured cause: **`ImageAnalysis.targetRotation` was
not being updated when the device rotated through 180°**.

## A Fix Without Waiting or Rebinding

Once we knew that, the fix became much simpler than the original workaround.

The earlier approach had looked roughly like this:

``` text
DisplayListener
→ callback
→ display.rotation still has the old value
→ post
→ still the old value
→ wait
→ get the new rotation
→ rebind CameraX
```

It became:

``` text
OrientationEventListener
→ calculatedRotation
→ Preview.targetRotation = calculatedRotation
→ ImageAnalysis.targetRotation = calculatedRotation
```

The existing `Preview` and `ImageAnalysis` instances are not recreated.

No:

``` text
delay
postDelayed
polling
unbindAll()
bindToLifecycle()
```

We also found a subtle detail: the degrees reported by
`OrientationEventListener` cannot be mapped directly to the
`Surface.ROTATION_*` constant with the same angle in its name. In our case,
the range 45..134° had to map to `ROTATION_270`, not `ROTATION_90`.

Then we ran the same physical experiment again.

Before:

``` text
displayRotation=1
previewTargetRotation=1
analysisTargetRotation=1
imageRotation=0
```

I rotated the tablet.

After:

``` text
orientationDegrees=70..79
calculatedRotation=3
displayRotation=3
previewTargetRotation=3
analysisTargetRotation=3
imageRotation=180
```

The whole chain was finally consistent.

CameraX received the new `targetRotation`, and `ImageProxy.rotationDegrees`
changed from `0` to `180`.

All without recreating Preview/ImageAnalysis or rebinding.

## But the Agent Proposed the Wrong Solution First

Yes. To me, that is the most interesting part of this small task.

You could look at the story and say, “AI made a mistake, so it cannot be
trusted.”

Or you could reach the opposite conclusion: “AI fixed everything.”

Neither works for me.

The agent did an enormous amount of work. It read the existing code, added
diagnostics, collected data from the device, ran `adb`, analyzed logs,
changed the implementation, checked the result again, and finally updated
the MR.

I really did spend almost no time mechanically writing the fix.

But at one point, the agent started optimizing for the wrong model of the
problem: if rotation becomes available later, we need to learn how to wait
for it.

My role was not to write the right five lines of Kotlin faster than the
agent. At that point, I did not even know what those lines were.

My role was to say: **no, first explain why this is happening.**

That changed the direction of the investigation.

Here is a rough breakdown of the work:

| Coding agent | Me |
| --- | --- |
| Read the code | Designed the experiment |
| Added logs | Handled the physical tablet |
| Ran `adb`/`logcat` | Evaluated hypotheses |
| Analyzed the values | Stopped the approach based on waiting |
| Changed the implementation | Required proof of the root cause |
| Checked the new logs | Defined what would count as a correct solution |
| Updated the MR | Accepted the result |

## What I Took Away from This

Discussions about coding agents often seem to boil down to one question:
“Can AI write this code instead of a programmer?”

In practice, I find it more interesting than that.

In this task, the agent’s value was not in generating a few lines with
`OrientationEventListener`. It was in being able to delegate almost the
entire loop:

``` text
find the code
→ add instrumentation
→ run adb
→ collect logs
→ change the implementation
→ check again
→ update the MR
```

Meanwhile, my work moved up a level:

``` text
design the experiment
→ evaluate the hypothesis
→ spot a bad direction
→ demand evidence
→ verify the result
```

That did not make the coding agent infallible. If anything, this case
showed why an uncritical “fix the bug” can end with a perfectly functional
`postDelayed` that stays in the project for years.

I increasingly spend less time being the person who manually performs
every technical step. But I still need to understand **what experiment
we are running, what exactly it proves, and whether we can trust the
resulting solution**.

That is what development with coding agents looks like for me today.
