# Research & platformer design references

Reference research only. No judgment of DENAI is made in this file — see files 05-09 for how these principles apply to the actual game. Every claim below is either attributed to a named primary source (interview, dev talk, documentation) or explicitly labeled as inference/synthesis. Where search access could not confirm a claim to primary-source standard, that gap is stated rather than papered over.

---

## A. Celeste

### A1. Forgiveness techniques (coyote time, jump buffering, dash corner-correction)
**Principle:** Several small, deliberate "cheats" make inputs register as the player meant them, not as the game literally received them: a short grace window to jump after walking off a ledge (coyote time), a short grace window where a jump pressed just before landing still fires on landing (jump buffering), and nudging the player up onto a ledge corner when a dash would otherwise clip it (corner correction).
**Player problem it solves:** Human reaction time and pixel-perfect timing are not the same thing — without these, players fail inputs they "should" have landed, which reads as the game being unfair rather than the player being imprecise.
**Source:** Maddy Thorson (Celeste co-creator/director), "Celeste & Forgiveness," published essay/thread, https://maddymakesgames.com/articles/celeste_and_forgiveness/ — a primary-source developer write-up explicitly describing these techniques as used in Celeste. Also covered secondhand by GameSpot (https://www.gamespot.com/articles/celeste-dev-explains-how-they-made-their-game-feel/1100-6474775/) and Gigazine (https://gigazine.net/gsc_news/en/20200317-celeste-action-feel-things). Thorson's own framing: the team didn't invent these techniques, they're common tools, but Celeste tunes and combines them deliberately.
**Applies to DENAI:** (left for the main audit — see files 05-09)

### A2. Level Design Workshop: Designing Celeste (GDC talk)
**Principle:** A dedicated GDC 2017 "Level Design Workshop" session breaks down Celeste's level-design methodology directly from the team.
**Player problem it solves:** N/A — this is a process/methodology talk, not a single mechanic.
**Source:** GDC Vault, "Level Design Workshop: Designing Celeste," https://gdcvault.com/play/1024307/Level-Design-Workshop-Designing-Celeste — primary source (GDC-hosted talk), but the recording itself sits behind GDC Vault's access wall; search tooling could only confirm the talk's existence and title, not extract its specific content. **Gap:** I could not read/transcribe this talk's actual content — treat the existence of the talk as confirmed, its specific claims as unverified by me.
**Applies to DENAI:** (left for the main audit — see files 05-09)

### A3. Assist Mode as an options layer, not a difficulty rewrite
**Principle:** Celeste ships a built-in Assist Mode exposing individual toggles (game speed, stamina, number of air dashes, even invincibility) rather than one "easy mode" switch, and frames it as an alternate way to play rather than erasing the designed difficulty.
**Player problem it solves:** Different players are blocked by different specific frictions (stamina management vs. precision vs. losing progress on death); a single difficulty slider can't address that, but individually toggleable systems can.
**Source:** Vice interview with designer Matt/Maddy Thorson, https://www.vice.com/en_us/article/d3w887/celeste-difficulty-assist-mode — primary-source quote: the mode was added "to include even more people who couldn't usually play hardcore platformers." Secondary critical take from Mark Brown (GMTK) referenced in search results arguing Assist Mode doesn't let players tune *punishment* specifically (i.e., it changes what you can do, not what happens when you fail) — this critique is reported secondhand in search results, not independently verified by me against Brown's original video.
**Applies to DENAI:** (left for the main audit — see files 05-09)

---

## B. Super Mario (Super Mario 3D World, by extension the Mario design lineage)

### B1. Four-part "teach, develop, twist, conclude" level structure
**Principle:** Game Maker's Toolkit creator Mark Brown, analyzing Super Mario 3D World, attributes its level design to director Koichi Hayashida and describes stages built as compact, self-contained lessons: a single new idea is introduced, then developed, then twisted in an unexpected way, then given a concluding beat — explicitly compared to *kishōtenketsu*, a four-part East Asian narrative structure (ki-shō-ten-ketsu: introduction–development–twist–conclusion).
**Player problem it solves:** Teaches a mechanic through guided, low-risk experience inside the level itself (no separate tutorial screen), then proves the player actually learned it by testing a variation, without ever requiring more than one new idea be held in mind at once.
**Source:** Mark Brown / Game Maker's Toolkit, "Super Mario 3D World's 4 Step Level Design" (YouTube). I could not independently re-derive or confirm the exact fourth step's label from search snippets alone — "Introduction, Development, Twist" were explicitly confirmed in secondary coverage (McVUK: https://www.mcvuk.com/development/video-nintendos-level-design-secrets-in-four-steps, Nintendo Life: https://www.nintendolife.com/news/2015/03/video_nintendos_four_step_stage_design_is_why_you_love_super_mario_games_so_much); the fourth step ("conclusion") is my own inference from the well-documented four-part *kishōtenketsu* structure the video is explicitly named after, not something I confirmed word-for-word from the video itself. **Labeled: steps 1-3 are source-confirmed via secondary coverage; step 4 is inference from the named structure, not directly confirmed.**
**Applies to DENAI:** (left for the main audit — see files 05-09)

