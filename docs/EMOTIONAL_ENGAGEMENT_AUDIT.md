# The Response Game: emotional engagement review

28 September 2026 · Creative, narrative and retention review

**Creative direction: the player should remember the response they left behind.** A familiar crew can work because help arrived. A familiar stretch of water has less protection because the player committed equipment elsewhere. The last scene should make those choices recognizable without showing a grade.

This review accepts the player-first redesign as the usability foundation. It does not reopen that design problem. The implemented simulation remains revision 17.4; the approved screen studies and this narrative treatment are proposals. There is no measured evidence yet that either treatment increases attachment, completion or replay.

Reviewed: `PLAYER_FIRST_REDESIGN.md`, its four wireframes, `v17-ui.js`, `v17-engine.js`, the authored harbor scene and existing test/QA records, at branch commit `b427642`. The accompanying [consequence storyboard](EMOTIONAL_STORYBOARD.html) uses two scripted trajectories through the unchanged engine to demonstrate the same allocation before and after a failure. It is a design demonstration, not a replacement game.

## Creative verdict

**The concept has emotional potential, but the current presentation has not earned attachment.** Its strongest material is already in the simulation: waiting crews, finite equipment, a protected area that depends on a reserve, and a handover carrying unresolved problems. Those are stories. Presently they arrive primarily as descriptions of work and changes in records.

The accepted wireframes make the choices legible. They still leave the player outside the incident: reading about a response rather than recognizing people and places affected by their contribution. The map is attractive context, but is not yet a persistent witness to the player's decisions. The outcome describes success; it does not yet bring the opening scene back with the player's changes visible.

Do not solve this with more lore, dialogue screens, relationship meters, collectibles, moral choices or catastrophes. Replace generic messages and repeated status summaries with short, specific human acknowledgments and environmental changes supported by state. The unit of emotional design is **a remembered commitment and its later consequence**, not an additional interaction.

### Commercial and festival review lens

These are creative judgments, not platform eligibility checks, award predictions or statements about official categories.

| Review lens | Candid assessment | Evidence needed to change the assessment |
| --- | --- | --- |
| Steam / Epic consumer pitch | “Coordinate resources” is a job description. The distinctive promise is making compromises and seeing a response change because of them. That promise needs to be visible in ordinary play. | A short capture of one real choice, a spatial consequence and a later callback; no explanatory trailer required to understand the payoff. |
| Indie festival identity | An authentic resource game can stand apart, but navy colors, maps and institutional language alone do not make it memorable. | A recognizable place and restrained field voices that recur, with an ending authored by the player's actual commitments. |
| Innovation review | Replacing quizzes with consequences is promising. Presenting a deterministic checklist cinematically is not by itself an innovation claim. | Players independently recount different, causally accurate stories from the same incident. |
| Production quality | Emotional coherence matters more here than more visual effects. Generic praise or an inaccurate “saved the marsh” ending would weaken credibility. | Every sound, visual transition and line agrees with the resource record; reduced-motion and muted play carry the same story. |

## Ranking method

The five top-20 lists below are ranked **within each list by estimated player-retention impact**, strongest first. H = likely foundational impact; M = supporting impact; L = polish or narrower appeal. These are expert hypotheses, not measured effect sizes. Each row names a distinct motivation, risk or treatment; the same important design principle can recur across categories because those categories answer different questions.

The cross-category implementation order is ranked in the Retention Improvement Plan. Favor broad, state-supported changes first. No recommendation adds a player-facing system, form, metric, training requirement or compulsory click. Existing engine limitations are named where presentation alone cannot deliver the suggested emotion.

## 1. Emotional Engagement Audit

Treat the following as intended player feelings, not feelings established by testing. Every scene needs a concrete object of concern. Not every scene needs maximum tension.

