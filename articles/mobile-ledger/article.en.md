---
layout: default
title: "Don't write the prompt. Get interviewed."
description: "I asked Codex to interview me instead of writing a spec: an hour of questions about a phone-based document camera, then the agent built the app and wired it into PaperLedger."
date: 2026-10-22
lang: en
locale: en_US
translation_key: mobile-ledger
permalink: /en/articles/mobile-ledger/
nav_exclude: true
---

# Don't write the prompt. Get interviewed.

In my [previous article](https://hram.github.io/articles/paper-ledger/) I described how I built PaperLedger, a service that extracts the values I need from photos of paper accounting documents. Almost all the attention back then went to table geometry, OCR and checking the results.

But that pipeline had a problem right at its input. My wife photographed documents with her phone's regular camera and sent them to me over Telegram. Perspective, shadows, glare, blurry text, plus compression during transfer: all of it landed at the input of a system whose quality we had spent a long time improving.

I bought a pantograph tripod and came up with what seemed like a small addition: put an Android phone above the desk, show its image in the PaperLedger browser page and add a "Capture" button. Nothing to press on the phone. Put a sheet down, look at the preview on the computer, take the shot, and the photo shows up among the document's pages.

The stack seemed obvious: Kotlin, CameraX and some way to pass a JPEG along. It looked like one small app's worth of work.

Instead of a technical specification I asked Codex to interview me: to find out the stack, the architecture and the boundaries of the decisions. The conversation itself took about an hour. After that the agent built the Android app, moved into the existing Python portal and connected the two.

**What is most interesting in this story, in my view, is not the speed of writing code but the number of decisions that had to be made before any code existed.** That is why I include the interview in full below. No selection of the "smartest" questions: different readers may notice different things in it.

## First, I asked for an interview

The agent's first reply was a list of ten questions. I stopped it right away: "one question at a time. 10 questions is not an interview."

After that we really did go one question at a time. I answered briefly, sometimes changed the scenario it offered, sometimes disagreed with the boundaries of the task. There were questions I would never have thought of myself, for example about several browser tabs open at once. There were also mistakes by the agent: in particular, it questioned me at length about integration with PaperLedger before looking at its code.

Not every point from the conversation made it into the first implementation. That matters too: **the interview captured the target scenario and the boundaries, not a list of features automatically declared done**.

## The full interview transcript

Below is the original dialogue, from the first statement of the task to the moment the agent proposed starting on the prototype. **All 72 author messages and 71 final agent answers are given without cuts.** Times are UTC. The transcript is translated from Russian, so the typos of the original are not reproduced. The service's external address is replaced with `<PAPER_LEDGER_URL>`. The agent's reasoning and tool commands were not part of the transcript from the start. Links to local files inside messages are kept as part of the original conversation.

### The interview

**Author** · 18:59:56 · L56

> we're starting a new project, mobile-ledger: it's a camera on an Android phone for photographing documents and sending them to paper-ledger. interview me about the project. ask questions to determine the tech stack, architecture and boundaries of the solution

**Agent** · 19:00:18 · L59

> Let's start with the main scenario and constraints: they determine the stack and the architecture. After that we'll clarify image processing, integration with paper-ledger and how the app is structured. You can answer briefly by number; if a decision hasn't been made yet, just say so.
>
> 1. Who will use the app: only you, a small team or external users? How do you plan to distribute it: APK by hand, corporate installation, Google Play?
>
> 2. What does the main scenario look like? For example: open the camera → shoot several pages → review and reshoot → choose an organization or document type → send. Which of this is needed and which is superfluous?
>
> 3. What counts as one document: a single shot, a set of pages, or a whole batch that paper-ledger then splits up by itself?
>
> 4. What can paper-ledger already do to receive documents? Is there an API, authorization, file upload and processing tracking? You can answer "study it yourself", and I'll look at the project.
>
> 5. Should shooting work without internet with sending later? Does the queue need to survive closing the app and rebooting the phone?
>
> 6. What processing is needed on the phone: finding the sheet's edges, perspective correction, cropping, contrast enhancement, text recognition? What is mandatory for the first version and what can be left to the server?
>
> 7. Which phones must the app work on: your specific model or a wide range of Android devices? Is an iPhone version needed in the foreseeable future?
>
> 8. Do you have preferences or constraints on technology: Kotlin and native Android, Flutter, React Native? Who will maintain the code and how important is it to you to reuse paper-ledger's technologies?
>
> 9. What are the requirements for documents on the phone: can they be stored locally, should they be deleted after a confirmed upload, is processing by third-party cloud services acceptable?
>
> 10. What result of the first version will be enough for you to start using it? Name the mandatory features and what is definitely not part of this stage.

**Author** · 19:00:42 · L66

> one question at a time. 10 questions is not an interview

**Agent** · 19:00:47 · L69

> Who will use mobile-ledger: only you or other people as well?

**Author** · 19:03:39 · L76

> paper-ledger is a project for my wife, it has functions for processing paper documents. my wife photographs them and sends them to me. when my wife takes photos there is a lot of distortion in them. because she shoots with the regular app. mobile-ledger is an add-on to paper-ledger for photographing and automatically uploading the photos. think of it as a Document camera for the paper-ledger project which only my wife uses.

**Agent** · 19:03:42 · L79

> Understood: mobile-ledger is a document camera for your wife that helps get flat, legible shots and automatically passes them to paper-ledger.
>
> What spoils the current photos most often: perspective and cropped edges, blurry text, shadows and glare, or something else?

**Author** · 19:04:25 · L86

> all of what you listed plus sending them through telegram, it compresses photos heavily

**Agent** · 19:04:29 · L89

> So we need to improve shooting quality and send originals straight to paper-ledger, without Telegram compression.
>
> Is it acceptable to prompt your wife while shooting ("hold it steadier", "too dark", "freeze") and take the shot automatically when the sheet is clearly visible, or should she press the button herself?

**Author** · 19:07:32 · L96

> yes the prompts are straight fire, drawing a grid, preprocessing... table recognition and alignment to them, everything that can be squeezed out of the phone's processor should be done. But at the first stage it's fine without prompts. I bought a pantograph tripod so the camera will be positioned level, but she still needs to be watched and helped

**Agent** · 19:07:35 · L99

> Noted: we want the maximum useful processing on the phone, including prompts and alignment; we'll introduce it gradually. The tripod will simplify shooting, but quality control is still needed.
>
> Which phone will your wife use the app on, what model? That will help determine what processing can be done right while shooting.

**Author** · 19:12:41 · L106

> xiaomi redmi 12

**Agent** · 19:12:44 · L109

> We're targeting the Xiaomi Redmi 12; we'll check processing speed on it.
>
> Does your wife usually shoot single sheets or multi-page documents whose pages must be merged before sending?

**Author** · 19:13:34 · L116

> once there was a document of 8 pages, and documents per day are 50-60-70..

**Agent** · 19:13:37 · L119

> At 50–70 documents a day a quick move to the next document matters, and one document can have several pages inside.
>
> How should your wife mark the end of a document: press "Done" after its last page so that the app sends the document and immediately moves on to shooting the next one?

**Author** · 19:15:12 · L126

> I think the shot control should be in the paper-ledger project, from which commands should be sent to mobile-ledger. that is, ideally nothing needs to be pressed on the phone at all. put it on the tripod and use it as a Document camera

**Agent** · 19:15:16 · L129

> Then the phone is a stationary document camera, and paper-ledger controls shooting and merging pages.
>
> Will your wife work in paper-ledger on the computer next to the tripod, to see the image from the camera and give the shoot command?

**Author** · 19:16:31 · L136

> yes on the computer. in the paper-ledger project she looks at the camera from the phone and from the paper-ledger project gives the shoot command. puts down a new document and so on in a circle

**Agent** · 19:16:35 · L139

> Understood: on the computer, paper-ledger shows the camera stream; your wife puts down a sheet, presses "Capture" and swaps the sheet. The phone takes a high-quality shot and uploads it automatically.
>
> Will the computer and the phone always be on the same local Wi-Fi network, or must the connection also work over the internet from different networks?

**Author** · 19:17:23 · L146

> let's start with one network

**Agent** · 19:17:25 · L149

> For the first version the phone and computer work on the same local network.
>
> Where does paper-ledger itself run: on this same computer, on another device at home or on a remote server?

**Author** · 19:18:00 · L156

> paper-ledger runs on my home server, and my wife uses it at work

**Agent** · 19:18:04 · L159

> So the phone and computer are on the same network at work, and the paper-ledger server is at home.
>
> Does the network at work allow devices to reach each other, or is that unknown for now? It determines whether we can pass video directly between the phone and the browser.

**Author** · 19:19:50 · L166

> unknown for now. if needed we can make an intermediate little server that would run on my wife's computer and join paper-ledger and mobile-ledger

**Agent** · 19:19:53 · L169

> We'll keep a local program on the computer as an acceptable option.
>
> Is it acceptable for the first version that your wife opens mobile-ledger on the phone once and leaves it with the screen on, charging, for the duration of the work?

**Author** · 19:20:38 · L176

> no let's do background operation right away

**Agent** · 19:20:42 · L179

> Fixing it: operation with the screen off. On Android the camera in that mode needs a foreground service, a service with a permanent notification; we'll check behavior on Xiaomi separately.
>
> After the phone reboots, is it acceptable to open the app once and start the camera, or is a fully automatic start required?

**Author** · 19:21:10 · L186

> yes it's fine to open it once

**Agent** · 19:21:18 · L189

> Then after a reboot your wife starts the camera once, and from there controls it from paper-ledger.
>
> Do you have preferences for the mobile app stack, or should I choose it for Android and camera handling?

**Author** · 19:22:48 · L196

> kotlin, compose, ideally cross-platform with KMP (in case the project takes off so that iOS works too), CameraX

**Agent** · 19:22:57 · L199

> Fixing Kotlin, Compose and CameraX for Android, with KMP for shared logic and a possible iOS version.
>
> Is it acceptable to include ready-made document-processing libraries, including native ones, or are there constraints on licenses, paid SDKs and dependence on Google services?

**Author** · 19:24:29 · L206

> too general a question. let's decide each library individually

**Agent** · 19:24:33 · L209

> We'll choose libraries one at a time, for specific tasks.
>
> Should shots be kept on the phone until paper-ledger confirms it received them, and uploads retried automatically after a connection drop?

**Author** · 19:25:19 · L216

> yes

**Agent** · 19:25:28 · L219

> We keep shots until receipt is confirmed and retry the upload on failures.
>
> After a successful transfer, do we delete the original from the phone immediately or keep it for a few days as insurance?

**Author** · 19:25:40 · L226

> delete

**Agent** · 19:25:48 · L229

> After confirmed receipt we delete the shot from the phone.
>
> What should your wife see in paper-ledger after shooting: the processed shot right away for review, or is a thumbnail enough while the camera is already ready to shoot the next sheet?

**Author** · 19:26:58 · L236

> depends on the paper-ledger flow, that's not mobile-ledger's area of responsibility. mobile-ledger is a camera. how it will be used depends on paper-ledger

**Agent** · 19:27:00 · L239

> Yes, the boundary is clear: mobile-ledger provides the camera, image processing and reliable transfer; the user scenario is defined by paper-ledger.
>
> Should only the processed shot be passed to paper-ledger, or together with the original so that the server can repeat the processing?

**Author** · 19:29:06 · L246

> one shot is always passed. if paper-ledger turned on some processing on mobile-ledger then it gets the processed one, if it didn't then the original

**Agent** · 19:29:10 · L249

> On the shoot command we pass one shot; paper-ledger turns processing on and configures it.
>
> If mobile-ledger detects blur, glare or a cropped sheet, should it still execute the shoot command and report the problem, or may it reject the command and require a reshoot?

**Author** · 19:30:51 · L256

> it receives a command, it runs autofocus if there hasn't been one for a while. after autofocus the shot is taken as is

**Agent** · 19:30:55 · L259

> Accepted: on command the camera refreshes autofocus if needed and shoots as is. The quality check does not block shooting.
>
> What image processing is mandatory for the first version: is the original enough, or do we need cropping to the sheet's edges and perspective correction right away?

**Author** · 19:31:28 · L266

> the original is enough for the first version

**Agent** · 19:31:31 · L269

> The first version passes the original; processing will come later.
>
> How do you want to pair the phone with paper-ledger: scan a QR code from paper-ledger with the phone once, after which it connects automatically?

**Author** · 19:32:14 · L276

> yes

**Agent** · 19:32:17 · L279

> We pair via QR code, then the phone connects automatically.
>
> When shooting, is maximum text detail more important, even if the photo takes a few seconds to upload, or a fast cycle with a smaller image size?

**Author** · 19:33:46 · L286

> we should start from DPI, for text documents they say 300 DPI. so a minimum quality with some margin is needed

**Agent** · 19:33:49 · L289

> We take 300 DPI with a small margin as the reference for resolution. For A4 that is roughly 8.7 MP for the sheet itself; the margins around it will need additional resolution.
>
> Which paper formats does your wife shoot most often: A4, A5, receipts or others?

**Author** · 19:34:05 · L296

> A4

**Agent** · 19:34:09 · L299

> Then we pick the resolution for A4 with room for the margins around the sheet.
>
> In the first version, is only the phone's main rear camera needed, without switching cameras and zoom?

**Author** · 19:34:24 · L306

> yes only the main one

**Agent** · 19:34:28 · L309

> We use only the main rear camera.
>
> Does your wife's computer run Windows, Linux or macOS? This must be considered for a possible local intermediary program.

**Author** · 19:34:40 · L316

> windows

**Agent** · 19:34:44 · L319

> We'll account for Windows for a possible intermediary.
>
> For the first version, is it enough for the video to let her conveniently position the sheet and check that it is fully in frame, or must the preview let her read small text with confidence?

**Author** · 19:35:09 · L326

> so that the video lets her conveniently position the sheet

**Agent** · 19:35:14 · L329

> Then we make the preview for positioning the sheet and use full resolution when shooting.
>
> If the connection to the server is lost, should mobile-ledger keep showing video and accepting commands from the computer on the local network?

**Author** · 19:36:00 · L336

> I don't understand how this question relates to mobile-ledger it's not its area of responsibility

**Agent** · 19:36:04 · L339

> Right, this is a question of how the whole system's communication is organized; we'll defer it until integration design.
>
> Should camera settings (resolution, flash, focus) also be set by paper-ledger, or is part of the settings needed in mobile-ledger itself?

**Author** · 19:36:23 · L346

> yes paper-ledger should set them

**Agent** · 19:36:26 · L349

> Then camera settings are also set by paper-ledger.
>
> If a new shoot command arrives while the previous shot is still uploading, should mobile-ledger take the next shot and put it in the send queue?

**Author** · 19:37:08 · L356

> no, that shouldn't be done, paper-ledger will have a UI restriction on such actions

**Agent** · 19:37:12 · L359

> Understood, paper-ledger ensures sequential shooting.
>
> Shall I now study the existing paper-ledger so the next questions rely on its real stack and API?

**Author** · 19:37:38 · L366

> yes study it. strange that you didn't start with that

**Agent** · 19:38:06 · L397

> I've studied the code. You're right: this should have been done before the interview.
>
> paper-ledger currently has:
>
> - Python, FastAPI, Jinja2 and plain JavaScript.
> - Uploading one or several pages starts document processing immediately: `POST /api/documents/process`.
> - There is already server-side table-grid alignment and recognition.
> - There is no device connection, camera commands, video stream or QR pairing.
> - Authorization is optional HTTP Basic. There is no separate camera authorization yet.
>
> So mobile-ledger needs a separate camera connection interface: commands, settings, preview and reliable shot intake. Shot receipt must be confirmed independently of whether OCR succeeds; otherwise the phone will keep and resend photos that were already delivered whenever recognition fails.
>
> The mobile-ledger directory is empty for now. paper-ledger has an untracked `docs/` folder with photographs; I changed nothing.
>
> Next question: **is it acceptable to pass the video preview through the home server if a direct connection between the phone and the browser at work doesn't work out?**

**Author** · 19:39:26 · L404

> yes acceptable, but the speed will be low. but yes this needs to be provided for

**Agent** · 19:39:31 · L407

> We'll provide a direct connection for the preview and transfer through the home server as a fallback.
>
> Should mobile-ledger always upload the full-size shot directly to the paper-ledger server, regardless of which path the preview takes?

**Author** · 19:40:57 · L414

> I don't know how it's done in paper-ledger right now there's a file picker. here it's the same, it's an ordinary picker, only from the camera. there are 2 inputs, file and camera. after that the code in paper-ledger should be the same

**Agent** · 19:41:02 · L417

> Yes, in the current paper-ledger the file picker collects pages in the browser, then the form sends them for processing. The camera should become a second source for the same page list; after that the shared code is used.
>
> Here we need to reconcile an earlier requirement: is the shot deleted from the phone after confirmation that the **browser** received it, or only after it is saved on the paper-ledger **server**?

**Author** · 19:41:40 · L424

> the browser received it

**Agent** · 19:41:44 · L427

> Fixing it: the browser confirms receipt of the shot, after which mobile-ledger deletes the local copy. Further work with the shot is paper-ledger's responsibility.
>
> When paper-ledger is reopened, should the camera connect automatically to the previously paired phone?

**Author** · 19:42:08 · L434

> yes

**Agent** · 19:42:11 · L437

> The camera will connect automatically to the paired phone.
>
> If paper-ledger is closed, should the phone keep the camera active or release it until the next browser connection?

**Author** · 19:42:48 · L444

> better not to hold it of course

**Agent** · 19:42:51 · L447

> Then the service stays reachable, and the camera is turned on when paper-ledger connects and released after it disconnects.
>
> Does the first version need to support several simultaneously open paper-ledger tabs, or does only one tab control the camera at a time?

**Author** · 19:43:39 · L454

> I never thought about that. yes several simultaneously open paper-ledger tabs need to be supported

**Agent** · 19:43:42 · L457

> Then with several tabs we need to decide who gets the shot.
>
> Would this option work: the preview is available to all tabs, shoot commands are executed one at a time, and the shot goes only to the tab that requested it?

**Author** · 19:44:04 · L464

> yes shoot commands are executed one at a time, and the shot goes only to that
> tab that requested it

**Agent** · 19:44:08 · L467

> Fixing it: commands are executed sequentially, and the shot goes to the tab that requested it.
>
> If that tab closes before the shot is received, would it work to keep the shot on the phone and hand it over after paper-ledger is reopened, in a shot-recovery section?

**Author** · 19:44:46 · L474

> closed means we forget about the shot request

**Agent** · 19:44:48 · L477

> Then when a tab closes we cancel its unfinished request, and delete the shot already taken for it.
>
> If the connection drops temporarily but the tab stays open, do we keep the request and the shot until the connection is restored?

**Author** · 19:45:15 · L484

> yes

**Agent** · 19:45:19 · L487

> On a connection drop we keep the request and the shot, and continue the transfer once the connection is restored.
>
> If another tab sends a command while the camera is busy, do we reject it with a "camera busy" response so that paper-ledger offers to retry?

**Author** · 19:45:34 · L494

> yes

**Agent** · 19:45:38 · L497

> Fixing it: when the camera is busy, a new command gets a "camera busy" response.
>
> For KMP I suggest moving the command protocol, the connection state and the shot-delivery logic into shared code, and leaving CameraX and the background service in the Android part. We'll add the iOS camera implementation when it's needed. Does that KMP scope work?

**Author** · 19:46:32 · L504

> I thought CameraX was cross-platform, but if not then yes it works

**Agent** · 19:46:42 · L516

> Right, CameraX works only on Android; it is an Android Jetpack library. [Documentation](https://developer.android.com/media/camera/camerax).
>
> Fixing it: KMP for shared logic, CameraX for the Android camera implementation.
>
> For the first version, do we install the app manually via APK?

**Author** · 19:46:54 · L523

> yes

**Agent** · 19:46:59 · L526

> The first version is distributed via APK.
>
> With several tabs, I suggest applying camera settings together with the shoot command: each tab passes its own parameters, and mobile-ledger applies them and takes the shot. Does that work?

**Author** · 19:47:13 · L533

> yes

**Agent** · 19:47:17 · L536

> Shot parameters are passed in each shoot command.
>
> For the preview I suggest a single shared stream from the phone for all tabs. Does that work?

**Author** · 19:47:22 · L543

> yes

**Agent** · 19:47:32 · L546

> Fixing a single shared preview stream for all tabs.
>
> Which Android version is the Redmi 12 on now? This is needed to design background camera operation.

**Author** · 19:48:39 · L553

> 15

**Agent** · 19:48:44 · L556

> Android 15 noted.
>
> Of the remote camera settings, what goes into the first version: are shot resolution and turning on the light enough, with exposure and white balance staying automatic for now?

**Author** · 19:49:01 · L563

> yes

**Agent** · 19:49:04 · L566

> For the first version: resolution and light are set from paper-ledger, exposure and white balance are automatic.
>
> If autofocus couldn't lock within the allotted time, do we still take the shot and return the focus status along with it?

**Author** · 19:49:13 · L573

> yes

**Agent** · 19:49:16 · L576

> If autofocus fails we still shoot and pass on the focus status.
>
> paper-ledger should set the resolution from the list of modes that mobile-ledger reports as available on the phone. Does that work?

**Author** · 19:49:24 · L583

> yes

**Agent** · 19:49:27 · L586

> Mobile-ledger will report the available resolutions, and paper-ledger will choose from them.
>
> If the connection dropped and came back, do you agree to treat a repeated command with the same identifier as the same request: return the shot already taken instead of photographing again?

**Author** · 19:49:45 · L593

> yes

**Agent** · 19:49:49 · L596

> Fixing protection against repeated shooting by command identifier.
>
> If the shot has already been received by the browser but the confirmation was lost, then on retransmission the browser recognizes it by the same identifier and confirms it without adding a duplicate. I'll include this in the protocol.
>
> Should a phone be paired to only one paper-ledger server at a time?

**Author** · 19:50:13 · L603

> yes

**Agent** · 19:50:16 · L606

> One phone is paired to one paper-ledger server.
>
> For the first version, do we limit ourselves to one phone per server or provide right away for choosing among several cameras?

**Author** · 19:50:42 · L613

> several

**Agent** · 19:50:49 · L616

> We provide for several phones: paper-ledger chooses the camera, and each camera executes commands separately.
>
> When pairing, give each phone a clear name, for example "Tripod camera", to tell them apart in paper-ledger?

**Author** · 19:51:05 · L623

> yes

**Agent** · 19:51:15 · L626

> Each camera will have a clear name.
>
> If a camera is temporarily unavailable, should a command return an error immediately so that paper-ledger shows it to the user?

**Author** · 19:51:26 · L633

> yes

**Agent** · 19:51:37 · L638

> An unavailable camera returns an error immediately.
>
> What time from pressing "Capture" to the photo appearing in the browser do you consider acceptable on a normal connection, for example 2–3 seconds or up to 5 seconds?

**Author** · 19:51:49 · L645

> 2-3

**Agent** · 19:51:59 · L648

> We take 2–3 seconds as the target time on a normal connection; we'll check it on the Redmi 12.
>
> How long should an unsent shot be kept on a connection drop: until the connection is restored with no time limit, or for a set period?

**Author** · 19:52:22 · L655

> until the next command

**Agent** · 19:52:26 · L660

> We keep the unsent shot until the next shoot command.
>
> Does a new command from any tab for this camera cancel the previous request and delete its shot, correct?

**Author** · 19:52:41 · L667

> yes

**Agent** · 19:52:46 · L670

> Then the camera is busy until shooting completes, and an unsent shot is kept until the browser confirms it or until the next command that replaces it.
>
> If transfer is delayed, the phone keeps the shot locally. Do we need to keep it and the unfinished request after the app restarts?

**Author** · 19:53:11 · L677

> no

**Agent** · 19:53:14 · L680

> After a restart we don't restore the unfinished request, and we delete the leftover shot.
>
> For the first version, is JPEG enough, without RAW and PNG?

**Author** · 19:53:29 · L687

> yes

**Agent** · 19:53:33 · L690

> The shot format is JPEG.
>
> How do we control the light: keep it on permanently for positioning the sheet and shooting, or use the flash only at the moment of the shot?

**Author** · 19:54:03 · L697

> configured in paper-ledger

**Agent** · 19:54:10 · L700

> The light mode is set by paper-ledger.
>
> If tabs requested different constant-light modes, would it work to apply the most recently received setting for the whole camera? All tabs will then receive its current state.

**Author** · 19:54:23 · L707

> yes

**Agent** · 19:54:28 · L710

> For constant light the latest setting applies, and all tabs receive its state.
>
> One thing left to clarify about launching on Android 15: is it acceptable that after the system releases the camera, turning it on again requires opening mobile-ledger on the phone? The ability to turn the camera on quietly from the background needs to be checked separately on the device.

**Author** · 19:54:57 · L717

> acceptable

**Agent** · 19:55:01 · L720

> That is an acceptable recovery scenario: paper-ledger reports that mobile-ledger needs to be opened on the phone.
>
> For the first version, is it enough to install updates by hand with a new APK, without in-app updating?

**Author** · 19:55:13 · L727

> yes

**Agent** · 19:55:19 · L732

> Updates are by hand via APK. The main boundaries of the first version are defined; what remains is to clarify the connection.
>
> At what address does your wife open paper-ledger at work: is it an HTTPS address with a valid certificate, or is access arranged some other way? No passwords or tokens are needed.

**Author** · 19:56:46 · L739

> you looked at the project already <PAPER_LEDGER_URL>

**Agent** · 19:56:54 · L742

> In the code I looked at the application, but I didn't establish the external address. Noting: `<PAPER_LEDGER_URL>`.
>
> Can HTTPS be set up at this address for connecting the camera?

**Author** · 19:57:06 · L749

> no

**Agent** · 19:57:10 · L752

> Fixing it: the current address stays on HTTP.
>
> Is a separate secure address for communicating with the cameras acceptable, if paper-ledger itself keeps running at the same HTTP address?

**Author** · 19:57:39 · L759

> the same one

**Agent** · 19:57:43 · L762

> Understood: we use only the existing HTTP address and don't introduce a separate secure one. I'll take this into account when choosing how to transmit the preview and shots.
>
> The main requirements for the first version are collected. The next step is to write them up as the mobile-ledger specification and check the connection options given HTTP, Android 15 and camera operation in the background.

**Author** · 19:58:02 · L769

> continue

**Author** · 19:59:37 · L805

> include as an option making the phone camera a system webcam

### Specification and transport options

**Agent** · 20:00:03 · L818

> I've added to the specification the option "phone as a Windows system webcam", including a hybrid: a webcam for the preview and a separate channel for the original photos and commands.
>
> Before choosing, we'll check shot quality, the behavior of several tabs and the limitations of the current HTTP address.

**Author** · 20:01:02 · L825

> also we could run a server on the phone and paper-ledger would connect to the phone's server

**Agent** · 20:01:30 · L835

> I've added to the specification the option with a built-in HTTP/WebSocket server on the phone.
>
> The paper-ledger browser will be able to connect to it directly in the work network, if the network and the browser allow it. A connection from the home server will require a separate route to the phone.
>
> You can combine a local server for fast transfer with relaying through the home server as a fallback.

**Author** · 20:02:10 · L842

> what next?

**Agent** · 20:02:19 · L845

> Next, check the connection options with a small prototype before writing the whole app.
>
> I suggest starting with the phone's built-in server: CameraX shows the preview, the paper-ledger browser connects, sends "Capture" and receives the original JPEG. We check on the Redmi 12:
>
> - operation with the screen off;
> - connecting from the current HTTP page;
> - photo delivery time, with the target of 2–3 seconds.
>
> If a direct connection doesn't work, we check server relaying. Based on the results we choose the transport and implement pairing, several cameras and tabs.
>
> Which browser does your wife use on Windows?

**Author** · 20:03:00 · L853

> I don't know. I'll ask tomorrow

**Agent** · 20:03:06 · L856

> We'll check the browser tomorrow. Until then we can build the Android prototype: CameraX, a background service, a built-in server, preview and shooting on command. We'll check it from an available computer, and then at your wife's workplace.
>
> The first result is an APK for the Redmi 12 and a test camera-control page. That will let us check the screen-off operation, A4 quality and shooting latency.

## What came out of the conversation

If you read the interview straight through, you can see the moment when an ordinary "camera with a button" stops being simple. The questions gradually move away from choosing a framework toward **who owns the shot, who may issue commands and at what point the result counts as delivered**.

For example, at first the agent assumed my wife would press "Done" on the phone. But I wanted the opposite: the phone stands on the tripod all the time and serves as a camera. The whole user scenario lives in PaperLedger. That defined the main split of responsibility:

- **mobile-ledger** controls the camera, takes the shot and provides it on request;
- **PaperLedger** shows the preview, controls shooting, collects pages and starts document processing.

That is exactly why I disliked the questions about what my wife will see after processing and how the portal's interface should behave: that is not the mobile camera's job.

The next unexpected turn was several tabs. When the agent asked about that scenario, I answered that I had never thought about it at all. But if tabs can see the preview and issue commands at the same time, you have to define not just a `capture` API but the behavior of a whole small system.

| Question from the interview | What it changes in the implementation |
| --- | --- |
| Nothing is pressed on the phone | The camera is controlled from the browser; the Android app needs a service that serves the commands. |
| Screen off | Camera operation in the background has to be checked with CameraX on the target Redmi, not only on an emulator. |
| Several tabs watch one camera | The preview can be shared, but a shoot request belongs to a specific tab. |
| A command repeated because of a dropped connection | One `requestId` must mean one shot, not a new photograph. |
| The server got the file but the browser did not yet | The server's confirmation must not count as the browser's confirmation. |
| The tab closed or the connection was temporarily lost | These are different states with different behavior for an unfinished request. |
| A4 needs to be shot with a margin on top of 300 DPI | When choosing the resolution, look at the camera's real modes and verify the result on the device. |

I think this is where the value of this format lies. I did not sit down in advance to write a document with sections called "idempotence", "concurrent access", "delivery confirmation" and "camera lifecycle". They appeared out of questions about a concrete working scenario.

At the same time, it can't be said that the agent "came up with all the requirements itself". I defined what I wanted from the product, where the mobile app's responsibility ends, and which trade-offs were acceptable. The agent helped find the forks in the road and turned the answers into formal rules.

### The agent did not start by studying the existing project

At some point it surprised me that it was asking how PaperLedger is built when it had access to the source. I wrote it plainly: "yes study it. strange that you didn't start with that".

After it studied the code, not only the quality of the questions changed. The agent saw that files from the browser are already collected into a list of pages and then passed on for processing. It became clear that the camera should be **a second way to add a page to the same form**, not a separate scenario pipeline.

An important delivery rule grew out of this as well. If the server received the photo but OCR failed, making the phone keep the shot and send it again is pointless. And since the page list is built in the browser, confirmation of receipt from the browser and confirmation from the server are different things.

This time the remark "study the project first" produced not a cosmetic process fix but a concrete architectural consequence.

## After the interview I gave the "get started" command

At about 20:05 I connected the Redmi 12 and allowed work to begin. A couple of minutes later I went off about my business, leaving the agent an instruction not to stop even if some checks on the physical device turned out to be unavailable.

The agent created a separate Android project: Kotlin, Compose, CameraX, an Android foreground service, a built-in HTTP server and a small KMP module for shared logic. It first built the APK, wrote a verification script and tried to install the app through ADB.

That is where everything stopped, though not because of an error in the code:

```text
INSTALL_FAILED_USER_RESTRICTED: Install canceled by user
```

The phone was blocking installation. The agent did not try to get around the protective settings and did not treat the app as verified. Instead it created an Android 14 emulator and continued there: it built the prototype, checked the commands, JPEG retrieval and response time. In its report it noted separately that these measurements applied **to the emulator**, not to the Redmi.

When I came back, we got around the installation restriction in the ordinary way: the agent moved the APK into "Downloads" and I installed it by hand through the "Files" app. After that, tests on the real phone began.

### The emulator passed the checks, and the Redmi showed a different problem

The first real shot came out at 3264×2448, roughly **8 MP**. For our detail target for A4 that was not enough once you account for the margins around the sheet.

The agent checked the camera modes with `dumpsys media.camera` and found that the device also supports a higher resolution, up to 4080×3060. But CameraX's usual resolution selection did not use that mode. After changing `ResolutionSelector` and rebuilding the APK we got **4080×3060, about 12.5 MP**.

This is a good example of why I don't consider green checks on an emulator proof that something works on a real Android device. The emulator confirmed that the protocol and the basic scenario function. But the specific behavior of the Redmi's camera only showed up on the Redmi.

We also separately checked operation with the screen off. I physically pressed the power button; the agent confirmed from the device state that the screen was really asleep, and ran a shot. In the short test the camera shot at full resolution, and after idling it released itself and opened again. **This is not an eight-hour stress test of a working day**, and I don't want to pass it off as one.

## The agent moved to another project and connected both sides itself

When the mobile part worked, I gave the next task: connect the camera to PaperLedger's page list, make a shared interface with the ordinary file picker and not break the existing site's design. After that I left again.

For me this is the most interesting part of the experiment. In one Codex session the agent was now working **in two projects**. It did not have to hand a specification over by hand from an "Android team" to a "backend team": it formulated the contract itself and implemented it on both sides.

The mobile app gained commands for status, preview, capture, result, acknowledgement, cancellation and the light. PaperLedger gained the matching server routes, a camera registry, a control interface and adding the received JPEG as an ordinary `File` to the existing page list.

For the first integration run the agent chose the path through the PaperLedger server:

```text
PaperLedger browser
        │  "Capture", preview
        ▼
PaperLedger server (FastAPI)
        │  HTTP commands
        ▼
mobile-ledger on the Redmi 12
        │  JPEG from the camera
        ▼
PaperLedger server
        │  response to the browser
        ▼
The same page list as the file picker
        │  receipt confirmed by the browser
        └──────────────────────────────► the camera deletes the shot
```

There is a subtlety here. Confirmation from an intermediate server does not yet mean the photo has successfully reached the user. So the phone deletes the stored shot after the browser's confirmation; repeating the request with the same identifier does not create a new page.

The agent started an isolated PaperLedger instance without touching the running public server and tested the chain with the real Redmi camera. A **4080×3060** shot really did get from the phone into the browser through FastAPI.

The new integration also gained **33 targeted tests and 9 browser scenarios**. One clarification matters here: the browser scenarios were run with a test camera source. They are not nine independent end-to-end shots with the real Redmi. On the real device there were separate camera checks and two measured shots over the integrated path.

Through the server, getting the photos into the browser took **3.14 and 3.43 seconds**. In the interview we had chosen a target of **2–3 seconds**. So the system worked, but in these measurements it **did not reach** the target latency. In its final message the agent listed the successful checks and left this fact out of the short summary; I had to look in the detailed report.

## What remained outside the prototype

This story has a fundamental limitation. We verified the phone and the server on an available test network. But the real scenario is different: my wife is at work with the phone and a Windows computer, while PaperLedger runs at my place at home.

For that arrangement **the communication channel has not been chosen or tested yet**. The server variant that passed the local test does not mean the home server can reach the phone on the work network. In the interview we left several possibilities open: a direct connection, an intermediary on Windows, the phone as a system webcam, or another transport. They can only be chosen after checking the real network restrictions.

There are other unfinished items too: QR pairing is not yet implemented, shots on the phone are not yet straightened or processed, correct operation through a whole working day is not confirmed, and 12.5 MP by itself does not prove the actual 300 DPI on the sheet. At the time of this story the public PaperLedger instance had not been updated, and my wife had not gone through a full working scenario with it.

Data protection is a separate topic. The experiment used the existing HTTP access without HTTPS, and working accounting documents may be confidential. A prototype like this can't automatically be considered fit for use on a corporate network: before that, both a secure transport and agreement on the use of the data need to be sorted out.

I [published the source of the mobile prototype on GitHub](https://github.com/hram/mobile-ledger). It is a prototype, not a promise of a finished app for everyday accounting work.

## What I took away from this experiment

In the previous article the agent was, for me, above all an executor of a series of engineering experiments: it changed algorithms, ran tests, collected metrics, and I stepped in when the problem statement itself had to change.

Here I tried a different way of working. The agent's input was an idea, "a phone as a document camera for PaperLedger", and access to the existing project. Instead of writing out the protocols, states and implementation details myself, I asked it to **ask me questions first**.

The interview did not take the responsibility for decisions off me. On the contrary, it made them visible. I chose what should happen on a connection drop, when a tab closes, after the phone reboots. I brought the agent back to the boundaries of the task. I insisted on operation with the screen off. Sometimes the agent noticed an important scenario before I did.

But once those decisions were made, I no longer needed to design every FastAPI route myself, write the CameraX service or reconcile the code of two applications by hand. The agent implemented both sides, built the APK, organized the checks and showed a working end-to-end scenario. My part in the implementation came down mainly to decisions that required a physical phone, and to evaluating the result.

At the same time the agent did not become a magic executor to whom you can give a single phrase and get a finished product. It could not allow the installation on the Redmi itself, could not check an unknown work network, and should not have passed emulator measurements off as real ones. And some things, such as the missed latency, I had to read out of the detailed report, although the short summary looked perfectly successful.

**For me the conclusion is not that a simple app turned out to be complicated. And not that AI wrote it in an evening.**

What is more interesting is something else: the complexity did not go anywhere, but I did not have to hold all of it in my head in advance. The agent helped me extract the requirements step by step, turn them into a technical contract, and then implement that contract on its own in two projects at once.

And I left the full transcript for exactly that reason. I think anyone who has ever said "it's just one button and a camera" will find their own unexpected question in it.
