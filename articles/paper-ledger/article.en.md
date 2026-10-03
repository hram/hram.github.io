---
layout: default
title: "I Wanted to Read Three Columns of an Invoice. OCR Turned Out to Be the Easy Part"
description: "Reading paper invoices from a phone photo: PaddleOCR running out of memory, aligning by the table grid instead of the sheet, and a tight crop instead of a new model."
date: 2026-10-03
lang: en
locale: en_US
translation_key: paper-ledger
permalink: /en/articles/paper-ledger/
nav_exclude: true
---

# I Wanted to Read Three Columns of an Invoice. OCR Turned Out to Be the Easy Part

My wife works as an accountant, and a noticeable share of her documents still arrives on paper. I started with a simple question: which of the repetitive manual operations could a program take over?

The first scenario turned out to be very narrow. There is a photo of an UPD (the Russian universal transfer document, a combined invoice and delivery note). In its table you need to take the VAT rate from column 7, group the rows by that rate, add up the values in columns 8 and 9, and check the resulting sums against the document total.

So the original task looked roughly like this:

```text
photo of an UPD
→ find the three columns
→ read the numbers
→ group by VAT rate
→ check the sums
```

I wasn't going to build a universal document management system. The goal wasn't to recognize everything on the page or to understand every signature and every requisite. I needed a few specific values from a specific table.

At the start I thought the hardest part here was OCR. After that, all that would be left was to parse the numbers carefully and add them up.

A few hours later the first version tried to allocate tens of gigabytes of memory. And a series of experiments after that showed that character recognition was actually one of the easiest parts of the task.

## The first version: hand the page to PaddleOCR

I called the project PaperLedger. In the first spec the architecture was what you'd expect: OpenCV to prepare the photo, PaddleOCR for recognition, a ready-made table recognition pipeline to restore the table structure, then normalization, grouping, and validation.

The original scheme looked like this:

```text
upload
→ OpenCV preprocessing
→ PaddleOCR / table recognition
→ table
→ columns 7/8/9
→ normalization
→ grouping
→ validation
→ HTML / JSON / XLSX
```

And the ready-made table recognition wasn't the backup option, it was the main one. I thought of classical geometry more as a fallback in case the neural part failed.

The coding agent built the first MVP. After decoding the photo came page detection, a perspective warp, deskew, CLAHE, and then two full-page passes: `TableRecognitionPipelineV2` for the table structure and a separate `PaddleOCR(lang="ru")` for the text.

On paper the solution looked reasonable. On a real phone photo it no longer did.

The file was about 5 MB. During processing PaddleOCR tried to allocate roughly 44 GB of memory, and the request ended with a `ResourceExhaustedError`.

The first hypothesis was the obvious one: the photo is too large. So the agent added a size limit — the long side was reduced to 2600 pixels before OCR. On a large synthetic image this did remove the crash: the request started to complete. It took about 44 seconds, though, and still reached roughly 10 GB RSS.

At that moment it looked like a working first fix. The large photo got smaller, the application stopped crashing — time to move on.

But then the same class of problem came back on another real document.

And that is where it stopped being the development of an "OCR service" and became a proper investigation.

## We were treating the image size, but the problem was the architecture

After the second crash the agent started running experiments under `systemd-run` with a hard `MemoryMax` and swap disabled. The idea is simple: if the next hypothesis asks for tens of gigabytes again, let the operating system kill that one process instead of turning the laptop into a brick for several minutes.

The first reproducible experiment showed an unpleasant thing: even a 1462×2600 image still exceeded the 14 GB limit.

Before inference began, loading the models took about 85 seconds, and RSS after loading was about 1.97 GB. Then the first full-page neural inference pushed the process past 14 GB.

Once we took the pipeline apart, the cause became clearer. The separate `PaddleOCR(ru)` ran its own text detector over the whole page. `TableRecognitionPipelineV2`, in turn, contained its own set of models for layout, OCR, and table structure recognition. In effect the page was going through several heavy models, with part of the work duplicated.