| Scene | Feeling to invite | Worry | What is at risk | Hoped-for outcome | Why remember it / presentation revision |
| --- | --- | --- | --- | --- | --- |
| Home / opening | Curiosity and a useful sense of responsibility | Will I be able to help? | The work at the source and the approaching containment need | Understand one thing I can do | Establish source berth, channel and marsh once; return to these same places later. |
| First crew request | Connection to people waiting on help | They cannot begin yet | Delayed source work | A usable team is on its way | A consistent Entry Group voice says what is missing; a waiting posture makes the hold visible. |
| First commitment | Ownership, with a cost | What have I left uncovered? | Funds, delay or channel support | A defensible commitment | Keep the destination and sacrificed coverage visible together; do not celebrate dispatch as arrival. |
| Boom allocation | Deliberate compromise | I cannot meet both needs | A particular protection gap | Protect the higher-consequence area and retain flexibility | The exact line the player builds remains on the map for the rest of the incident. |
| Resource arrival | Anticipation, then earned relief | Is the help actually usable? | Continued source hold | Verified capability supports the crew | Show arrival, verification and assignment as distinct existing states; the recurring crew acknowledges only established readiness. |
| Conflicting equipment report | Concern, followed by clarity | I was counting on that unit | Recovery support that cannot be supplied | Know what is genuinely available | The parked skimmer remains in the scene, marked unable to work; a status correction does not animate a repair. |
| Coupling failure | Surprise; relief or regret | Will the protection line hold? | Coverage at the priority area | The reserve absorbs the failure | Show the same section fail, then the actual spare replace it or a gap remain. No extra dialog. |
| Skimmer reassignment | Uneasy ownership | Helping one place leaves another short | Recovery capacity at the source assignment | Accept a compromise knowingly | One vessel changes assignment; its old location visibly loses that vessel. |
| Forecast | Quiet anticipation | Will the next crew inherit a shortage? | Continuity of work | Orders arrive before capacity is needed | A concise message from Logistics sets up an eventual callback, not an invented countdown. |
| Relief assignment / duty limit | Relief or pressure | Can the crew continue within its limit? | Source work after 10:00 | Verified relief takes the source assignment | Revisit the opening crew; show handover only when an actual relief resource is assigned. |
| COP / coordination | Responsibility to the rest of the team | Will someone act on an inaccurate picture? | Shared understanding of remaining constraints | The incoming team knows what is unresolved | Acknowledge the material gap conveyed. Do not award a resource or repaired condition for sending a message. |
| Handover / outcome | Mixed pride, regret and closure | What am I leaving for the next watch? | Work that remains unsupported | A truthful handover and a reason to reconsider a choice | Return to the opening composition with current placements and gaps; two callbacks and one open question replace a score-led ending. |
| Replay invitation | Curiosity | Would another plan create a different response? | A different compromise, not a lower grade | Find out, without repeating a lecture | Name the actual alternative: reverse current pressure, retain a spare, keep the channel team. Do not promise unseen incidents. |
| Help / pause / archive | Reassurance and continuity | Will I lose my place or decision? | Confidence in continuing | Return to the exact situation | Preserve the same scene and language; these screens need calm continuity, not manufactured drama. |

### Top 20 opportunities for emotional engagement

| Rank | Impact | Opportunity | Why it could retain players |
| --- | --- | --- | --- |
| E01 | H | Revisit a player's earlier commitment at its first material consequence. | The player recognizes authorship, rather than an unrelated event. |
| E02 | H | End on the changed place and remaining work. | Creates ownership that a numerical result cannot supply. |
| E03 | H | Give Entry Group a consistent, concise voice from waiting through handover. | A recurring beneficiary gives resource decisions a human destination. |
| E04 | H | Let the held spare become the same visible replacement later. | A quiet early sacrifice gains an understandable payoff. |
| E05 | H | Show what a reassignment takes away as clearly as what it supplies. | Compromise becomes felt, not merely disclosed. |
| E06 | H | Allow pride and an unresolved gap to coexist in the ending. | Players can value their response while imagining another approach. |
| E07 | M | Attribute success specifically: “The spare you retained replaced the failed section.” | Recognition is credible because it names the action. |
| E08 | M | Give delayed help a visible, persistent destination. | Anticipation belongs to a place and crew rather than an ETA label. |
| E09 | M | Return to the original crew when relief is actually assigned. | Planning becomes care for continuity, without a fatigue minigame. |
| E10 | M | Let Operations acknowledge an accepted limitation plainly. | A difficult decision feels shared and professional rather than silently graded. |
| E11 | M | Use the same shoreline landmarks throughout the run. | A place becomes familiar enough to care about. |
| E12 | M | Show an incomplete plan honestly without shaming the player. | Disappointment invites another attempt more readily than blame. |
| E13 | M | Keep the player addressed as a member of the response. | Belonging supports identity without an avatar or biography. |
| E14 | M | Replace generic congratulations with crew/work status. | The reward is that a real dependency in the game changed. |
| E15 | M | Let the incoming watch acknowledge the limitation that was handed over. | The final action feels received, not deposited in a report. |
| E16 | L | Use quiet after a resolved pressure. | Relief becomes perceptible without another reward screen. |
| E17 | L | Give existing senders distinct sentence rhythms. | Repeated voices become recognizable without increasing reading. |
| E18 | L | Keep persistent visual traces of the player's allocation. | The scene becomes a record the player can recognize at a glance. |
| E19 | L | Use restrained, optional radio delivery for the most important callbacks. | Adds presence for players who enable sound; captions remain complete. |
| E20 | L | Name the closing chapter “The response you leave.” | Frames the ending as stewardship rather than a test result. |

## 2. Player Identity Audit

**Current identity:** a functional title with procedural duties. **Recommended identity:** the person keeping the resource picture dependable so the response can work. The player belongs to a team; they are neither a detached clerk nor an all-powerful commander.

| Question | Lightweight answer in the experience | Where it belongs |
| --- | --- | --- |
| Who am I? | “You are coordinating resources for this response.” Optional detail names Resources Unit, Planning Section. | One opening line. |
| Why am I here? | “Crews need the right help in the right place.” | The first crew request and its visible waiting state. |
| Why am I responsible? | “Your recommendations and resource record shape what the team can use next.” | Actual commitment and assignment receipts. |
| Why does the outcome matter? | “The next watch inherits the people, equipment and gaps you leave.” | Recurring locations and the final handover. |
| What belongs to me? | This run's recommendations, retained reserve and recorded constraints. | “Your retained spare,” “the team you sourced,” only when supported by history. |

