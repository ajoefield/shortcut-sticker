# Story Timeline - HandsOnKeyboard.com

*Narrative journey from concept to current state — the human stories, insights, and lessons learned.*

---

## Project Genesis (Early Sessions)

### The Initial Vision
Started with a simple idea: create custom keyboard shortcut stickers for laptops. The concept came from seeing cluttered desks and realizing people need quick visual references for their most-used shortcuts.

### The Stack Decision Moment
Chose React + Express + Prisma + PostgreSQL after considering various options. The decision came down to type safety (Prisma), familiar frontend (React), and scalable backend (Express). Sometimes the best stack is the one you can ship with quickly.

### The Database Design Challenge
Spent significant time on the schema design. The key insight: use a single shortcuts table with platform columns rather than separate tables per OS. This decision would prove crucial for scalability as we add more apps.

---

## Early Development Breakthroughs

### The PDF Scraping Eureka
Realized we could extract shortcuts directly from application documentation PDFs. Built Python scripts to automate this process. The first successful extraction from VS Code docs felt like magic — suddenly we had hundreds of real shortcuts.

### The Frontend Foundation
Built all core pages in rapid succession: Landing, Browse, Create, Profile, Auth. The momentum was incredible — seeing the app structure come together page by page.

### The First Database Connection
Connected the Browse page to real database data for the first time. Seeing actual VS Code and Vim shortcuts populate the tiles was magical — the app finally felt alive with real content.

### The Favorites Heart Icon Breakthrough
Added favorites functionality with heart icons. The UX challenge: how to show favorites without cluttering the interface. Solution: only show hearts when searching, keeping the browse view clean.

---

## 2025-12-09 Session Stories

### [14:30] The Floating Navigation Breakthrough
Started with a simple request to make the Profile sidebar "floating and clickable." What seemed like a small UI tweak turned into a complete navigation redesign. The moment we added smooth scrolling and collapsible functionality, the Profile page transformed from static to interactive. Sometimes the smallest changes have the biggest impact.

### [15:00] The Dark Mode Revelation
User asked for a "dark mode option in right corner of nav bar." This sparked a complete theming overhaul across the entire app. The breakthrough came when we implemented browser preference detection, making the app truly respect user choices.

### [16:15] The Excalidraw Vision Comes Alive
User shared an Excalidraw mockup and said "update CreateLayout.jsx to match layout i drew." Seeing a hand-drawn wireframe transform into a fully functional React component was magical. This is why visual communication is so powerful in development.

### [17:30] The AWS Infrastructure Pivot
Started a new session focused on scaling the PDF processing pipeline. What began as "let's automate PDF processing" became a full infrastructure-as-code project with Terraform, Lambda, S3, Textract, and Bedrock Claude.

### [18:00] The Terraform vs Bash Scripts Decision
Chose Terraform for state management and declarative configuration. This decision will pay dividends as the infrastructure grows. Sometimes the "harder" path upfront saves countless hours later.

---

## 2026-01-09 Extraction Pipeline Stories

### [~10:00] The Pipeline Redesign Vision
Started with a big question: "I want a repeatable, largely automated pipeline to extract shortcut data from source documents." The existing system worked but was fragile. The vision: drop any PDF in a folder, run one command, get database-ready shortcuts. What followed was a complete ground-up redesign.

### [~10:30] The Python 3.13 Wall
Hit a brutal compatibility wall. Python 3.13 couldn't build PyMuPDF or pandas. The fix: create a Python 3.12 virtual environment. Sometimes the newest isn't the best.

### [~11:00] The 334 Shortcuts Moment
Ran the pipeline for the first time against all 9 PDFs. Watching it classify each document, extract shortcuts, deduplicate, and store 250 unique shortcuts in under 3 seconds was deeply satisfying.

### [~14:00] The Regex vs AI Showdown
Spent the morning fixing specialized regex parsers. Got them working — sort of. Then tested a Simple AI parser. The results were staggering: Sublime jumped from 15 to 46, Vim from 24 to 96. The AI understood context that no regex could ever match. Sometimes the best code is the code you don't write.