This didn't mean PaddleOCR was "bad". The architecture was simply inadequate for my task.

I didn't need to understand the whole page. I needed a few table columns, and their position could be found geometrically.

After that the scheme changed fundamentally:

```text
ORIGINAL
↓
small working copy
↓
classical CV: geometry
↓
coordinates of the regions we need
↓
ORIGINAL
↓
small crops
↓
text recognition model
```

The reduced copy is for cheap geometry. The original is for reading. The neural network should no longer see the whole page.

This rule — **working image for geometry, original for recognition** — survived almost every later change to the pipeline.

Later, peak memory during local recognition was about 627 MB instead of "more than 14 GB and the process is killed".

But to cut out the right small regions, we first had to understand the table geometry really well.

And here it turned out that the standard "straighten the document" step can make things worse too.

## Straightening the sheet doesn't mean straightening the table

The first geometric version did what you usually expect from a document scanner: it found the sheet contour on the reduced copy, built a perspective transform, and straightened the page.

The problem was in the source photos. The sheet didn't always fit into the frame. The side edges could be missing entirely. But even when the paper edge was visible, it didn't have to be perfectly parallel to the printed table.

In the next step we tried to find the grid with morphology. Without tilt correction we got zero or one long horizontal line instead of the roughly thirty we expected.

We tried an ordinary rotation by the angle of the horizontals. The horizontals did get better, but the verticals tilted by about 0.31°. So this wasn't just an image rotation. The distortion was closer to shear or perspective.

We added a shear correction. It got better. But at that point I had a simple question: why are we fixing, in the second step, a tilt that should have disappeared after the first alignment?

I asked the agent whether we should go back and make the first step produce correct geometry right away.

The agent proposed moving the tilt measurement earlier: find the sheet by its four corners, measure the table lines on the reduced copy, combine perspective and shear into one matrix, and do a single warp.

So technically the plan was becoming tidier, but the model of the task stayed the same: the main geometric reference was still the sheet of paper.

And then I remembered an old project.

## What Sudoku has to do with it