Use three recognizable existing voices: Entry Group is concrete and immediate; Operations names the accepted tradeoff; the incoming Resources Unit confirms what it inherits. Logistics remains concise when an order or ETA matters. Sender labels are sufficient initially. Optional fictional names can be presentation aliases, but should not create cast-management, relationship values or extra lore.

Do not say “your orders saved everyone,” imply that Resources directs field tactics, or make crews morally dependent on the player. Resources/check-in/accountability and Operations' resource tracking have defined functions; keep those distinctions underneath plain language. [FEMA resource-management training](https://emilms.fema.gov/is_0703b/groups/313.html).

## 3. Narrative Tension Audit

Tension comes from caring about a consequence while the result remains unsettled. Making text urgent does not fix an obvious choice. Some interactions should provide relief or recognition rather than another dilemma.

| Existing decision / beat | Genuine tension available | What is sacrificed or vulnerable | Presentation transformation / honest limit |
| --- | --- | --- | --- |
| Request clarification | Wanting to send help promptly while understanding the need | Dispatch accuracy and time | Show the crew's unresolved need, not an examiner's missing-field puzzle. Keep this a short bridge under the accepted simplification. |
| Routing | Little tension when the process is stated | Administrative delay | Do not dramatize a dropdown. A short acknowledgement supplies continuity. |
| Source selection | Speed, current assignment and expenditure | Source delay or channel monitoring | Pair the destination with the affected work. The existing ample budget weakens the price dilemma; prose must not invent financial scarcity. |
| Boom allocation | Insufficient inventory for both targets | Current coverage versus a held spare | Make the uncovered location persist through selection and outcome. |
| Check-in | Help has arrived but readiness is not established | Continued source hold | Anticipation followed by readiness confirmation. Routine verification is not a dramatic moral test. |
| Equipment status | Expected capability is physically unavailable | The marsh recovery request | Reveal the signed report alongside the inactive vessel. Never suggest a record edit repairs it. |
| Reassignment | One working vessel and competing assignments | Channel capability, marsh support, or cost/lead time | Animate a change of assignment, retain the empty origin. Show contract support only after actual arrival. |
| Forecast | An order now may matter later | Work continuity and expenditure | Frame the later duty limit as an appointment with the same crew. The current “one of each” solution is relatively obvious; use anticipation rather than fake ambiguity. |
| Relief assignment | The opening crew needs continuity | Source work after duty limit | Return to the crew's established location. Do not fabricate individual exhaustion or injury. |
| COP publishing | Others need a reliable picture | Misunderstanding an unresolved report | Distinguish confirmed facts and uncertainty calmly. Do not use a false offshore alarm as sensational spectacle. |
| Escalation | Responsibility has reached a limit | A gap still lacking coordinated attention | Show the acknowledged problem; acknowledgement does not resolve the shortage. Broadcast-all remains a mechanical exploit outside this presentation pass. |
| Handover priority | Which unresolved issue should receive attention first? | The next watch's initial focus | Use a short incoming-watch reply that names the selected priority and the actual residual gap. |

There are only a few strong dilemmas here. Elevate them and let routine actions breathe. Claiming every existing input is dramatic would be dishonest. The fixed coupling failure and one-shot recovery limitations identified in the earlier review remain constraints; this pass neither changes them nor hides them with a more emotional script.

## 4. Consequence Visibility Audit

The display needs to answer **what changed, where, and because of which commitment**. Put those answers in one scene. Avoid a map effect, message banner and popup repeating the same news.

| Simulation evidence | Safe visible translation | Short field line | Do not infer |
| --- | --- | --- | --- |
| Monitoring resource `en_route`, known ETA | One traveling marker, destination waiting | “Team is on its way. We are still holding.” | Arrival, check-in, or authorization to enter. |
| Arrived resource unverified or unassigned | Marker at staging; source remains waiting | “They're here. The source assignment is not ready yet.” | Atmospheric conditions are safe. |
| `intel.monitoringConfirmed` and no `safetyHold` | Source posture changes from waiting to monitoring supported | “Monitoring is in place for source work.” | Hazard eliminated, leak stopped or entry universally safe. |
| `flags.channelMonitoringGap` | Channel monitoring position becomes visibly empty; work limited | “Channel monitoring moved with that team.” | A measured toxic exposure or injury. |
| Boom allocation versus area demand | Solid segments for actual placement; hatched shortfall | “The channel still has an uncovered requirement.” | Exact oil arrival, percent shoreline saved or guaranteed protection. |
| `Reserve deployed` condition history | Failed segment replaced by the actual spare; staging reserve disappears | “Replacement is in. The line has the same coverage.” | Unmodeled rescue or permanent environmental success. |
| `Coupling failure` history | One formerly placed segment absent; broken marker persists | “One section is out. There was no spare to replace it.” | Player caused the equipment fault or oil already crossed a modeled boundary. |
| SK-01 actual assignment changes | Vessel moves once to its recorded location; old site remains empty | “Marsh recovery has the skimmer. Channel recovery no longer does.” | Travel duration or route not represented by the engine. |
| SK-02 failed capability, disclosed by Maintenance | Vessel remains parked with an unavailable mark | “That unit cannot work with the failed pump.” | A repair, explosion or worsening failure. |
| Verified source relief assigned | Incoming crew symbol joins the source assignment; handover caption | “Relief has the source assignment.” | Injury avoided, crew rescued or an individual backstory. |
| At/after duty limit, no source relief | Source work switches to hold with relief reason | “Source work is paused. Relief is not in place.” | Dangerous work continues beyond the limit. |
| At/after minute 150, no available waste package | Recovery support shows constrained status | “Waste support is limiting recovery.” | Storage-tank fill levels or quantities the state does not measure. |
| Confirmed coordination/history | Relevant recipient acknowledges the stated gap | “Received. The incoming watch has that limitation.” | New resources or a resolved constraint. |