### [~14:30] The JSON Parsing Graveyard
Tried Claude returning JSON. Responses kept getting truncated and malformed. Built increasingly complex JSON fixers. Then switched to simple structured text: `SHORTCUT: key | TITLE: action`. Worked perfectly every time. Don't force AI into rigid formats.

### [~15:00] The Great Simplification
User said: "make the simpler AI parser the only solution." This was the right call. The complex routing logic was fragile and produced inconsistent results. Simpler architecture, better results, easier to maintain.

### [~16:00] The Symbol Standardization Moment
User noticed Sublime shortcuts had beautiful Mac symbols (⌘⌥⇧⌃) but macOS Apple shortcuts still said "Command-X". Built a key standardizer. Hit a snag: Apple docs use hyphens (`Command-X`) while most others use plus signs. Added hyphen support and suddenly all macOS shortcuts became `⌘ + X`. The sticker app will look so much more professional with proper symbols.

---

## 2026-01-10 Pipeline Cleanup & Library Management Stories

### [~18:00] The Great Cleanup
Started with a workspace full of scattered Python files — 20+ scripts across multiple directories, 4 virtual environments eating 580MB. What followed was a satisfying purge. The codebase went from chaotic to focused in one session.

### [~19:00] The Output Directory Confusion
User pointed out: "outputs directory exists already but you created another one." Three different output directories had accumulated. Consolidated everything. Sometimes the best code change is deleting code (and directories).

### [~20:00] The Smart Library Vision
User asked: "is there a way to add more logic so that as new software is released or updated the same files are re-scanned?" This question revealed the bigger picture. The shortcut extractor isn't just a one-time tool — it's the backend for a living shortcut library.

### [~20:15] The PNG Breakthrough
User asked: "can this AI parser handle PNG as well?" Built an `ImageAIParser` using Claude Vision. Tested with `Kiro_crossplatform.png` — extracted 18 shortcuts at 100% confidence. The system now accepts both PDFs and PNGs.

### [~21:00] The Platform Problem
User spotted a real issue: shortcuts with platform "All" or "Cross-platform" wouldn't work in the sticker app. "I need users to choose if they are looking for macOS or Windows." Built a `PlatformSplitter`. User also made a sharp observation: "Linux doesn't use Mac keyboard commands" — so Linux shortcuts should just be treated as Windows.

### [~22:00] The Terminology Shift
User noticed "Software: 2" and said: "instead of software should we call it application — it's a little confusing." Small terminology changes matter when building user-facing products.

### [~23:00] The Platform-Specific Output Revelation
User noticed output files contained both macOS and Windows shortcuts mixed together. Changed output grouping to per-application-per-platform. Clean, predictable, database-ready.

### [~23:30] The Image Parser Breakthrough
Kiro cross-platform PNG had both Mac and Windows columns, but only Windows extracted. Two bugs: (1) vision prompt didn't tell Claude to look for multiple columns, (2) `Mac` ≠ `macOS` string mismatch silently dropped all Mac shortcuts. Tiny fix, huge impact.

### [~00:15] The CLI Platform Idea
User said: "add platform called CLI for CLI tools like Vim — so all shortcuts for Vim can be in one file." Brilliant insight. Vim shortcuts are the same on every OS. The platform model went from two options to three.

---

## 2026-01-10 OSA Platform & Smart Fallback Stories

### [~14:00] The CLI → OSA Revelation
User dropped a bombshell: "CLI commands just means it's the same regardless of operating system." This completely reframed the platform model. "CLI" was a developer concept. The user's concept was "Operating System Agnostic."

### [~14:20] The False OSA Detection
VS Code Windows was being incorrectly classified as OSA because text contained terminal references. Fix: removed text content analysis from OSA detection entirely. Don't let heuristics override explicit naming.

### [~22:50] The AI That Wouldn't Listen
Strengthened the AI prompt with "ABSOLUTE PLATFORM RULES - NO EXCEPTIONS." Ran extraction. The AI still classified Vim's `Ctrl+R` as Windows. The realization: you can't prompt-engineer away training data bias. The solution was beautifully simple: a three-line post-processing step. Don't fight the AI — fix its output.

