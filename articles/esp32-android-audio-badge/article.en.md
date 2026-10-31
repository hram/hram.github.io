---
layout: default
title: "When an AI Agent Stopped Just Writing Code and Started Testing the Whole System"
description: "How a coding agent tied an ESP32, an Android tablet and a Kotlin BFF into one test bench: controlled Bluetooth drops, long runs and end-to-end checks."
date: 2026-10-31
lang: en
locale: en_US
translation_key: esp32-android-audio-badge
permalink: /en/articles/esp32-android-audio-badge/
nav_exclude: true
image: /articles/esp32-android-audio-badge/assets/devto-cover-en.png
---

![An AI agent testing the chain ESP32 → Android tablet → Kotlin BFF → MinIO.]({{ '/articles/esp32-android-audio-badge/assets/devto-cover-en.png' | relative_url }})

# When an AI agent stopped just writing code and started testing the whole system

*How one agent process tied together an ESP32, an Android tablet, and a Kotlin BFF — and why the code it wrote was not the surprising part.*

I have been working with coding agents for a long time. Firmware for microcontrollers, Android apps, Kotlin services — I had already handed each of these to agents separately. So it did not surprise me that an AI wrote code for three technology stacks at once.

Something else did.

I watched the agent build, on its own, a chain from a physical Bluetooth microphone to server-side storage. It connected the device to the tablet, started a recording, checked the audio files, deliberately broke the Bluetooth connection, watched it recover, and then tracked the upload of the recordings to the BFF.

At some point I realized I was not looking at code generation. I was looking at an engineering experiment in which the agent was operating almost the entire test bench.

## A task that tests alone cannot verify

A production Android app needed to record sound from an external Bluetooth microphone for the duration of a shift. The app runs on a tablet, including in a restricted MDM mode: the user must not have to go into system settings every time to connect the microphone. The recording has to survive temporary connection drops, be split into segments, and be sent to the server.

An important detail: at first I did not have a suitable microphone for debugging. So I decided to build a test source myself — on an ESP32.

That gave three parts of the system:

![The test bench: sound flows from the ESP32 through the Android tablet and the Ktor BFF into MinIO; the agent controls the ESP32 over UART/USB, the tablet over ADB, and starts the server.]({{ '/articles/esp32-android-audio-badge/assets/fig1-en.png' | relative_url }})

*Fig. 1. The audio path and the tools used to control the bench: solid lines show data transfer, dashed lines show control and observation by the agent.*

But this diagram proves nothing by itself. The interesting part began when the agent gained the ability to control the devices and observe results at every point.

## First, the agent built itself a microphone

We started with an ESP32-WROOM-32 and an INMP441 I2S microphone. The agent proposed Bluetooth HFP: the ESP32 pretends to be a headset, and the Android tablet receives sound over the Bluetooth audio route.

The agent wrote the firmware and a separate Android app for experiments. The first checks quickly showed how different the real system is from the diagram on paper.

On the tablet the recording route looked correct, but the measured signal level stayed around −120 dBFS — effectively silence. The problem sat at the junction of the firmware, Bluetooth SCO, and the audio subsystem of that particular tablet. To get usable sound, both sides had to change: the Android tester opened a silent reverse audio stream, and the firmware corrected how it transmitted PCM. After that the agent reported a successful recording at a level of about −27.3 dBFS.

From the command to start implementation to the first working recording on a real tablet, about two hours fifty minutes passed according to the session logs. Not "in one prompt": with diagnostics, mistakes, and changes on both sides of the connection.

## Firmware that breaks the connection on purpose

For an ordinary demo, recording a few seconds of sound is enough. For a real app it is not: the microphone can disconnect in the middle of a shift, Bluetooth may not come back right away, and the audio files must not be left corrupted.

I set the task of learning to reproduce the drops. The agent added to the firmware commands for controlling the Bluetooth radio over USB and a mode that switched the link off and on on a schedule with random intervals. Then it set up log collection from the ESP32 and the tablet, a check of the WAV files, and an analyzer for long runs.

This was the turning point. The firmware stopped being just a sound source. It became a **controllable fault generator**.

The agent could start a recording on Android, switch off Bluetooth on the ESP32, wait for the audio route to be lost, switch the radio back on, and check that the recording had recovered. It controlled not only the expected result but also the conditions under which that result should occur.

In a short trial, 20 out of 20 disconnect-and-recover cycles passed. Closing the WAV after a drop took from 1.30 to 2.26 seconds. But a short test is not yet proof of stability over a whole shift.

![The verification loop: record, switch off Bluetooth on the ESP32, lose the audio route and close the WAV, switch the radio on, recover the recording, and check logs and files.]({{ '/articles/esp32-android-audio-badge/assets/fig2-en.png' | relative_url }})

*Fig. 2. A controlled connection drop and the recovery check. In the short trial, 20 out of 20 cycles passed.*

## A failure at minute 45 that short tests did not find