Use current **physical state**, known evidence and specific event history, not a general “good/bad” score. If monitoring is established but a relief gap causes `safetyHold`, do not narrate missing monitoring. If a line remains below its target after a spare is deployed, say coverage was maintained, not that the area is fully protected.

The engine has an abstract shoreline index, not a geospatial oil transport or ecological damage model. A presentation-only revision can show exposure/coverage and broad incident severity. It cannot truthfully turn that index into oil arriving at a particular pier, killed wildlife, a closed fishery or a rescued family. Atmospheric and equipment danger must remain at the specificity actually represented.

## 5. Visual Storytelling Audit

Current `map()` primarily displays a backdrop, aggregate assigned-asset counts and an oil ellipse. Its protection lines use the presence of assigned assets in a zone, not actual boom coverage. A vessel can therefore contribute to a reassuring-looking line. That is a presentation mismatch: a consequence map should draw boom from boom inventory, monitoring from monitoring status, and recovery from capable assigned skimmers.

Give the map continuity rather than more controls. Keep source, channel and marsh in fixed positions. Use the exact same landmarks in briefing, decisions, consequence and ending. Close views may crop a region, but should return to the same geography.

Movement communicates a recorded change; it must not imply the incident advances while the player reads. Use one short movement on a committed state transition. Under reduced motion, switch directly to the resulting state and show the same caption. Do not repeat a failure animation on every render or reload. Do not steal focus, flash warnings continuously, or hide information in sound or color.

### Top 20 opportunities for visual storytelling

| Rank | Impact | Visual treatment | State / information that justifies it |
| --- | --- | --- | --- |
| V01 | H | Keep placed boom segments in their locations throughout the run. | Actual boom resource assignments and counts. |
| V02 | H | Show both the destination gain and origin loss of a transfer. | Before/after assignments of the same resource ID. |
| V03 | H | Visibly replace the failed section with the held spare, or leave the gap. | Condition history plus actual replacement/failure IDs. |
| V04 | H | Reuse the opening composition for the final incident picture. | Final state of the same locations and resources. |
| V05 | H | Represent source waiting and supported work with distinct postures. | Monitoring readiness and the actual hold reason. |
| V06 | H | Mark unmet coverage with a hatch and open line, not merely a color change. | Assigned boom compared with the stated area target. |
| V07 | M | Give an ordered team a destination and an arrival marker. | Known order, ETA and arrival status; schematic travel only. |
| V08 | M | Empty the reserve location when the spare is committed. | Available boom reserve before/after the event. |
| V09 | M | Keep the unavailable skimmer visibly parked. | Physical incapability; reveal only when the player has the report. |
| V10 | M | Show a verified relief handover at the same source location. | An arrived, verified relief resource assigned to Source berth. |
| V11 | M | Highlight exactly one changed area on a consequence. | Event resource/area, with an immediate static alternative. |
| V12 | M | Distinguish requested, traveling, arrived and assigned silhouettes/labels. | Existing resource statuses; do not collapse them into “help.” |
| V13 | M | Orient the current cue toward the active scenario's priority. | Existing `variant` and `intel.current`; no fluid-model claim. |
| V14 | M | Use short, labeled field views embedded in the scene. | Current work location and condition, not a new video dashboard. |
| V15 | M | Keep a small visible break where a failed section was removed. | Failed resource plus remaining placement; no invented oil crossing. |
| V16 | L | Give harbor and marsh distinctive silhouettes and materials. | Authored environmental context; no new operational facts. |
| V17 | L | Show constrained recovery as subdued work status. | Existing waste support and resource capability dependencies. |
| V18 | L | Use chapter lighting to mark incident-time passage. | Current incident time; avoid implying changing weather. |
| V19 | L | Present the incoming watch on the same incident scene. | Actual handover; no new characters requiring management. |
| V20 | L | Preserve a final incident image in the existing AAR presentation. | Derived final state, not a new collectible or progression system. |