### [~23:10] The Pipeline Order Epiphany
User pointed out RStudio was only generating Windows with 87 shortcuts and Mac with just 10. The standardizer was running before platform splitting — converting Mac shortcuts to Windows format before the splitter could find them. Pipeline order matters enormously.

### [~23:25] The Table Parser — When Python Beats AI
User asked: "If the Python script was able to see the columns, could we continue to use Python to build the output file?" Built a table parser. Perfect cross-platform splitting. No AI needed. Sometimes the best AI solution is no AI at all.

### [~23:50] The Ctrl ≠ Windows Correction
User dropped a crucial knowledge bomb: "A shortcut with Ctrl doesn't automatically mean it's a Windows shortcut — macOS uses Ctrl for shortcuts as well." This was a fundamental assumption error baked into multiple components. Domain expertise matters more than code.

---

## 2026-01-11 Quality Review & Database Integration Stories

### [~00:15] The `if shortcuts:` Bug
The smart fallback system only ran `if shortcuts:` — meaning when the table parser returned 0 shortcuts, the fallback never triggered. Changed it to always run. RStudio immediately went from 0 to 710 shortcuts. Sometimes the most impactful bugs are the simplest gates.

### [~01:00] The Quality Review Vision
User had a great idea: "Create a review folder — part of error checking is comparing the amount of commands in Windows to Mac output." Built a complete quality review system. Having visibility into extraction quality changes everything.

### [~01:15] The False Positive Realization
User observed: "Some applications do have shortcuts that don't have +/- or are just letters — can you verify against source?" Pattern-based detection was flagging Vim's `j` and RStudio's `Home` as malformed. Built an AI validator. AI correctly identified `j` as valid for Vim while confirming `:38 / :38` with title `/10/26, 12 PM` was extraction garbage.

### [~01:30] The Standardizer Autopsy
Mac shortcuts had corrupted key combinations — `⌥` with title `+/`. The standardizer was mangling already-symbolic shortcuts. User's call: "Let's turn off the standardizer completely for now." Accuracy over aesthetics.

### [~12:10] The PostgreSQL → SQLite Pivot
Tried to start the backend and hit `ECONNREFUSED`. Instead of fighting with `brew services start postgresql@14`, switched to SQLite. Changed two lines and the database was running instantly. Don't let infrastructure complexity block development.

### [~12:15] The Bridge Between Worlds
The extraction pipeline produces CSV files. The web app needs a database. Built `database_loader.js` to bridge the gap. First load: 709 shortcuts from 8 applications. The extraction pipeline and web app are finally connected.

### [~12:20] The Real Data Moment
User pushed back on sample data: "I want to use my data because I don't want a surprise later." Smart call. Ran the full extraction pipeline — 12 files, 1765 shortcuts. Seeing VS Code (176), IntelliJ IDEA (174), Vim (96) populate the database with actual extracted shortcuts was satisfying.

### [~13:00] The Sticker Design Vision
User laid out the vision: "I'm going for the flow of something like Canva — graphic art design for keyboard shortcuts." The user wisely asked: "Would a spec be better for this?" Yes. Chat is great for quick fixes; specs are for complex features.

---

## 2026-04-10 Sticker Design Tool Stories

### [~10:00] The Deterministic Spec
User rewrote the spec with deterministic rules, constraints, and invariants instead of user stories. Print-ready output requires pixel precision. User stories describe intent; deterministic specs describe exact behavior.

### [~10:30] The Design System Birth
Created `designSystem.js` — single source of truth for all visual parameters. Changing a palette or text size propagates everywhere automatically. No more magic numbers.

### [~15:00] The Export Moment
First PNG export at 300 DPI. Watching the canvas scale from 600px to 1125px and produce a crisp, print-ready image was deeply satisfying. The sticker app went from "design tool" to "production tool."

### [~21:30] The Print Legibility Wake-Up
Original font sizes (8-16px on 600px display) were illegible when printed at 3.75". Increased all sizes 60-80%. Changed canvas from `minHeight` to strict `height`. A physical sticker has a fixed size — the digital canvas must enforce the same constraint.