Many years ago I built a [Sudoku recognizer](https://github.com/hram/Sudoku). It also has a photo, perspective distortion, and a regular grid.

I wrote to the agent roughly the following:

> I built a Sudoku recognition algorithm. First, on the uncropped frame, I looked for vertical and horizontal lines within some range of angles, then I found their intersections, and from those I worked out which transformation to apply to the image to align it.

The point wasn't to port the Sudoku code literally. The point was the choice of the reference object.

If I need the correct geometry of the table, why align the paper? The table itself is what has to be aligned.

After that message the approach changed:

```text
source frame
→ LSD line segments
→ horizontal and vertical lines
→ their intersections
→ table nodes
→ homography / RANSAC
→ a single warp of the original
```

Lines were searched for directly on the not-yet-straightened frame and allowed some range of angles. Then short segments were merged into long lines, the horizontals were intersected with the verticals, and the resulting points became the geometric anchors.

Sudoku has a convenience: the 9×9 grid is regular, so you know in advance where each node should be. An invoice is worse — columns have different widths, rows have different heights. We had to do a rough transform from the outer geometry and then refine it over many nodes while discarding outliers.

Debugging the detector also took several iterations. LSD found both edges of a thick line. Digits in a narrow column could produce false segments. We had to tell the real table structure apart from the visual noise inside it.

But the main result turned out to be not the new algorithm itself, but a comparison of the old and the new by one and the same metric.

| Variant | Tilt of horizontals / verticals | Mean node residual |
|---|---:|---:|
| No alignment | 0.032° / 0.053° | 0.76 px |
| By sheet contour | 0.374° / 0.010° | 1.97 px |
| Contour + shear | 0.105° / 0.004° | 0.98 px |
| By table grid | **0.010° / 0.002°** | **0.26 px** |

The most unpleasant row here is the second one.

Alignment by the sheet contour was quantitatively **worse than doing nothing at all**.

The tilt we later detected and corrected was partly created by the preprocessing itself. The top edge of the paper in the photo didn't run quite the same way as the printed grid, and the attempt to turn the sheet into a "nice rectangle" deformed the object I actually cared about.

It was a useful lesson: preprocessing is not a free improvement of the image. Any transformation has to be judged against the feature you need downstream.

The new method cost about 0.8 extra seconds per page at that stage, but the mean node residual dropped from 1.97 to 0.26 pixels.

So now the grid is found, it would seem. Cut out the cells and hand them to OCR.

It turned out that even here a few pixels are enough to break a number.

## One pixel on the working image is several pixels on the original

I computed the geometry on the reduced copy, because running OpenCV over the original multi-megapixel photo makes no sense. Once the grid was found, the coordinates were scaled back to the original, and the cells were cut from there.

At first glance everything worked. But in some money values the last digit disappeared.

The cause was mechanical. An error of about one pixel on the reduced working copy became several pixels on the original after scaling back. On top of that, a table line has thickness, and morphological operations widen it further. A rough boundary could pass right through the outermost character.

The first variant cut the cells directly by the grid coordinates. It had to be thrown away.

The next variant became two-level. First the grid on the working image gave an approximate boundary. Then, in the original, a small window of about ±10 pixels was opened around it, where the algorithm looked for the actual printed line. Only after that was the crop built.

For control we introduced a simple metric, `edge_ink`: how many crops have ink right at the edge, that is, a potentially clipped character.

Before refinement there were about 67 such cases out of 84. After — 3 out of 84, and the remaining three turned out to be specks and pen marks rather than genuinely clipped digits.

That is how the second level of coarse-to-fine appeared:

```text
page: coarse geometry
→ cell: local boundary refinement
```

And only after that did OCR finally start receiving truly local fragments of the image.

## The neural network finally saw only what had to be read

After abandoning the full-page pipeline, there was no longer any need for a detector or table recognition while reading values. One small text recognition model remained.

I compared several input variants: recognizing each cell separately or feeding a whole strip of the needed columns; grayscale or a binarized image.

Another useful asymmetry showed up here. Binarization helped the geometry a lot: the table lines became simple and high-contrast. But OCR on the same binary data worked worse. Recognition did better on grayscale.

So one and the same "improved" image doesn't have to be good for every stage of the pipeline.

In the first comparison a strip of several columns gave a slightly better raw result than independent cells. But later I went back to separate cells anyway. The reason was no longer the model's raw accuracy.

When a long strip is recognized, one lost comma or one wrong separator can break the parsing of several neighboring values at once. With a separate cell the error is localized: there is a specific bbox, a specific crop, and a specific OCR result. It can be checked independently and stored as evidence.

For accounting data that traceability turned out to matter more than a small gain on one test photo.

But even with correct cells, errors remained. And the biggest jump in quality came without changing the neural network at all.

## The biggest OCR improvement was an ordinary crop

The errors clustered in a strange way: most of them occurred in double-height rows.

The cause became obvious after looking at the model's actual inputs. In such a row the money value occupied only a small part of a tall cell. The recognition model still resized the whole crop to its fixed height, 48 pixels for example. As a result, a lot of empty space was left around the digits, and the characters themselves shrank.

Formally we were giving the model the correct cell. In practice we were making it read text that was too small.

Before recognition we added one more step: finding the connected ink components inside the cell and making a tight crop around the value itself.

The result on the labeled golden document changed noticeably:

```text
separate cells: 76 → 82 out of 83
strip:          79 → 83 out of 83
```

At the same time we managed to enable MKL-DNN for the recognition model. On the same tight-crop inputs, the time of a single call dropped from about 155 to 44 ms for separate cells and from 366 to 93 ms for the strip — that is, by a factor of 3.5–4.

So no new OCR was needed. We simply started showing the old OCR a more appropriate image.

Of course, the new preprocessing immediately created a new class of errors. The tight crop sometimes took a dot, a pen mark, or a remnant of a grid line for part of the text and stretched the box where it shouldn't. The rules for selecting components had to be tightened separately.

This repeated throughout the project: you fix one class of problems and the next one opens up. So instead of trying to find the "ideal pipeline" in one move, it was more useful to make changes as experiments with a measurable criterion.

## If this is a VAT rate, why allow the model the letter Q?

After the tight crop one very telling error remained:

```text
10% → 1Q%
```

There was a smudge on the paper, and the zero really did start to look like a `Q`. The general OCR model wasn't doing anything illogical: both sequences are visually possible.

I could have written a `Q → 0` post-processing rule. But that would mean encoding one specific error of one specific photo.

What I do know exactly is the semantics of the field.

If it is a money amount, digits and separators are allowed. If it is a VAT rate — digits, the percent sign, and a separate text variant, «без НДС» ("no VAT"). Why let the decoder choose from the rest of the alphabet at all?

The restriction was introduced at the CTC decoding level. For a specific field type the decoder considered only the allowed characters.

On the golden document this closed the remaining error and gave 83 matches out of 83 labeled values.

It matters that this didn't become a global rule. The column-number row of an UPD contains labels like `1а`, `1б`, `10а`. If you turn on a numeric whitelist everywhere, correct text starts getting corrupted by our own confidence that "there should be digits" there.

So domain constraints turned out to be useful only where the semantics of the field are actually known.

This idea helped several more times later: don't make a generic model solve a broader task than the business scenario requires.

## How much is a "good photo"?

Once the pipeline had learned to read the needed cells on the source document reliably, the next question came up. How good does the shot actually have to be?

The phrase "you need a good camera" is useless as a technical requirement. So I artificially downscaled the image and varied the margin around the text to find the boundary past which accuracy drops sharply.

For the current model and these documents the working lower bound turned out to be about 7–8 pixels of digit height. Below roughly 6 pixels quality degraded fast. About 25% of free margin around the text turned out to be a good setting for recognition.

The golden photo had roughly a 2.5× resolution margin over that threshold.

This number is more useful than any phrase about megapixels. If I ever build a dedicated mobile capture scenario, I can control not an abstract camera quality but the actual character size in the ROI, the sharpness, and the ability to reshoot a bad region.

But the project hasn't reached a mobile scanner yet. First I wanted to understand how well the current scheme transfers to other paper documents at all.

## The second document quickly destroyed the feeling that the task was solved

After an 83/83 result it is very easy to decide that OCR already works.

So as the next step I brought other real photos.

One of them turned out to be not an UPD but a TORG-12 (another standard Russian delivery note form). The document was rotated, the column structure was different, and the paper was curved in places.

First came the orientation task. PaddleOCR's ready-made classifier, applied to the central crop, got one case wrong out of 24 artificially created rotations. The reason was mundane: the center of the page doesn't guarantee there is normal text there. It could contain signatures or an almost empty area.

Instead of replacing the classifier, we changed how the data was fed to it. The page was split into a 3×3 grid, empty regions were skipped, and the rest voted on the orientation. On the same experimental set that gave 24 out of 24.

The document type didn't require a separate neural network either. The row of column numbers was already there. An UPD contains characteristic labels like `А` and `10а`; a TORG-12 has a sequence of columns up to 17 without those features. That was enough for a conservative rule-based detection of the form.

And the first version of the rules got edge cases wrong. After that the principle changed: if the features contradict each other, it's better to return `UNKNOWN` than to guess the most similar type.

For an accounting tool this is an important difference. A "couldn't determine" error is annoying. A "confidently processed the document as a different type" error is far more dangerous.

But the most interesting problem with the new document wasn't in classification or OCR at all.

## You can read every digit correctly and assemble a row that was never on paper

On the curved TORG-12, global row detection found 16 rows instead of the real 18. In two places neighboring physical rows merged, because the curvature kept the boundary from running confidently across the full width of the table.

At first this looks like just another segmentation error.

But the consequences are much worse than an ordinary OCR error.

The needed columns are processed independently. If the row boundaries in them are determined slightly differently, you can take the amount from one physical row, the VAT from the neighboring one, and then assemble them into one structured object.

Every character may be recognized perfectly.

The result is a record that **never existed in the source document at all**.

For me this was an important shift in understanding quality. Until then the natural metric seemed to be the number of correctly recognized values. But 100% OCR guarantees nothing if the physical structure of the document is broken.

It turned out we didn't have to fully flatten a badly curved sheet. We narrowed the task again.

I need specific columns. So the horizontal row boundaries can be searched for not across the full width of the page, but only in the narrow strip of those columns. Over a small area the paper curvature has much less effect.

After switching to local row geometry the algorithm found all 18 physical rows, and the cases of values being mixed between rows disappeared on this document.

The pattern repeated for the third time:

```text
don't solve the whole page
if the task is local
```

First it saved memory. Then it helped the cells. Now — the rows on curved paper.

## When OCR became the last bottleneck

After all these changes, processing time on the current site was about 4.4–4.8 seconds per document. Of that, 75–80% was now taken by the recognition network.

So we had finally reached the situation I had expected at the very beginning: the main cost really was in OCR.

Now it made sense to compare models.

The agent ran seven recognition variants, including different generations of PaddleOCR and Tesseract, in two modes — separate cells and a strip — on two real documents.

The fastest was `PP-OCRv6_tiny`, but speed wasn't a sufficient criterion. The model confused `6` and `8`, and also corrupted the column-number row.

`en_PP-OCRv3_mobile_rec` turned out to be noticeably faster than the original model — about 1.8–2.6× in different measurements — and gave a good result on money values. But a systematic error on the VAT rate remained: the problematic `10%` turned into `19%`.

We could have gone back to a heavier model. But by then we already knew that a VAT rate isn't an arbitrary string.

The number of allowed values is finite:

```text
0%
5%
7%
10%
20%
22%
без НДС
```

Instead of ordinary character-by-character decoding, for this field we started computing the CTC probability of each legal entry and choosing the most probable one.

This is no longer a character whitelist. The decoder knows not just the allowed alphabet but the full dictionary of allowed field values.

On the problematic smudge the free decoder chose `19%`, while among the real rates `10%` came out as more probable.

As a result, `en_PP-OCRv3_mobile_rec` stayed as the default model. On the current experimental collection of two documents we got 135 matches out of 135 labeled values. Recognition-related processing time changed from 4.84 to 2.81 seconds on the TORG-12 and from 6.06 to 3.19 seconds on the UPD relative to the previous model — roughly ×1.7–1.9.

It's important not to read these numbers as "PaperLedger has 100% accuracy". Two documents and 135 values are the test collection of a specific stage, not a statistically meaningful estimate of a universal OCR.

Moreover, we deliberately didn't choose the fastest variant: the hybrid with the tiny model lost one real value. Minimal latency at any cost is not interesting in a task like this.

## What the pipeline turned into

If you fold this whole story into an architectural sequence, it comes out roughly like this:

```text
full-page PaddleOCR + table recognition
                ↓
working image for geometry + original for OCR
                ↓
alignment by the grid instead of the sheet contour
                ↓
coarse grid + local boundary refinement
                ↓
text recognition on crops only
                ↓
tight crop down to the actual text
                ↓
field-aware CTC constraints
                ↓
orientation + document type detection
                ↓
local row geometry
                ↓
fast recognition model + dictionary decoding
```

A few numbers show the scale of the changes well.

The original full-page pipeline exceeded the 14 GB limit and ended with the process being killed. Local recognition, in one of the control runs, peaked at about 627 MB.

The mean node residual with alignment by the sheet contour was 1.97 pixels. With alignment by the grid itself — 0.26 pixels.

On one labeled golden document, the chain of recognition improvements went from 76 correct values out of 83 in an early variant (separate cells, no tight crop) to 83 out of 83 after crop preparation and domain-aware decoding.

On the next small collection, after the recognition model change and the rate dictionary, we got 135 out of 135 with a noticeable reduction in time.

What matters most to me is not the final numbers themselves but where the gain came from. Almost none of the big jumps was the result of "let's take a bigger model".

Memory went down because the neural network stopped seeing the whole page. Geometry improved because the reference became the table rather than the paper. OCR improved because the crop became more appropriate. The `Q` error disappeared because the decoder got the semantics of the field. The curved TORG-12 could be parsed because a global problem was turned into a local one.

## What the coding agent did in this story

I did the whole project with a coding agent, and its role changed noticeably along the way.

At the beginning the interaction was ordinary:

```text
I state the task
→ the agent implements it
→ we run it
→ we look at the result
```

That is how the first full-page pipeline appeared too. It fully matched the original spec — in which I myself asked for PaddleOCR table recognition as the main path.

After the first failures the mode became different.

Instead of big commands like "fix the recognition", we started keeping an experiment log. Before a change, the hypothesis was recorded; after it — specific measurements and artifacts. The agent ran variants under a memory limit, measured time and RSS, saved intermediate images, crops, and overlays, compared implementations, and after a successful experiment moved the solution into the main pipeline.

So its most useful role gradually came to resemble not "a programmer who was handed a spec once" but a very fast lab executor.

This doesn't mean I was correcting the agent all the time. For example, the real cause of the OOM after the first unsuccessful resize was found by the agent itself in the course of measurements. It was also the agent that ran the alternatives one after another and discarded them by the metrics.

But there were moments when what had to change wasn't the parameters but the model of the task itself. The Sudoku episode is exactly that for me: the agent was already improving the existing alignment scheme, and carrying over experience from another task let me ask — why is the paper edge the reference object at all, if what we need is the geometry of the table?

In the end, the most productive loop looked roughly like this:

```text
observation
→ hypothesis
→ measurable experiment
→ the agent quickly implements and runs the variants
→ timings / RSS / crops / diagnostics
→ interpretation
→ next hypothesis
```

This is very different from the popular picture of "described the app in one prompt and got a finished product". In my case the agent's value grew as the task became more experimental and more verifiable.

## OCR turned out to be the easy part

At the beginning I pictured the system like this:

```text
image → OCR → data
```

After several days of experiments the scheme looks different:

```text
image
→ geometry
→ physical rows and cells
→ OCR
→ domain constraints
→ structured data
→ validation
```

The neural network ended up in the narrowest spot of the pipeline: reading a small fragment that has already been correctly located and correctly cropped.

And most of the reliability appeared around it.

You have to preserve the physical link between a number and a specific cell of the document. You must not mix up neighboring rows. You have to know when the rules of the domain let you narrow the space of answers, and when that leads to self-deception. You have to be able to return `UNKNOWN` when there isn't enough data. And preferably every result should come with evidence: coordinates, the source crop, the raw recognition, and diagnostic values, so that you can walk back from the number to the paper.

At the same time, PaperLedger can't be called a finished product yet.

I take my wife's real work scenarios, discuss with her what exactly she does by hand, build an experiment, and show her the result. She doesn't use PaperLedger in her daily work yet. Even if the technical part becomes reliable enough, a separate organizational question remains: her work computer is a corporate one, and the documents contain payment data and probably confidential data, so real use would first have to be agreed within the company.

And that is one of the reasons I don't want to wait for some notional "production" to describe the project. At this stage the value for me is not that a finished system came out of it, but the chain of engineering decisions itself.

After the VAT tables my wife showed me the next operation — reconciling two statements of the same deal. And there the task changed again: it turned out that correctly reading even two documents isn't enough. You have to understand their accounting structure, match the operations, and, most importantly, not draw conclusions that the data itself doesn't support.

But that is another story.