Art direction: working harbor, tidal inlet, industrial source, restrained light and distance. People appear as credible crews at the scale of the operation, not distressed stock portraits. Environmental detail should make the place specific without fabricating casualty or ecological outcomes. Three well-authored recurrent views are worth more than a new decorative image per task.

## 6. Moment-to-Moment Excitement Audit

The desired rhythm is **anticipation → commitment → visible change → reaction → breathing room**. Excitement here can be a quiet feeling that a difficult plan held together. Continuous alarm undermines that feeling.

The current sequence risks equal emphasis for every administrative step. Group presentation around existing material changes: an order accepted, an assignment ready, a protection line altered, a resource unavailable, a relief gap resolved. A routine receipt should pass without demanding emotional attention.

Keep feedback brief: one changed area and one field line, ordinarily about 12–20 words. Do not add mandatory cutscenes or acknowledgment buttons. Existing Continue can advance the story; skip animation must never skip the factual consequence. Narrative cues are not timers, new mission objectives or bonus conditions.

### Top 20 opportunities for memorable incident moments

All are candidate player stories, not promises that every run contains them. Moments can share a condition; they are not twenty additional events to insert into a 15-minute session.

| Rank | Impact | Moment the player might recount | Existing trigger / honest boundary |
| --- | --- | --- | --- |
| M01 | H | “The spare I kept replaced the section that failed.” | `Reserve deployed`; show the actual replacement. |
| M02 | H | “I used everything, and the line stayed broken when a section failed.” | `Coupling failure` without reserve; fault is external, shortage is the consequence. |
| M03 | H | “I got monitoring to the source by leaving the channel without its team.” | Internal monitoring transfer and channel monitoring gap. |
| M04 | H | “I protected the marsh target but left the channel short.” | Actual marsh coverage and channel shortfall; do not claim the marsh was permanently saved. |
| M05 | H | “The same crew that waited for monitoring later got the relief I ordered.” | Monitoring assignment, then verified source relief. |
| M06 | H | “The incoming watch could see exactly where my plan ran out.” | Final constraints and handover; no false clean victory. |
| M07 | M | “Help arrived, but it still wasn't ready for the assignment.” | Arrived/unverified or unsuitable monitoring resource. |
| M08 | M | “The second skimmer I was counting on couldn't operate.” | Maintenance disclosure; do not reveal hidden truth prematurely. |
| M09 | M | “I moved the working skimmer and could see the empty channel assignment.” | Authorized move of SK-01. |
| M10 | M | “I paid for another skimmer and had to wait before it helped.” | Contract order followed by actual arrival/assignment. |
| M11 | M | “The team was late, so the source kept waiting.” | Actual revised ETA or arrival beyond need; avoid fabricated time rescue. |
| M12 | M | “The line held its coverage, but I had no spare left.” | Reserve replacement and zero remaining reserve. |
| M13 | M | “My support order was already there when the next period needed it.” | Actual relief/waste arrival before the relevant need. |
| M14 | M | “Source work stopped because I hadn't put relief in place.” | Duty limit reached with no assigned source relief. |
| M15 | M | “We had skimmers, but waste support was limiting the recovery.” | Late-period waste dependency; no modeled tank volume. |
| M16 | L | “Changing the board didn't make the broken skimmer work.” | Recorded status disagrees with physical capability. |
| M17 | L | “We handed over the gap rather than pretending it was solved.” | Accurate COP/coordination with persistent limitations. |
| M18 | L | “The second run made me care about the channel first.” | Existing reversed-current variant; no additional incident family. |
| M19 | L | “The last view still showed the allocation I chose at the start.” | Persistent resource placements in final scene. |
| M20 | L | “I wanted to try the other compromise, even after a decent outcome.” | Ending presents a supported alternative without a better-score promise. |

There is no modeled rescue, casualty or near-miss injury event in this slice. Do not invent a successful rescue for emotional variety. Relief, prevented loss of coverage and an honestly carried gap can supply meaningful drama. A literal last-second rescue would require simulation/content work outside this brief.

## 7. Replayability Audit

**Current driver: predominantly optimization.** The large AAR effectiveness score, competency meters, XP and “run changed conditions” framing invite a better result. Two boom-demand variants provide some curiosity, but identical failure timing and largely repeated tasks limit the depth of that curiosity.

Move the invitation from “improve this score” to **one unresolved alternative the player can actually explore**. Use the finished record to select the invitation: retained reserve → try committing all six; transferred monitoring → try keeping channel support; current toward marsh → try the existing channel-priority variant. Same-condition replay and changed-current replay should be accurately labeled alternatives within the existing replay flow, not a challenge board.

Do not show a fabricated counterfactual ending. A line such as “you would have saved the channel” requires a real alternate simulation and still needs careful interpretation. Prefer “What changes if you keep the channel team?” The answer is discovered by playing.

### Top 20 reasons players would replay

These are motivations the treatment could create, not claims about current players.