### [~22:00] The Strict Limits Philosophy
User said: "Don't leave it to users — that's how you get unsatisfied customers." Implemented strict per-text-size limits. The system guarantees legibility by preventing overcrowding.

### [~00:00] The Phase 3 Sprint
In one evening session: database schema update, JWT authentication, layouts CRUD API, AuthContext, SignIn/SignUp integration, UserHome page with 4 tabs, SaveModal with guest/user flows, and full integration into CreateLayout. Phase 3 went from zero to complete in about 3 hours.

---

## 2026-04-21 Column-Aware Capacity — The Last Mile of TASK-12

### The Dead Variable
`COLUMN_TOTAL` was computed from `calculateColumnCapacity().total` but never used — every shortcut counter, drop handler, and alert still referenced `MAX_TOTAL_SHORTCUTS` from the old `getMaxShortcuts()`. Two variables, same concept, only one wired up. The fix was satisfying: collapse them into one. `MAX_TOTAL_SHORTCUTS` now gets its value directly from `calculateColumnCapacity().total`, and the unused `getMaxShortcuts` import was cleaned out. Small change, but it completed the wiring that makes the independent flex column layout actually enforce correct per-column totals.

### The Wiring Step
`calculateColumnCapacity` existed in `designSystem.js` but wasn't imported into `CreateLayout.jsx`. Added the import and computed three derived values — `columnCapacity`, `perSectionLimits`, and `COLUMN_TOTAL` — right alongside the existing capacity constants. The satisfying part: the function was already battle-tested and correct. This was pure plumbing — connecting a working engine to the dashboard gauges. Sometimes the most impactful work is just connecting things that already exist.

### The Global Limit That Wasn't
`MAX_SHORTCUTS_PER_SECTION` was a single number applied to every section — but with independent flex columns, a column with 2 sections has more height per section than a column with 3. The fix: delete the global constant entirely and replace it with `getSectionLimit(sectionIndex)`, a one-liner that reads from the per-section array computed by `calculateColumnCapacity()`. Four drop handler sites updated, zero new bugs. The satisfying part: the `perSectionLimits` array was already being computed and sitting unused — it just needed to be wired in.

### The Flex That Was Already There
Verified the "unlocked sections stretch via `flex: 1`" sub-task and found it was already done. The `renderSection` function applies `flex: 1` to unlocked sections and `flex: '0 0 auto'` to locked ones. The column containers use `flexDirection: column`. The inner content div mirrors the same pattern. Three levels of flex cooperation, all already wired correctly. Sometimes the best task completion is confirming the work is already done — no code changes, just a clean verification pass.

### The Grid That Held Everything Back
The sections grid used `display: grid; gridTemplateColumns: repeat(2, 1fr)` — clean, simple, and wrong for this use case. When a locked section in the left column shrunk to 3 shortcuts, the right column section in the same row was forced to match that height, leaving a huge gap. The fix: rip out the grid entirely and replace it with two independent flex columns. Left column gets even indices, right column gets odd. Each column sizes its sections independently — no cross-column height coupling. The `renderSection` helper function was born out of necessity: the same 150+ lines of section JSX needed to render in both columns without duplication. Sometimes the right abstraction emerges from the constraint, not from planning.

---

## Key Insights (Accumulated)