### B2. Teaching through safe, optional repetition of the same shape before the real test
**Principle:** A documented pattern in 2D Mario level design (and broader "teach without tutorials" writing) is to place an optional, lower-stakes reward in a spot that requires the player to already use the skill the level is about to test — so the player self-teaches via curiosity-driven exploration rather than a forced tutorial prompt.
**Source:** General secondary-source level-design writing (e.g., a referenced GameDō article on "teaching without tutorials") rather than a single named Nintendo developer interview. **Labeled as a documented pattern from secondary design-analysis sources, not a verified first-party Nintendo statement.**
**Applies to DENAI:** (left for the main audit — see files 05-09)

---

## C. Hollow Knight

### C1. World built from legible, interconnected spaces rather than a level checklist
**Principle:** Team Cherry co-directors describe designing by starting from a physical space/setting (e.g., "a cavern with a lake on the left," "a ruined tower") and letting the small-scale level design follow from that space, rather than starting from a checklist of platforms/enemies to place — explicitly contrasted with a more conventional "take an empty space and ask where to put a few platforms" approach.
**Player problem it solves:** Produces a world that reads as a coherent *place* the player is navigating, not a sequence of disconnected gameplay rooms — supports the genre's core exploration/orientation loop.
**Source:** ACMI interview with William Pellen and Ari Gibson (Team Cherry), referenced via GamesRadar coverage, https://www.gamesradar.com/games/action/team-cherry-explains-the-silksong-development-process-that-was-so-fun-devs-just-couldnt-stop-if-youre-trying-to-build-a-mario-level-you-might-take-an-empty-space-and-think-oh-should-there-be-a-few-platforms-here — primary-source quotes from the directors, reported through a secondary outlet (I did not access the original ACMI interview directly, only this outlet's excerpting of it).
**Applies to DENAI:** (left for the main audit — see files 05-09)

### C2. Deliberate map legibility — map locations correspond to how the world actually feels
**Principle:** Team Cherry put specific design effort into making in-world map markers/regions correspond to how areas actually feel and connect, rather than being an arbitrary abstraction layered on top.
**Source:** PC Gamer interview, "How to design a great Metroidvania map," https://pcgamer.com/how-to-design-a-great-metroidvania-map — primary-source quote attributed to William Pellen.
**Applies to DENAI:** (left for the main audit — see files 05-09)

### C3. Boss Keys world-design analysis (secondary critical analysis, not a developer source)
**Principle:** Mark Brown's "Boss Keys" video-essay series analyzes Hollow Knight's world shape, sequencing, and the "lock and key" structure of how upgrades gate access to areas, and the series explicitly reuses the same analytical framework across Zelda, Castlevania, Dark Souls, and Hollow Knight to compare approaches.
**Source:** Game Maker's Toolkit, "The World Design of Hollow Knight | Boss Keys" — this is **critical/analytical commentary by a third party, not a developer statement**; flagged explicitly as such. https://gmtk.substack.com/p/the-world-design-of-hollow-knight-silksongs (companion write-up for the Silksong follow-up episode).
**Applies to DENAI:** (left for the main audit — see files 05-09)

---

## D. Ori and the Blind Forest

**Coverage note up front:** This was the weakest-sourced reference. No GDC talk specifically on Blind Forest's parallax/layering system was found; the closest located material is a GDC 2015 animation talk and secondhand/anecdotal forum commentary. Claims below are marked accordingly — treat this section as the thinnest-evidenced of the six.