| Rank | Impact | Player motivation | Presentation that supports it |
| --- | --- | --- | --- |
| R01 | H | “I want to see the other side of that compromise.” | Ending links one actual choice to an available alternative. |
| R02 | H | “I want a different response, not just a higher number.” | Final scene foregrounds supported work and exposed places. |
| R03 | H | “I wonder what retaining the spare changes.” | The same spare is visible before and after the failure. |
| R04 | H | “Could I support the source without leaving the channel short?” | Transfer consequence names both affected assignments. |
| R05 | H | “The current is different; I need a different plan.” | Existing variant is clearly introduced as changed conditions. |
| R06 | H | “I care how this crew's shift ends.” | The same crew voice recurs at readiness and relief. |
| R07 | M | “I understand why that happened and want to try again.” | Specific causal callback instead of vague failure language. |
| R08 | M | “I want to see a choice I didn't take.” | Alternatives stay credible and their consequences are not pre-spoiled. |
| R09 | M | “My plan worked, but that remaining gap bothers me.” | Mixed ending preserves success and unfinished work together. |
| R10 | M | “I want to see whether a different allocation feels worth it.” | Coverage and reserve are spatially distinct. |
| R11 | M | “I wonder whether keeping the skimmer in the channel changes the ending.” | Reassignment leaves a persistent empty origin. |
| R12 | M | “I want the next watch to inherit a different limitation.” | Handover closes on a concrete residual constraint. |
| R13 | M | “I want to know what the lower-cost source actually means for the crews.” | Delayed readiness is visible, without inventing funding pressure. |
| R14 | M | “That moment made me feel my preparation mattered.” | Forecast/arrival and reserve/failure callbacks. |
| R15 | M | “This place has become familiar.” | Stable landmarks and recurring views invite revisiting. |
| R16 | L | “I could describe my run to somebody.” | Two specific causal highlights provide a memorable story. |
| R17 | L | “I want a different ending image.” | Image reflects real final placements, not a collectible reward. |
| R18 | L | “I trust that another choice will be represented fairly.” | No outcome exaggeration, moralizing or hidden praise for spending. |
| R19 | L | “Another run feels like a fresh shift, not an exam retake.” | Existing replay enters the incident promptly with accurate changed-condition framing. |
| R20 | L | “I enjoyed the atmosphere and want to inhabit it again.” | Cohesive harbor identity and restrained field presence. |

The final rows are supporting reasons, not substitutes for R01–R06. If the same strategy dominates every run, atmosphere cannot sustain discovery indefinitely. Finite content should be presented honestly; do not market two variants as endless narrative possibilities.

### Top 20 reasons players would quit

These are ranked risks to test after assuming basic comprehension works. They are not observed abandonment statistics.

| Rank | Impact | Quit risk | Presentation response / limit |
| --- | --- | --- | --- |
| Q01 | H | Choices feel as if they lead to the same story. | Preserve visible differences through the ending. |
| Q02 | H | Consequences are announced but never witnessed. | Change the location, resource posture and one human response together. |
| Q03 | H | The player cares about neither the place nor the people. | Establish and revisit a small set of recognizable anchors. |
| Q04 | H | The game feels predetermined after the first run. | Surface existing tradeoffs and variants honestly; fixed-event depth remains limited. |
| Q05 | H | The ending evaluates the player instead of concluding the incident. | Put the inherited response before score/competency details. |
| Q06 | H | A bad outcome feels disconnected from the player's choice. | Name the specific cause and distinguish external conditions. |
| Q07 | M | The player is blamed for a fault or deadline imposed by the engine. | Avoid accusatory copy; known rule defects cannot be cured by presentation. |
| Q08 | M | Every message sounds like the same administrative template. | Distinct existing sender voices and concrete field facts. |
| Q09 | M | Correct answers remain obvious underneath dramatic prose. | Do not claim routine steps are dilemmas; existing decision weaknesses remain explicit. |
| Q10 | M | Celebrations promise more than the state supports. | Recognize actual readiness/coverage, never invented lives or permanent recovery. |
| Q11 | M | Important moments are buried among equally emphasized updates. | Reserve emphasis for material changes; let routine acknowledgments stay quiet. |
| Q12 | M | The map is emotionally inert. | Persistent placements, gaps and returning compositions. |
| Q13 | M | Replaying only repeats a known lesson. | Invite a specific alternative plan or existing variant. |
| Q14 | M | Constant alarm becomes tiring or manipulative. | Alternate pressure with calm and supported relief. |
| Q15 | M | Mistakes become irreversible dead ends. | Do not promise recovery the current rules prohibit; carry this as an existing implementation dependency. |
| Q16 | L | Generic praise feels patronizing. | Short factual acknowledgment from a relevant crew. |
| Q17 | L | The game pretends the player has command authority they lack. | Preserve Operations authorization and Resources coordination. |
| Q18 | L | Cinematics repeatedly interrupt action. | Integrate brief effects into the existing scene; skip without losing facts. |
| Q19 | L | Emotional meaning disappears with sound or motion disabled. | Complete captions, static states and equivalent focus/reading order. |
| Q20 | L | A replay invitation promises novelty the next run cannot deliver. | Name the actual changed constraint and keep the promise finite. |

## 8. UX Elements That Still Feel Like Software — and Recommended Transformations Into Game Experiences