1. **Pragmatism over purity** — Ship working features, refactor later. Inline CSS solved global style conflicts immediately.
2. **Don't fight AI training bias — fix the output** — Post-processing is more reliable than prompt engineering.
3. **Python beats AI for structured data** — Table-format documents are better parsed with Python than AI.
4. **Simple formats beat complex ones** — Structured text is more reliable than JSON for LLM output.
5. **Ctrl is ambiguous** — macOS uses Ctrl extensively. Never assume Ctrl means Windows.
6. **Pipeline order is architecture** — Standardize AFTER splitting, not before.
7. **The last 5% is the hardest** — Getting from 95% correct to 100% requires disproportionate effort.
8. **Users have domain expertise AI lacks** — Listen to your users.
9. **SQLite beats PostgreSQL for local dev** — Zero configuration, instant startup.
10. **Use real data from day one** — Sample data hides problems.
11. **Quality visibility changes behavior** — Once you can see extraction quality metrics, you know exactly what to fix.
12. **Preserve original data** — Standardization is a presentation concern, not a data concern.
13. **Every pipeline needs a reset button** — `cleanup_outputs.py` saves time and prevents stale data.
14. **Specs are for complex features** — Quick fixes belong in chat. Multi-constraint design systems need structured planning.
15. **Documentation is memory** — Comprehensive docs enable continuity across sessions.
16. **Computed values should have one source of truth** — `COLUMN_TOTAL` and `MAX_TOTAL_SHORTCUTS` were two variables for the same concept. Collapsing them into one eliminated a dead variable and made the data flow obvious.


---

## 2026-04-21 Canvas Section Management — The UX Testing Loop

### The Delete Button That Moved Content
The ✕ delete button was inline in the flex row — it took up space. When you locked a section, the button vanished and the description text reflowed into the freed pixels. Subtle but noticeable. The fix: pull it out of the flow entirely with `position: absolute`, show it only on hover. Now locking a section changes nothing about the text layout. The lesson: UI chrome that appears/disappears must never affect content geometry.

### The Pinch That Didn't Prevent
Trackpad pinch-to-zoom was "working" but felt wrong — the page would zoom AND the canvas would zoom simultaneously. The culprit: React's event handlers are passive by default, so `e.preventDefault()` was silently failing. Switched to native `addEventListener` with `{ passive: false }` and suddenly the browser stopped fighting us. Sometimes React's abstractions hide important browser behavior.

### The Grid That Couldn't Let Go
Five sections on the canvas: 3 left, 2 right. Lock a small section on the right — it shrinks, but the grid row height stays tall because the left section in the same row is still big. A gap appears. The user said: "sections in the same rows do not change size independently." That's CSS grid working exactly as designed — and exactly wrong for this use case. The fix (TASK-12): rip out the grid, use two independent flex columns. Each column sizes its sections without caring what the other column is doing.

### The Spec-Driven Development Loop
This session was the first real test of the Kiro spec workflow for iterative UX development. The pattern: test in browser → notice UX issue → describe it in chat → update spec with new requirement/task → implement → test again. The spec became a living document that tracked both what was done and what was discovered during testing. The steering file meant every time we touched canvas files, the domain knowledge was automatically in context.

### The Cross-Section Drag That Was Almost Free
Moving shortcuts between sections seemed like a big feature. Turns out the infrastructure was already there — `application/reorder` data already carried the source section ID. The existing drop handler just needed an `else if (fromSection !== section.id)` branch. The `moveShortcutBetweenSections` helper was 8 lines. Sometimes the best features are the ones where 90% of the work was already done for a different reason.

### The Dependency That Watched Length, Not Order
Section reorder was "working" — drag a section header, drop it on another section, the array reorders, sections swap columns. But there was a silent bug: if a section moved from a column with 2 sections (generous capacity) to a column with 3 sections (tighter capacity), its shortcuts weren't trimmed. The trimming `useEffect` depended on `customSections.length` — and reordering doesn't change the length. Changed it to depend on `customSections` itself. One word removed (`.length`), and suddenly reorder correctly enforces per-column capacity. The lesson: when your logic depends on array order, your dependency must be the array, not its length.

### The Trimming That Was Missing
The per-column capacity numbers were always correct — `calculateColumnCapacity` recalculated on every render, the UI showed the right limits, and drop handlers enforced them. But there was a gap: shortcuts already on the canvas were never trimmed when adding a section reduced capacity. Add a 5th section and the left column goes from 2 to 3 sections — each section's limit drops, but the existing 8 shortcuts just sat there, overflowing. The fix was a `useEffect` that watches section count and trims excess shortcuts. The satisfying part: the trimming logic was 12 lines, but finding the gap required understanding the difference between "computed correctly" and "enforced retroactively." Reactive UI values don't retroactively fix stale data — you need an explicit side effect for that.
