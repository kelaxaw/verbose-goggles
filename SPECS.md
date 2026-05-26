Frontend engineering task
Please submit the task within 5 days using the link: https://higgsfieldcareers.typeform.com/to/t7itGT0B
1. Brief
Build a media feed in React where images and videos of different aspect ratios are laid out in justified rows.
The container is divided into horizontal rows of equal height; within each row, items keep their original aspect ratio, so widths vary. The row's height is chosen so the items fill the container width exactly, with a small uniform gap between them.
The bottom row may need padding to avoid blowing up tall when it has too few items.
The user scrolls through thousands of items, can adjust how many fit per row, and the feed adapts when the viewport is resized.
Mixed media
The dataset contains both images and short videos, intermixed in the feed.
Treat both as first-class items with the same layout rules (videos have an aspect ratio just like images).
The candidate decides how/when video plays (hover, in-view, on click) — that's a deliberate design choice we want to see reasoned about.
Why we're asking
Building a feed at this scale touches algorithms, perf, React internals, component design, and pragmatic tradeoffs all at once.
We use a production version of this in our app; this task is a deliberate sketch of one slice of that surface.
What we're evaluating
Production-quality React + TypeScript.
We care about:
correctness of the layout
perf at scale
clean component API
deliberate state management
code organization
reasoning about tradeoffs
We do not care about:
pixel-perfect visual design
original styling
feature creep beyond the brief
Time budget
3–5 days, your own pace.
We expect ~10–15 focused hours total.
If you spend significantly more, write down why in the README.
Stack
React + TypeScript.
Free choice of build tool (Vite, Next, etc.) and libraries — including data fetching, state management, layout, virtualization.
There are no bans; we evaluate the reasoning behind the choices.
AI tools
Use of AI assistants (Cursor, Claude, ChatGPT, etc.) is fully allowed — for code, for design discussion, for everything.
Use whatever you'd use on a real job.
We grade the result and your understanding of it, not the keystrokes that produced it.
Expect to be asked about any part of the code in the live walkthrough.
2. Required scope
Four required capabilities.
The feed must satisfy all of them end-to-end at ~2k mixed items.
R1. Justified-row layout
Items are arranged in rows that fill the container width.
The layout keeps each item's original aspect ratio without cropping.
Rows should look consistent down the page.
The last row should handle the case when there aren't enough items to fill it.
R2. Scales to large datasets
The feed remains smooth at ~2k mixed items on a mid-tier laptop.
Scrolling does not jank.
Memory and DOM size do not grow unboundedly with dataset size.
R3. Column-count control
The user can change how many items fit per row through a UI control.
The feed responds to this change and to viewport resize.
The user's scroll position is preserved across both — they stay anchored on what they were looking at.
R4. Media loads efficiently
Items load as the user approaches them, not all at once.
Items far from view do not consume bandwidth.
Videos behave appropriately for a feed (they do not all play at once everywhere).
Loading priority reflects visibility.
Dataset
The candidate produces the dataset themselves:
~2k items
mix of images and short videos
realistic aspect ratios
Source and generation method are documented in the README.
Suggested public sources:
Images
Unsplash (source.unsplash.com
)
Unsplash API
Picsum (picsum.photos
)
Videos
Pexels Videos
Coverr
Google gtv-videos-bucket
 sample MP4s
The candidate is free to use any other source, or pre-generate a static JSON of metadata + URLs.
3. Stretch goals
Optional, but each one tells us something we couldn't see from the required scope alone.
Done well, any one of these is a strong signal.
Skipping all of them is fine.
S1. Smooth column-count transition
When the user changes the column count, items don't jump — they animate to their new positions and stay smooth even while the control is being dragged continuously.
S2. Fast-scroll grace
When the user is scrolling fast (flicking through the feed), the feed avoids spending work on items the user will fly past.
When they slow down or stop, work resumes promptly.
S3. Animation-friendly media cache
A media item that's been loaded once and scrolled away doesn't reload from network when it comes back into view.
Preserves loaded state across virtualization.
S4. Right-sized media
The feed requests appropriately sized media for the current cell size, not the largest available.
Larger sizes are reused when smaller ones won't do.
S5. Robust resize
Continuous viewport resize (drag to resize the window slowly, or fast) stays smooth — no flicker, no layout thrash, no dropped frames.
S6. Live-data ergonomics
If new items are prepended to the feed (e.g., a "just generated" item appears at the top), the user's scroll position doesn't jump — they stay where they were reading.
4. Deliverables
D1. Git repository
A public Git repo (GitHub/GitLab/Bitbucket) with the project.
Include a package.json
 with a single:
npm install
npm run dev
​
(or equivalent) path to a working app.
We will clone and run it.
D2. README
The README is the candidate's chance to talk to us in writing.
It should cover:
Setup
What's done
Design decisions
What was skipped and why
Known issues / next steps
Length: aim for ~1–2 pages of prose plus setup steps.
We're not grading word count.
D3. Screencast (3–5 min)
A short Loom / screen recording.
Show:
feed running with full dataset
scrolling
resizing
changing column count
one perf observation
The candidate can narrate their own walkthrough.
5. Evaluation rubric
Correctness
Does the feed actually meet the four required capabilities?
Code quality
TypeScript used to express intent, not just satisfy the compiler.
Perf
The feed performs at target scale.
Reasoning
README and Loom explain decisions and tradeoffs.
Stretch
One stretch done well beats three done sloppily.
6. Non-goals
Don't spend time here:
Pixel-perfect visual design
Authentication
Production deployment
Cross-browser support beyond modern Chrome and Safari
Internationalization
SEO / SSR / hydration