| Priority | Software-like element | Game experience using the same underlying information |
| --- | --- | --- |
| 1 / H | State-change receipt | The actual location changes; the affected crew gives one short acknowledgment. |
| 2 / H | AAR score as the climax | The opening view returns with the player's placements and unresolved gap. |
| 3 / H | Map as decorative context | The map retains every material gain and loss as a readable incident picture. |
| 4 / H | Generic queue sender | Recurring field voice tied to the same place and need. |
| 5 / H | Inventory count | Identifiable placed equipment and a visibly retained or empty reserve. |
| 6 / H | “Run changed conditions” | A specific unanswered alternative the current replay can explore. |
| 7 / M | “Task completed” | “Monitoring is supporting the source assignment,” when true. |
| 8 / M | Resource-status update | The vessel visibly stays parked or changes assignment; no fictional capability change. |
| 9 / M | Cost-only vendor comparison | Price and ETA remain, with the waiting/sacrificed work shown beside them. |
| 10 / M | Period transition report | The same place, later in incident time, with one consequential change. |
| 11 / M | Forecast form outcome | The ordered help is present when the recurring crew needs continuity. |
| 12 / M | Escalation sent notification | A relevant function acknowledges the remaining limitation without magically solving it. |
| 13 / M | Competency congratulations | Specific recognition of what the player kept working. |
| 14 / L | Full historical message list | Existing archive holds the detail; the scene uses one current voice. |
| 15 / L | Progress rail | Existing chapter label names the current dramatic beat, not an administrative stage. |

Do not merely rename every form in dramatic language. “Deploy your destiny” is worse than an honest action label. The transformation occurs in what the player sees change and remembers, not in inflated button copy.

## 9. Wireframe Improvement Recommendations

Ranked by expected retention impact:

1. **Outcome — H:** replace the illustrative generic ending with a state-selected headline and two callbacks to actual commitments. Reuse the opening's place. Put one supported replay question beside the existing replay action. No additional outcome cards or scores.
2. **Allocation — H:** make placement and reserve persist visually into the failure result. A gap is a missing part of the same line, not a new warning badge. Keep the exact targets as existing decision information.
3. **Decision — H:** change the map from a generic source view into the affected source-and-channel relationship. When internal transfer is selected, preview that it removes existing channel monitoring; mark this as a proposed consequence until commitment.
4. **Opening — H:** establish a waiting crew and the place the player will revisit. One identity line is enough. Use the same source berth and marsh silhouette in the ending.
5. **Consequence — M:** use the existing result state as the dramatic beat. Brief transition, one field line, persistent aftermath. No extra Continue click beyond the accepted flow.
6. **Chapter bridge — M:** present the new period as the incident the player built, including the actual remaining reserve, arriving help and unresolved work. No mandatory cinematic or new overview screen.
7. **Small-screen treatment — M:** retain the relevant spatial consequence as a compact schematic rather than discarding the map's emotional meaning. Replace decorative space with the consequence view; do not append a new panel.
8. **Optional audio/motion — L:** a restrained radio opening or one-shot equipment movement can reinforce the moment after the silent/static version works. Do not use constant sirens or a real-time oil animation.

The accompanying storyboard is a review surface: choose “Spare held” or “All deployed,” then compare placement and aftermath. Those controls are for evaluating presentation; they are not proposed new controls in the game. It uses actual existing-engine outcomes, never invented random drama. It does not replace the approved player-first screen hierarchy.

## 10. Retention Improvement Plan

This is the cross-category execution order. It is ranked by estimated retention impact, with effort considered only after impact. All work is presentation of existing state; the prior gameplay implementation backlog remains separate.

| Rank | Expected impact | Transformation | Acceptance evidence | Main list links |
| --- | --- | --- | --- | --- |
| 1 | H | Persistent causal consequences in the scene | Players identify what changed, where and why without a paragraph. | E01, V01–V03, Q01–Q02 |
| 2 | H | Outcome returns to the opening place and actual commitments | Players recount their ending as a consequence of a choice, not a score. | E02, E06, V04, R02 |
| 3 | H | A small recurring set of field voices and places | Players remember at least one crew/place and why it mattered. | E03, E11, R06, Q03 |
| 4 | H | Reserve/failure and transfer/origin-loss signature moments | Two real trajectories produce visibly and narratively different stories. | M01–M04, E04–E05 |
| 5 | H | A specific curiosity-led replay invitation | Voluntary second runs explore the named alternative; the promised difference exists. | R01, R03–R05, Q20 |
| 6 | M | Timing of emphasis and quiet | Material changes stand out; players do not report constant alarm or interruption. | E16, Q11, Q14, Q18 |
| 7 | M | Truthful condition-aware microcopy across remaining scenes | No invented location impacts, false safety clearance or fake recovery. | Consequence table, Q06–Q10 |
| 8 | L | Optional audio and refined environmental finish | Muted/reduced-motion experience retains the same meaning; richer version adds presence. | E19, V16–V20, R20 |

### Implementation boundaries