### D1. Hand-animated, Ghibli-influenced visual approach (confirmed existence, not deeply sourced)
**Principle:** The game's visual style was built around hand-crafted animation and an explicitly stated Studio Ghibli influence, with later interviews (about the sequel, reported secondhand for the original) describing hand-lighting assets individually rather than relying on uniform automated lighting.
**Source:** GDC 2015 talk by James Benson (animator on Ori and the Blind Forest at Moon Studios), listed on GDC Vault — existence confirmed, content not independently verified by me (https://www.gdcvault.com per search results, exact session URL not confirmed). Ghibli-influence attribution is widely reported across multiple outlets but not traced to one specific primary quote in this search pass.
**Applies to DENAI:** (left for the main audit — see files 05-09)

### D2. Parallax/3D sprite placement — UNVERIFIED, explicitly flagged
**Principle (unverified claim found):** One unverified forum comment (Polycount) claims the game does not use a conventional flat 2D parallax-layer approach and instead places sprites/art directly in 3D space for depth.
**Source:** Polycount forum post, reported via search snippet only (https://polycount.com/discussion/comment/2101739) — **this is anecdotal forum commentary, not a developer statement or documentation. I am explicitly not treating this as confirmed.** No official Moon Studios statement on the layering/parallax technique was located in this search pass.
**Applies to DENAI:** (left for the main audit — see files 05-09)

---

## E. Super Meat Boy

### E1. Removing lives so difficulty lives entirely in level/retry design
**Principle:** Edmund McMillen (Team Meat) wrote a design essay arguing for removing a traditional "lives" system so that a game's difficulty is expressed purely through level design and near-instant retry, rather than through an artificial resource (lives/continues) that gates how much of the difficulty the player even gets to experience.
**Player problem it solves:** A lives system punishes failure with *loss of access* (having to replay earlier content, or being locked out), which conflates "this level is hard" with "you've run out of chances" — removing lives isolates difficulty to the moment of failure and lets retry be instant and consequence-free except for the single attempt.
**Source:** Edmund McMillen, "Why So Hard?" (originally SuperMeatBoy.com/Gamasutra, April 21 2010), now hosted at Game Developer: https://www.gamedeveloper.com/game-platforms/-i-super-meat-boy-i-s-mcmillen-explains-why-so-hard- — primary-source developer essay, confirmed to exist and be about this exact topic; I could not extract McMillen's full specific argument text from search snippets alone (only Kotaku's secondhand summary of its existence/theme), so treat the existence and general thesis as confirmed, specific sub-claims as needing direct reading of the source.
**Applies to DENAI:** (left for the main audit — see files 05-09)

### E2. Super Meat Boy / Super Mario Bros lineage, stated directly by the developers
**Principle:** The developers themselves described the game's design lineage directly: "Super Meat Boy is Super Mario Bros. if Tommy and I made it" — i.e., deliberately positioning the game as an evolution of classic tight, readable platforming rather than a genre departure.
**Source:** Game Developer postmortem (formerly Gamasutra), referenced via search result snippet, https://www.gamedeveloper.com/audio/postmortem-team-meat-s-i-super-meat-boy-i- — primary-source developer quote (McMillen/Refenes), confirmed via search snippet; full postmortem not independently read in full.
**Applies to DENAI:** (left for the main audit — see files 05-09)

---

## F. Human Resource Machine (applied-logic / programming-as-play)

**Coverage note up front:** No developer interview specifically discussing HRM's design philosophy was located in this search pass — search results returned only the Wikipedia summary. This is the second-weakest-sourced reference after Ori. One general-knowledge inference is included below, explicitly labeled as such, not sourced to a developer statement.

### F1. Program state made directly visible and steppable (inference, not confirmed via interview)
**Principle (my inference, not from a located developer interview):** Human Resource Machine represents a program as a visible, spatial flow of instructions the player assembles by hand, and lets the player step execution forward to watch data move between visible "inbox," "outbox," and worker-held values — i.e., the computational model is the *level itself*, not a separate abstraction explained in text.
**Player problem it solves (inference):** Program behavior is normally invisible (it happens inside a machine); making every intermediate state visible and player-controlled turns "debugging my understanding" into the core moment-to-moment gameplay loop rather than a separate activity.
**Source:** This principle is stated from general knowledge of the game's known mechanics (genre-level, widely-documented gameplay facts about HRM's visible program flow), **not from a developer interview I located and read**. The only source actually confirmed via search is Wikipedia's credit of the design to Kyle Gabler, Kyle Gray, and Allan Blomquist (Tomorrow Corporation) — https://en.wikipedia.org/wiki/Human_Resource_Machine. **Labeled explicitly: this is my own synthesis/inference about why the mechanic works, not a sourced developer quote about intent.**
**Applies to DENAI:** (left for the main audit — see files 05-09)

---

## Accessibility reference (fully reachable, strongest-sourced section)

### Microsoft "Making games accessible" (UWP developer documentation)
**Principle:** Documented, concrete guidance organized around two core principles — (1) give players individually toggleable options rather than one difficulty switch, and (2) communicate every piece of game-critical information through more than one channel at once (e.g., color *and* shape/pattern, not color alone). Specific actionable rules include: don't rely on color alone to distinguish game objects (use shape/pattern too, specifically because red/green color combinations are hardest to distinguish); fully remappable controls benefit both assistive-device users and players who simply prefer a different layout; provide a wide range of difficulty options rather than one "easy mode," because different players are blocked by different specific frictions; subtitle/caption guidance (max ~38 characters/line, 2-3 lines visible at once, speaker identification, high contrast, on/off toggle); photosensitivity guidance (avoid 5-30Hz flashing, avoid >3 flashes/second over >25% of screen, avoid dense repeated-stripe patterns over >5 lines, default "flashing" to off); an explicit accessibility review checklist spanning cinematics, artwork, menus, gameplay feedback, HUD, and control input.
**Player problem it solves:** Directly stated in the doc — accessibility gaps aren't a "nice to have" edge case; the doc cites that ~19% of the US population has some form of disability, and frames many "accessibility" features (subtitles, remappable controls) as having become mainstream *quality* features that benefit all players, not just the originally-targeted group.
**Source:** Microsoft Learn, "Making games accessible - UWP applications," https://learn.microsoft.com/en-us/windows/uwp/gaming/accessibility-for-games — primary-source, official, live documentation page, fetched and read directly in full for this research pass. Itself cites http://gameaccessibilityguidelines.com/ and the AbleGamers Foundation guidelines (https://accessible.games/accessible-player-experiences/) as its own source material.
**Applies to DENAI:** (left for the main audit — see files 05-09)

---

## Sources consulted

- https://maddymakesgames.com/articles/celeste_and_forgiveness/
- https://www.gamespot.com/articles/celeste-dev-explains-how-they-made-their-game-feel/1100-6474775/
- https://gigazine.net/gsc_news/en/20200317-celeste-action-feel-things
- https://gdcvault.com/play/1024307/Level-Design-Workshop-Designing-Celeste
- https://www.vice.com/en_us/article/d3w887/celeste-difficulty-assist-mode
- https://www.mcvuk.com/development/video-nintendos-level-design-secrets-in-four-steps
- https://www.nintendolife.com/news/2015/03/video_nintendos_four_step_stage_design_is_why_you_love_super_mario_games_so_much
- https://www.gamesradar.com/games/action/team-cherry-explains-the-silksong-development-process-that-was-so-fun-devs-just-couldnt-stop-if-youre-trying-to-build-a-mario-level-you-might-take-an-empty-space-and-think-oh-should-there-be-a-few-platforms-here
- https://pcgamer.com/how-to-design-a-great-metroidvania-map
- https://gmtk.substack.com/p/the-world-design-of-hollow-knight-silksongs
- https://www.gamedeveloper.com/game-platforms/-i-super-meat-boy-i-s-mcmillen-explains-why-so-hard-
- https://www.gamedeveloper.com/audio/postmortem-team-meat-s-i-super-meat-boy-i-
- https://en.wikipedia.org/wiki/Human_Resource_Machine
- https://learn.microsoft.com/en-us/windows/uwp/gaming/accessibility-for-games (fetched and read in full)
- https://polycount.com/discussion/comment/2101739 (explicitly flagged as unverified anecdotal commentary, not relied on as fact)

## Gaps / not found

- **https://expressiveintelligence.github.io/papers/smith-sandbox-08.pdf** — the URL resolves (a 772.8KB PDF was actually retrieved), but automated text extraction failed (the PDF's text streams are compressed in a way the fetch tool could not decode into readable prose), so **I could not read this paper's actual content**. A direct-title search for a 2008 Gillian Smith "sandbox" paper did not turn up an exact match either; the closest confirmed related work from the same research group (Gillian Smith, UC Santa Cruz Expressive Intelligence Studio) is her later procedural-level-design work (2009 FDG rhythm-based level generation paper, 2010 "Analyzing the Expressive Range of a Level Generator," 2012 Tanagra dissertation) — these are plausibly adjacent but are **not** confirmed to be the same paper, so I have not summarized them as if they were.
- **https://re.public.polimi.it/handle/11311/1082413** — returned HTTP 403 Forbidden on fetch. Completely unreachable in this research pass; no content, title, or abstract could be confirmed. A generic search for the handle ID also failed to resolve it.
- **GDC Vault talks generally** (Designing Celeste, Ori's GDC 2015 animation talk) — existence and titles confirmed via search, but GDC Vault's actual session content sits behind an access layer that search snippets don't expose; treat these as "confirmed to exist, content not independently read" rather than fully verified sources.
- **Ori and the Blind Forest** and **Human Resource Machine** are the two weakest sections overall — see the coverage notes at the top of sections D and F.