The next experiment was supposed to last two hours. The agent prepared a long run with periodic Bluetooth drops and event collection from both sides.

The first run stopped after **45 minutes 44 seconds**. The recording ended because audio focus was lost after a system notification. Up to that point recovery from Bluetooth drops had worked, but the system still could not survive the long scenario.

Here I stepped in on the method of verification: first reproduce the error on the current version, then fix it, and make sure that the reproduction no longer causes a failure.

The agent reproduced it with a real notification on the tablet, changed the handling of transient focus loss, and checked a series of notifications. At the same time, a permanent loss of focus still had to stop the recording — it was not acceptable to simply ignore every event.

Then came new runs. Finally the test app passed the two-hour scenario: **15 Bluetooth drops and 15 recoveries**, 31 WAV files. After the test app was ported to Kotlin, a similar run also passed: **15 out of 15 recoveries**, 32 WAV files.

An important limitation: this was not seamless recording. Sound was lost during the drops — the research recorded gaps of roughly **20–62 seconds**. A successful analyzer result meant that the defined checks passed on a specific bench, not a guarantee of continuous audio under any conditions.

![Test timeline: the first recording, 20 successful short cycles, the failure at 45:44, reproduction and fix, two successful two-hour runs of the test app, and an unfinished run of the production app.]({{ '/articles/esp32-android-audio-badge/assets/fig3-en.png' | relative_url }})

*Fig. 3. Results of the individual runs. The two-hour trials passed in the test app; the run of the production app was cut short by a tablet reboot at about minute 90 and was not counted. The cause of the reboot remains unknown.*

## From the lab app to the production one

We could have stopped here with a nice demo. But I needed the feature in an existing Android app, not a separate prototype.

I demanded in advance that the experimental code be portable into the production project. The agent extracted reusable modules for Bluetooth and recording, then studied the constraints of the target codebase. The Kotlin versions, the Android Gradle Plugin, the SDK, and the build setup differed. So the port was not a simple file copy.

The agent adapted the modules, added a microphone control screen, in-app pairing, and background upload of segments. Older devices needed a separate pairing path that avoids APIs available only on newer Android versions.

## Three stacks in one debugging loop

Later the work reached the BFF. Android had to send WAV segments over multipart HTTP, and the server had to receive them and store them in MinIO.

This is where I saw something I had not observed at this scale before. Within a single agent session, three worlds became tools at once: UART for the ESP32, ADB and logs of a real tablet, and the code and runtime of the Kotlin BFF. The agent switched between them in turn, rather than just passing finished source code from one "developer" to another.

It could control the Bluetooth source, start a recording, watch the files, send them from the tablet, and check the result on the local server. That was my main impression: **the whole data chain became a single object of work for the agent**.

The end-to-end check uncovered a server-side bug that developing the handler in isolation had not revealed: reading the body of a multipart request could block. The agent fixed the reading code using `Dispatchers.IO` and repeated the check from the live tablet. The fix went into the server MR shortly before the merge.

This does not mean that "everything happened at once". The firmware, the test app, and the production changes were created on different days and in different sessions. But afterwards the agent really did work with all three stacks in sequence.

## What works, and what is not yet proven

In the test setup, the agent achieved working recording from the ESP32, in-app pairing, splitting into five-minute segments, recovery after drops, and successful two-hour trials. In the production Android project the corresponding components and background upload of recordings appeared. The BFF learned to accept WAV and store it in MinIO; the end-to-end check was done from a real tablet to a local server.

There is no confirmed check on a real Android 7.1.1, in the target MDM configuration, or with the final commercial microphone model. A ten-hour shift and all production modes have not been tested. The success of a lab bench is an important result, but it is not a certificate of readiness for operation.

## What I did in this story

I did not write every Bluetooth callback by hand, did not launch every recording myself, and did not switch between three IDEs. That part of the work gradually went to the agent.

But I chose **what exactly needed to be proven**. I demanded a real tablet instead of an emulator, reproduction of the failure before the fix, two-hour trials, recovery of the recording after a drop, and compatibility with the production app. I stopped incorrect technical assumptions, reviewed the interface and the code, provided the hardware and physical access, and listened to the recorded sound — something the agent could not do itself.

![Division of work: the agent implements components, operates the bench, and verifies results; the human sets criteria, corrects requirements, provides hardware, and listens to recordings.]({{ '/articles/esp32-android-audio-badge/assets/fig4-en.png' | relative_url }})

*Fig. 4. Specific actions of the agent and the developer in this project.*

This is not a story about the human becoming unnecessary. It is more about how the boundary between my work and the agent's work has moved.

Before, I expected an agent to implement a single task: firmware, an Android feature, or a server endpoint. Here it was able to build, on its own, a test loop between them, trigger a fault, collect evidence, and carry the fix through several systems.

**What surprised me was not three projects written by AI. It was that the agent began to work with them as one real system.**

And that is exactly what I sat there watching.