Use the existing UI rendering path to select presentation from state/history. A small set of pure formatting/selecting functions is enough; do not add a narrative engine, relationship system or second simulation. Suggested responsibilities: determine the actual source hold reason; draw actual boom coverage; detect a newly recorded material event; choose a factual field line; summarize two player-attributable consequences; choose a supported replay prompt.

Bind visual changes to event/history identity so reopening a screen does not replay the same alarm. Reuse existing seen/acknowledgment presentation conventions from the accepted UX design. Record no new gameplay statistic. Do not award extra XP for an emotional beat.

The current engine prevents early check-in and some correction paths. Those defects were documented previously. Do not change those rules in this pass, and do not stage a triumphant timely arrival or recovery the unchanged rules cannot produce. If integration depends on their earlier planned fix, mark that dependency honestly.

### Narrative copy rules

- **Setup:** one current need, no biography. “We are holding at the source. We need atmospheric monitoring before this assignment can proceed.”
- **Commitment:** acknowledge the actual choice and its unresolved cost. “The team is dispatched. Channel monitoring stays in place; source work waits for arrival.”
- **Payoff:** name the change, not the player's virtue. “Replacement is in. The spare maintained marsh coverage.”
- **Adverse result:** distinguish fault and preparedness. “A section failed. With no spare available, the marsh line is one section short.”
- **Closure:** identify inherited work. “Marsh coverage is maintained. The channel still has an unmet requirement.”
- **Curiosity:** ask about an available alternative. “What changes if you commit the spare to the channel?”

Use conditional wording at generation time. These are templates, not lines that should fire on every run. Do not equate “protection target met” with “the ecosystem is safe,” or “monitoring assigned” with “hazard cleared.”

### Evaluation without new player-facing metrics

Run a bounded comparison of the accepted layout with and without this presentation treatment, holding simulation conditions constant. Counterbalance which treatment people see first where practical; a second playthrough already teaches the script. Observe novices and incident professionals separately so domain fluency does not hide weak storytelling.

After each run ask: “What moment do you remember?”, “What did you change?”, “Who or what were you concerned about?”, and “What would you try differently?” Listen before naming the marsh, reserve or intended emotion. Check recollections against history to catch misleading presentation.

Offer a genuine stopping point and an optional replay. Distinguish a polite statement of interest, a replay click and a completed second run. Reuse existing session/decision records for behavioral evidence where available. Do not build a new analytics dashboard for this audit, impose daily play, or claim next-day retention from same-session curiosity.

Provisional acceptance: in an initial five-person exploratory round, at least four can recall one accurate decision/consequence link and recognize the affected location without facilitator hints. Record whether anyone chooses a different plan voluntarily and why others stop. This small round diagnoses problems; it does not establish population retention lift. Expand testing only after the intended memories actually appear.

### What should not ship from this brief

No new casualty, rescue, wildlife-death, public-approval, crew-trust or morality system. No invented second disaster to manufacture surprise. No more simultaneous messages. No dramatic penalty for using accessibility features. No claims of unlimited replay. No emotional wording that disguises a mechanically dominant option.

### Design references and evidence limits

Harvey Smith and Matthias Worch's GDC session overview describes environments and reactive systems as ways for players to interpret a story. That supports using the changed incident scene as evidence of agency; it does not prove retention gains for this game. [What Happened Here? Environmental Storytelling](https://www.gdcvault.com/play/1012696/What-Happened-Here-Environmental).

Kent Hudson's GDC session overview highlights how system rules shape the meaning players take from outcomes. That supports the warning here: presentation cannot manufacture a fair dilemma or a recoverable mistake when the rules do not permit one. [The System Is the Message](https://www.gdcvault.com/play/1020428/The-System-Is-the-Message). This review used the published session descriptions, not a claim to have watched the full talks.

The emotional rankings, proposed voices and visual treatments are original design recommendations based on the inspected game and user brief. They are not established behavioral findings or official award judging criteria.

### Deliverable verification

All five lists contain 20 sequentially ranked entries (E, V, M, R and Q: 100 total). The eleven requested areas are covered above; the software-element audit and recommended transformations share one comparison table so each criticism has a concrete replacement.

The storyboard was exercised through two complete scripted trajectories of the existing engine, then all eight scene/branch combinations. The reserve trajectory retained four marsh sections and one channel section after the coupling event; the fully committed trajectory retained three and two respectively. Both had zero reserve afterward. Actual engine condition records identify BOOM-06 replacing BOOM-01 in the first case and BOOM-01 remaining out of service in the second. The production engine, UI and save logic were not edited.

Rendered Edge checks covered both branches and all four beats at 390 × 844, all four beats of the reserve branch at 1366 × 768, and the reserve aftermath at 1920 × 1080. Those measured views had no document overflow, with navigation in the viewport at default text size. Laptop aftermath and phone handover were visually inspected. The alternative-choice control correctly returned to the other placement; browser logs contained no captured errors or warnings. Script parsing and referenced local assets were also checked. These are artifact checks, not evidence of emotional impact, full accessibility conformance or retention improvement. Human evaluation remains necessary.
