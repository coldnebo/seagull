import { useState, useMemo } from "react";

// ─── SOURCE REFERENCES ────────────────────────────────────────────────────────
const SOURCES = {
  fadeRate: [
    { id:"S1", label:"FAA/ERAU Skill Perishability Study (1980s)", desc:"Of 27 tested PPL skills, ALL deteriorated within 2 years post-checkride. Pilots were unaware of their own degradation.", url:"https://safeblog.org/2025/08/03/how-quickly-flying-skills-fade/", applies:"All fade-rate ratings" },
    { id:"S2", label:"EASA/FAA Joint Safety Analysis — Skills & Knowledge Degradation (2021)", desc:"Reduced activity degrades skills AND prevents further proficiency development. Spare mental capacity decreases as proficiency fades, raising workload and reducing situational awareness.", url:"https://www.easa.europa.eu/community/system/files/2021-08/Safety%20Issue%20Report%20-%20%20Skills%20and%20Knowledge%20Degradation_REV2%20Clean_0.pdf", applies:"All fade-rate ratings; especially weeks/1-2mo categories" },
    { id:"S3", label:"Hendrickson, Goldsmith & Johnson — Retention of Airline Pilots' Knowledge and Skill (2006)", desc:"Normal and emergency maneuvers showed significantly higher decay at 12 months vs 6 months. Maneuvers mentally rehearsed before evaluation showed less decay. Supports 6-month recurrent schedule.", url:"https://journals.sagepub.com/doi/10.1177/154193120605001755", applies:"Fade rate ratings; chair flying effectiveness" },
    { id:"S4", label:"COVID-19 Pilot Competency Study — PMC/NIH (2022)", desc:"Significant improvement in competency confidence reported after ~6 flights post-layoff, especially workload management. Supports real-aircraft requirement for perishable motor skills.", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9260191/", applies:"1-2mo and weeks categories; real-aircraft ratings" },
    { id:"S5", label:"SKYbrary — Skill Fade (2024)", desc:"Manually flying an IFR approach to minimums in adverse conditions is a classic high-fade skill. Procedural skills decay faster than cognitive skills.", url:"https://skybrary.aero/articles/skill-fade", applies:"weeks, 1-2mo categories; IFR approach tasks" },
    { id:"S6", label:"Flight Safety Foundation — Lost Skills (2021)", desc:"FlightSafety International identifies single-engine handling, instrument procedures without automation, circle-to-land, and emergency procedures as highest-emphasis recurrent training areas.", url:"https://flightsafety.org/asw-article/lost-skills/", applies:"Emergency operations, multi-engine, instrument tasks" },
    { id:"S7", label:"FAA Airplane Flying Handbook (FAA-H-8083-3C)", desc:"Explicitly states upset prevention and recovery skills are perishable and require continuous reinforcement. Only Level C/D FFS are satisfactory substitutes for real aircraft in UPRT.", url:"https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/06_afh_ch5.pdf", applies:"Upset recovery, stall tasks; sim-vs-real ratings" },
  ],
  trainingType: [
    { id:"T1", label:"Prophet & Boyd (1970) — Transfer from Low-Realism Simulators", desc:"For most procedural tasks, low-realism simulator training produced aircraft performance equal to high-realism sim or actual aircraft training. Physical fidelity less important than procedural accuracy.", url:"https://www.sciencedirect.com/topics/engineering/flight-simulator", applies:"'sim-ok' and 'chair-ok' ratings for procedural tasks" },
    { id:"T2", label:"Reweti et al. (2017) / FlightSimCoach Analysis (2025)", desc:"Kinesthetic skills — flare, crosswind, rudder feel — cannot be adequately replicated without real aircraft. Depth perception for flare timing depends on visual cues absent in most simulators.", url:"https://flightsimcoach.com/blog/can-you-learn-to-fly-using-a-flight-simulator/", applies:"'real' ratings for all landing and tactile tasks" },
    { id:"T3", label:"USAF Academy Chair Flying Study (Roth & André, 2004)", desc:"Chair flying group showed less mission time, more precise performance, and better situational awareness. Chair flying confirmed as effective preparation technique for procedural tasks.", url:"https://www.innerairmanship.com/mindsets/2.html", applies:"'chair-ok' ratings for procedural/memory tasks" },
    { id:"T4", label:"Vestibular Illusions in Fixed-Base Simulators — Mayo Clinic (2022)", desc:"Most fixed-base simulation environments including VR cannot recreate vestibular flight illusions because vestibular cues require physical stimulation of the vestibular end organs.", url:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10790896/", applies:"'real' ratings for spatial disorientation, unusual attitude, stall tasks" },
    { id:"T5", label:"FAA ACS-8C Appendix 3 — Use of FSTDs and ATDs", desc:"FAA policy on simulator credit: ATDs can substitute for portions of instrument training; higher fidelity FSTDs required for certain maneuver evaluations.", url:"https://www.faa.gov/training_testing/testing/acs/instrument_rating_airplane_acs_8.pdf", applies:"IR sim-ok ratings; ATD credit limits" },
    { id:"T6", label:"Transfer of Training for Ab-Initio Pilots — CORE (2018)", desc:"18-month study with 60% FTD / 40% real aircraft showed significant effective transfer for the majority of flight tasks. Procedural tasks transferred nearly completely; kinesthetic tasks (especially landing) showed least transfer.", url:"https://core.ac.uk/works/63198465", applies:"All sim-ok ratings; real ratings for landings" },
  ],
  regulatory: [
    { id:"R1", label:"14 CFR §61.57 — Recent Flight Experience", desc:"3 takeoffs and landings in 90 days to carry passengers. Night currency separate. Instrument currency: 6 approaches, holding, tracking within 6 calendar months.", url:"https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.57", applies:"PPL currency; IR 6HITS currency" },
    { id:"R2", label:"14 CFR §61.56 — Flight Review", desc:"Minimum 1 hr ground + 1 hr flight every 24 calendar months to act as PIC.", url:"https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.56", applies:"All ratings — BFR baseline" },
    { id:"R3", label:"FAA-S-ACS-6C — Private Pilot ACS (Nov 2023)", desc:"Official standard for PPL checkride and ongoing proficiency reference.", url:"https://www.faa.gov/training_testing/testing/acs/private_airplane_acs_6.pdf", applies:"All PPL tasks" },
    { id:"R4", label:"FAA-S-ACS-8C — Instrument Rating ACS (Nov 2023)", desc:"Official standard for IR checkride and IPC reference.", url:"https://www.faa.gov/training_testing/testing/acs/instrument_rating_airplane_acs_8.pdf", applies:"All IR tasks" },
    { id:"R5", label:"FAA-S-ACS-7B — Commercial Pilot ACS (Nov 2023)", desc:"Official standard for CPL checkride and proficiency reference.", url:"https://www.faa.gov/training_testing/testing/acs/commercial_airplane_acs_7.pdf", applies:"All CPL tasks" },
    { id:"R6", label:"FAA IPC Guidance (FAASAFETY.GOV)", desc:"Instrument Proficiency Check guidance document detailing how to structure an IPC.", url:"https://www.faasafety.gov/files/gslac/library/documents/2007/Aug/19001/Instrument%20Proficiency%20Check%20Guidance%20Aug07.pdf", applies:"IR currency and IPC planning" },
    { id:"R7", label:"14 CFR §61.31 — Type Ratings and Endorsements", desc:"Covers requirements for tailwheel, high-performance, complex, high-altitude endorsements.", url:"https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.31", applies:"Tailwheel, HP, complex endorsement tasks" },
  ],
};

// ─── TASK DATA ────────────────────────────────────────────────────────────────
const FADE_CONFIG = {
  "weeks":  { label:"~Weeks",  color:"#ef4444", sortOrder:0, freqPerYear:12, desc:"Skills that begin degrading within 2–4 weeks without practice" },
  "1-2mo":  { label:"1–2 Mo",  color:"#f97316", sortOrder:1, freqPerYear:8,  desc:"Skills that fade noticeably within 4–8 weeks" },
  "3-6mo":  { label:"3–6 Mo",  color:"#eab308", sortOrder:2, freqPerYear:3,  desc:"Skills that erode over a season without practice" },
  "annual": { label:"Annual",  color:"#22c55e", sortOrder:3, freqPerYear:1,  desc:"Skills that can be maintained with yearly review" },
  "stable": { label:"Stable",  color:"#6b7280", sortOrder:4, freqPerYear:0.5,desc:"Foundational knowledge unlikely to disappear" },
};

const TRAINING_CONFIG = {
  "real":     { label:"Real Aircraft Only",        icon:"✈️", shortLabel:"Real A/C" },
  "sim-ok":   { label:"Sim / BATD Sufficient",     icon:"🖥️", shortLabel:"Sim/BATD" },
  "chair-ok": { label:"Chair Flying / Self-Study", icon:"📋", shortLabel:"Chair/Study" },
};

// Helper to keep task definitions concise
const t = (id, area, areaName, task, fadeRate, trainingType, estMinutes, notes) =>
  ({ id, area, areaName, task, fadeRate, trainingType, estMinutes, notes });

const ALL_TASKS = {

  // ══════════════════════════════════════════════════════════════════════
  // PPL — Private Pilot ASEL  (FAA-S-ACS-6C)
  // ══════════════════════════════════════════════════════════════════════
  PPL: [
    t("PP-I-A",   "I",   "Preflight Prep",       "Pilot Qualifications & Currency Rules",          "stable", "chair-ok", 15,  "CFRs 61.57, 61.56. Read periodically; regulatory knowledge is stable."),
    t("PP-I-B",   "I",   "Preflight Prep",       "Airworthiness Requirements (ARROW, ADs, MEL)",   "annual", "chair-ok", 20,  "ARROW docs, AD check, inop equipment. Annual review sufficient."),
    t("PP-I-C",   "I",   "Preflight Prep",       "Weather Information & Go/No-Go",                 "3-6mo",  "chair-ok", 30,  "Wx products change (GFA replaced prog charts). Self-brief every flight keeps this sharp."),
    t("PP-I-D",   "I",   "Preflight Prep",       "Cross-Country VFR Flight Planning",              "3-6mo",  "sim-ok",   45,  "E6B, fuel calcs, nav logs. Practice on sim/EFB without flying."),
    t("PP-I-E",   "I",   "Preflight Prep",       "National Airspace System",                       "annual", "chair-ok", 20,  "Airspace classes, TFRs, SUA. Rules change; annual review."),
    t("PP-I-F",   "I",   "Preflight Prep",       "Performance & Limitations",                      "annual", "chair-ok", 25,  "POH charts, density altitude calcs. Cognitive — reviewable on ground."),
    t("PP-I-G",   "I",   "Preflight Prep",       "Operation of Systems",                           "annual", "chair-ok", 20,  "Fuel, electrical, pitot-static. Study POH periodically."),
    t("PP-I-H",   "I",   "Preflight Prep",       "Human Factors / ADM / IMSAFE",                  "stable", "chair-ok", 15,  "ADM frameworks. Stable conceptual knowledge; revisit with scenario study."),
    t("PP-II-A",  "II",  "Preflight Procedures", "Preflight Inspection (Walkaround)",              "3-6mo",  "real",     30,  "Physical familiarity with the specific aircraft. Requires actual airplane; muscle memory fades."),
    t("PP-II-B",  "II",  "Preflight Procedures", "Flight Deck Management & Flows",                 "3-6mo",  "sim-ok",   20,  "Cockpit flows, brief setup. Sim or chair flying effective for procedural sequencing."),
    t("PP-II-C",  "II",  "Preflight Procedures", "Engine Starting",                               "3-6mo",  "chair-ok", 15,  "Checklist-driven. Chair flying the flow is very effective."),
    t("PP-II-D",  "II",  "Preflight Procedures", "Taxiing",                                       "1-2mo",  "real",     20,  "Rudder feel, brake modulation, wind correction on ground. Requires real aircraft."),
    t("PP-II-F",  "II",  "Preflight Procedures", "Before Takeoff Check (Runup)",                  "3-6mo",  "chair-ok", 15,  "Runup checklist flows. Procedural — chair flying works well."),
    t("PP-III-A", "III", "Airport Operations",   "Communications & Light Signals",                 "1-2mo",  "sim-ok",   30,  "Radio phraseology, CTAF calls. Fades quickly. Sim + online ATC (PilotEdge, VATSIM) excellent."),
    t("PP-III-B", "III", "Airport Operations",   "Traffic Pattern",                               "weeks",  "real",     45,  "Pattern altitude, spacing, turn timing. Highly perishable motor skill. Requires real flight."),
    t("PP-IV-A",  "IV",  "Takeoffs & Landings",  "Normal Takeoff & Climb",                        "1-2mo",  "real",     30,  "Control forces, rotation feel, Vx/Vy. Reasonably durable but requires real aircraft."),
    t("PP-IV-B",  "IV",  "Takeoffs & Landings",  "Normal Approach & Landing",                     "weeks",  "real",     45,  "MOST PERISHABLE. Flare timing, depth perception, sink rate — cannot be meaningfully simulated. FAA minimum: 3 in 90 days."),
    t("PP-IV-C",  "IV",  "Takeoffs & Landings",  "Soft-Field Takeoff & Climb",                   "3-6mo",  "real",     20,  "Technique variation on normal TO. Bundle with regular landings flights."),
    t("PP-IV-D",  "IV",  "Takeoffs & Landings",  "Soft-Field Approach & Landing",                "3-6mo",  "real",     20,  "Power management in flare. Requires real aircraft."),
    t("PP-IV-E",  "IV",  "Takeoffs & Landings",  "Short-Field Takeoff & Climb",                  "3-6mo",  "real",     20,  "Precise airspeed control at liftoff. Bundle with other landing practice."),
    t("PP-IV-F",  "IV",  "Takeoffs & Landings",  "Short-Field Approach & Landing",               "3-6mo",  "real",     25,  "Spot landing precision. Real aircraft required."),
    t("PP-IV-M",  "IV",  "Takeoffs & Landings",  "Forward Slip to Landing",                      "3-6mo",  "real",     20,  "Cross-control coordination. Fades moderately; practice periodically."),
    t("PP-IV-N",  "IV",  "Takeoffs & Landings",  "Go-Around / Rejected Landing",                 "1-2mo",  "real",     15,  "Decision + simultaneous power-flap-attitude. High-stakes, infrequently practiced. Real A/C required."),
    t("PP-V-A",   "V",   "Performance Maneuvers","Steep Turns",                                  "1-2mo",  "real",     20,  "Back-pressure coordination, visual horizon. Vestibular component; fades in weeks to months."),
    t("PP-V-B",   "V",   "Performance Maneuvers","Ground Reference Maneuvers (S-turns, circles)", "3-6mo",  "real",     30,  "Wind compensation feel. Requires real flight."),
    t("PP-VI-A",  "VI",  "Navigation",           "Pilotage & Dead Reckoning",                     "3-6mo",  "sim-ok",   30,  "Chart reading, time-distance-heading. Sim + paper planning works well."),
    t("PP-VI-B",  "VI",  "Navigation",           "Navigation Systems & Radar Services",           "3-6mo",  "sim-ok",   25,  "GPS, VOR, flight following. Avionics-specific; sim with same avionics ideal."),
    t("PP-VI-C",  "VI",  "Navigation",           "Diversion",                                     "3-6mo",  "sim-ok",   20,  "Decision + quick replanning. Sim scenario or chair flying with charts works."),
    t("PP-VI-D",  "VI",  "Navigation",           "Lost Procedures",                               "annual", "chair-ok", 20,  "Climb, circle, GPS use. Procedural — chair flying effective."),
    t("PP-VII-A", "VII", "Slow Flight & Stalls",  "Maneuvering During Slow Flight",               "1-2mo",  "real",     20,  "Aircraft control near stall. Buffet recognition, control feel — real aircraft."),
    t("PP-VII-B", "VII", "Slow Flight & Stalls",  "Power-Off Stalls",                             "1-2mo",  "real",     20,  "Recognition and recovery. Physical buffet cues do not simulate in basic devices."),
    t("PP-VII-C", "VII", "Slow Flight & Stalls",  "Power-On Stalls",                              "1-2mo",  "real",     20,  "Torque, P-factor management at stall. Requires real aircraft."),
    t("PP-VII-D", "VII", "Slow Flight & Stalls",  "Spin Awareness",                               "annual", "chair-ok", 15,  "Knowledge of entry/recovery. Demonstration not required post-PPL. Chair flying effective."),
    t("PP-VIII-A","VIII","Basic Instruments",     "Straight-and-Level by Instruments",            "1-2mo",  "sim-ok",   20,  "Scan pattern, trim. Desktop/BATD sim highly effective; no vestibular component."),
    t("PP-VIII-B","VIII","Basic Instruments",     "Climbs/Descents by Instruments",               "1-2mo",  "sim-ok",   20,  "Power/pitch coordination by panel. Sim transfers well."),
    t("PP-VIII-C","VIII","Basic Instruments",     "Turns to Headings by Instruments",             "1-2mo",  "sim-ok",   20,  "Standard rate, rollout leads. Sim effective."),
    t("PP-VIII-E","VIII","Basic Instruments",     "Recovery from Unusual Attitudes",              "weeks",  "real",     15,  "Spatial disorientation recovery. Vestibular system must be involved. Needs real flight or Level C/D sim only."),
    t("PP-IX-A",  "IX",  "Emergency Ops",         "Emergency Descent",                            "3-6mo",  "chair-ok", 15,  "Memory item + procedure. Chair flying or sim highly effective."),
    t("PP-IX-B",  "IX",  "Emergency Ops",         "Emergency Approach & Landing (engine-out)",    "1-2mo",  "real",     20,  "Field selection + glide management. Real aircraft essential for energy state feel."),
    t("PP-IX-C",  "IX",  "Emergency Ops",         "Systems & Equipment Malfunctions",             "3-6mo",  "chair-ok", 25,  "Alternator fail, pitot heat, fuel management. Checklist flows — chair flying excellent."),
    t("PP-IX-D",  "IX",  "Emergency Ops",         "Emergency Equipment & Survival Gear",          "annual", "chair-ok", 15,  "Knowledge-based. Annual review sufficient."),
    t("PP-XI-A",  "XI",  "Night Operations",      "Night Operations",                             "3-6mo",  "real",     60,  "Visual illusions, dark adaptation, lighting. Night currency: 3 T&L at night in 90 days if carrying pax at night."),
    t("PP-XII-A", "XII", "Postflight",            "After Landing, Parking & Securing",            "stable", "chair-ok", 10,  "Checklist-driven. Very durable procedural skill."),
  ],

  // ══════════════════════════════════════════════════════════════════════
  // IR — Instrument Rating  (FAA-S-ACS-8C)
  // ══════════════════════════════════════════════════════════════════════
  IR: [
    t("IR-I-A",   "I",   "Preflight Prep",        "IFR Pilot Qualifications & Currency (6HITS)",   "3-6mo",  "chair-ok", 20,  "6 approaches, holding, intercept/track within 6 cal months. Review regs; IPC if lapsed."),
    t("IR-I-B",   "I",   "Preflight Prep",        "IFR Weather — Icing, SIGMET, Alternates",       "1-2mo",  "chair-ok", 40,  "IFR wx products significantly more complex than VFR. Fades without IFR flying; brief every flight."),
    t("IR-I-C",   "I",   "Preflight Prep",        "IFR Cross-Country Planning & Flight Plan",      "3-6mo",  "sim-ok",   45,  "IFR routing, alternates, fuel reserve, TPP interpretation. Sim + ForeFlight planning effective."),
    t("IR-II-A",  "II",  "Preflight Procedures",  "Aircraft Systems for IFR (anti-ice, pitot heat)","annual", "chair-ok", 20,  "System knowledge. Study POH/AFM for specific aircraft."),
    t("IR-II-B",  "II",  "Preflight Procedures",  "Flight Instruments & Navigation Equipment",     "3-6mo",  "sim-ok",   25,  "Avionics setup, nav database, failure modes. Sim with same avionics panel ideal."),
    t("IR-II-C",  "II",  "Preflight Procedures",  "Instrument Flight Deck Check",                 "3-6mo",  "chair-ok", 15,  "IFR preflight flows. Chair flying effective for procedural sequence."),
    t("IR-III-A", "III", "ATC Clearances",         "Compliance with ATC Clearances",               "1-2mo",  "sim-ok",   30,  "Copy and read-back clearances. Fades quickly. Online ATC (PilotEdge) highly effective."),
    t("IR-III-B", "III", "ATC Clearances",         "Holding Procedures",                           "1-2mo",  "sim-ok",   30,  "Entry, timing, wind correction, ABEAM. Sim excellent; this is procedural + scan."),
    t("IR-IV-A",  "IV",  "Flight by Instruments",  "Instrument Flight (S&L, climbs, descents, turns)","1-2mo","sim-ok",  45,  "Scan, trim, power management by panel. BATD/AATD sim highly effective; no vestibular component needed."),
    t("IR-IV-B",  "IV",  "Flight by Instruments",  "Recovery from Unusual Attitudes (IFR)",        "weeks",  "real",     15,  "Must involve real spatial disorientation to be meaningful. Requires real flight or Level C/D FFS only."),
    t("IR-V-A",   "V",   "Navigation Systems",     "VOR/GPS Intercept, Tracking & DME Arcs",       "1-2mo",  "sim-ok",   30,  "Course interception, tracking, DME arc procedures. Sim very effective."),
    t("IR-V-B",   "V",   "Navigation Systems",     "Departure, En Route & Arrival Operations",     "1-2mo",  "sim-ok",   30,  "SIDs, STARs, airways, transition use. Sim + ForeFlight charts excellent."),
    t("IR-VI-A",  "VI",  "Instrument Approaches",  "Non-Precision Approach (LNAV, VOR, LOC)",      "weeks",  "sim-ok",   30,  "Highly perishable IFR skill. Procedural component is sim-able; but real IMC judgment fades faster. IPC required if lapsed >6 months."),
    t("IR-VI-B",  "VI",  "Instrument Approaches",  "Precision Approach (ILS / LPV)",               "weeks",  "sim-ok",   30,  "ILS scan, glideslope tracking, DH decision. Sim is effective for procedure; real IMC adds weather judgment."),
    t("IR-VI-C",  "VI",  "Instrument Approaches",  "Missed Approach",                              "1-2mo",  "sim-ok",   20,  "Simultaneous power-attitude-config change at MA point. Sim highly effective."),
    t("IR-VI-D",  "VI",  "Instrument Approaches",  "Circling Approach",                            "3-6mo",  "real",     20,  "Visual maneuvering in low vis below circling MDA. Partial sim — but visual depth cues matter."),
    t("IR-VI-E",  "VI",  "Instrument Approaches",  "Landing from Instrument Approach",             "weeks",  "real",     20,  "Transition from instruments to visual at DH/MDA. Flare still requires real aircraft."),
    t("IR-VII-A", "VII", "Emergency Operations",   "Loss of Communications (NORDO)",               "annual", "chair-ok", 20,  "7600 squawk, altitude/time rules. Procedural — chair flying/study effective."),
    t("IR-VII-D", "VII", "Emergency Operations",   "Loss of Primary Flight Instruments (partial panel)","3-6mo","sim-ok", 25,  "Standby instruments, unusual attitude under degraded panel. Sim very effective here."),
    t("IR-VIII-A","VIII","Postflight",             "Checking Instruments & Equipment Post-Flight",  "stable", "chair-ok", 10,  "Logbook, ATIS check. Very durable."),
  ],

  // ══════════════════════════════════════════════════════════════════════
  // CPL — Commercial Pilot ASEL  (FAA-S-ACS-7B)
  // Incremental tasks above PPL+IR
  // ══════════════════════════════════════════════════════════════════════
  CPL: [
    t("CA-I-A",   "I",   "Preflight Prep",        "Commercial Pilot Privileges & Limitations",     "annual", "chair-ok", 20,  "Part 119, 135 applicability, compensation rules. Less frequently needed but legally important."),
    t("CA-I-F",   "I",   "Preflight Prep",        "High-Altitude Ops / Pressurization Knowledge",  "annual", "chair-ok", 20,  "Oxygen requirements, hypoxia, pressurization. Knowledge-based; relevant if flying complex/turbo aircraft."),
    t("CA-IV-A",  "IV",  "Takeoffs & Landings",   "Normal T/O & Landing (Commercial Tolerances)",  "weeks",  "real",     30,  "CPL requires tighter tolerances than PPL. Same perishability; commercial standards add pressure."),
    t("CA-IV-M",  "IV",  "Takeoffs & Landings",   "Power-Off 180° Accuracy Approach & Landing",   "1-2mo",  "real",     25,  "ENGINE-OUT spot landing — engine idle abeam threshold, land in first 200ft. High perishability; requires real aircraft."),
    t("CA-V-A",   "V",   "Performance Maneuvers", "Steep Turns (CPL ±5° alt, ±5° hdg tolerance)", "1-2mo",  "real",     20,  "Same maneuver as PPL but tighter tolerances. More sensitive to lack of practice."),
    t("CA-V-B",   "V",   "Performance Maneuvers", "Steep Spiral",                                 "3-6mo",  "real",     20,  "360° descending spiral at idle, maintaining airspeed. Requires real aircraft; energy management feel."),
    t("CA-V-C",   "V",   "Performance Maneuvers", "Chandelles",                                   "3-6mo",  "real",     20,  "Max performance climbing turn. Coordination, torque, timing — real aircraft."),
    t("CA-V-D",   "V",   "Performance Maneuvers", "Lazy Eights",                                  "3-6mo",  "real",     25,  "Symmetrical climbing/descending turns. Requires feel for aircraft energy state."),
    t("CA-V-E",   "V",   "Performance Maneuvers", "Eights on Pylons",                             "3-6mo",  "real",     25,  "Pivotal altitude, wind correction, pylon selection. Requires actual ground reference."),
    t("CA-VII-D", "VII", "Slow Flight & Stalls",  "Accelerated Stalls",                           "3-6mo",  "real",     15,  "Stall in turning flight with G-loading. CPL-only task; requires real aircraft for G-cues."),
    t("CA-VIII-A","VIII","High-Altitude Ops",      "Supplemental Oxygen Procedures",               "annual", "chair-ok", 15,  "Regulatory requirements, physiological symptoms. Knowledge-based; annual review."),
    t("CA-VIII-B","VIII","High-Altitude Ops",      "Pressurization Systems",                       "annual", "chair-ok", 15,  "Aircraft-specific; knowledge-based. Annual review if flying pressurized aircraft."),
  ],

  // ══════════════════════════════════════════════════════════════════════
  // TW — Tailwheel Endorsement  (14 CFR §61.31(i))
  // ══════════════════════════════════════════════════════════════════════
  TW: [
    t("TW-1",  "–",  "Ground Handling",    "Tailwheel Ground Handling & Taxiing",           "weeks",  "real",     30,  "Directional control with castering/full-swivel tailwheel. Most perishable tailwheel skill."),
    t("TW-2",  "–",  "Takeoff",            "Normal Tailwheel Takeoff (three-point & wheel)", "1-2mo", "real",     20,  "Two techniques; rudder timing for directional control on roll. Real aircraft only."),
    t("TW-3",  "–",  "Takeoff",            "Crosswind Takeoff",                             "1-2mo",  "real",     20,  "Upwind aileron, rudder priority. High perishability; requires real tailwheel aircraft."),
    t("TW-4",  "–",  "Takeoff",            "Soft/Short-Field Takeoff in Tailwheel",        "3-6mo",  "real",     20,  "Same technique variations as ASEL but with tailwheel handling added."),
    t("TW-5",  "–",  "Landings",           "Three-Point Landing",                           "weeks",  "real",     30,  "Stall-on touchdown technique. Timing is perishable; must be practiced frequently."),
    t("TW-6",  "–",  "Landings",           "Wheel Landing",                                "1-2mo",  "real",     30,  "Fly-on landing; requires feel for sink rate. Perishable technique."),
    t("TW-7",  "–",  "Landings",           "Crosswind Landing in Tailwheel",               "1-2mo",  "real",     25,  "Side-load management on touchdown — swing tendency. Requires real aircraft."),
    t("TW-8",  "–",  "Emergency Ops",      "Go-Around / Balked Landing in Tailwheel",      "1-2mo",  "real",     15,  "High torque at full power in nose-high attitude. Perishable due to unusual control demands."),
  ],

  // ══════════════════════════════════════════════════════════════════════
  // MEL — Multi-Engine Land Rating  (FAA-S-ACS-6C/7B AMEL tasks)
  // ══════════════════════════════════════════════════════════════════════
  MEL: [
    t("ME-1",  "–",  "Systems",            "Multi-Engine Systems & Aerodynamics",           "annual", "chair-ok", 30,  "Critical engine, VMC, accelerate-stop/go. Knowledge-based; POH/AFM study."),
    t("ME-2",  "–",  "Normal Ops",         "Normal Multi-Engine Takeoff & Climb",           "1-2mo",  "real",     20,  "Engine monitoring, power management. Requires real multi-engine aircraft."),
    t("ME-3",  "–",  "Normal Ops",         "Multi-Engine Traffic Pattern & Landing",        "1-2mo",  "real",     25,  "Same perishability as ASEL plus engine monitoring workload."),
    t("ME-4",  "–",  "Engine Failure",     "Engine Failure During Takeoff (before VMC)",   "1-2mo",  "real",     20,  "Abort or continue decision; immediate action. Perishable — high workload scenario."),
    t("ME-5",  "–",  "Engine Failure",     "Engine Failure After Liftoff / Airborne",      "1-2mo",  "real",     20,  "Identify, feather, clean up — Vyse hold. Requires real aircraft for feel of asymmetric thrust."),
    t("ME-6",  "–",  "Engine Failure",     "OEI Approach & Landing",                       "1-2mo",  "real",     25,  "Single-engine approach, stabilized, go-around option. Real aircraft required."),
    t("ME-7",  "–",  "Emergency Ops",      "VMC Demonstration",                            "3-6mo",  "real",     15,  "Approach to VMC, recovery. Must be done in real aircraft; no meaningful sim substitution."),
    t("ME-8",  "–",  "Emergency Ops",      "Maneuvering with OEI",                         "1-2mo",  "real",     20,  "Coordination, Vyse, bank to dead engine. Requires real asymmetric thrust."),
    t("ME-9",  "–",  "Instruments",        "OEI Instrument Flying",                        "3-6mo",  "sim-ok",   30,  "Single-engine instrument flight. Level C/D sim ideal; AATD can cover procedural elements."),
    t("ME-10", "–",  "Emergency Ops",      "System Malfunctions (ME-specific)",             "3-6mo",  "chair-ok", 20,  "Prop/engine controls, alternator failures. Checklist-based — chair flying effective."),
  ],

  // ══════════════════════════════════════════════════════════════════════
  // SEA — Single-Engine Sea (Seaplane) Rating
  // ══════════════════════════════════════════════════════════════════════
  SEA: [
    t("SE-1",  "–",  "Water Operations",   "Seaplane & Water Safety Awareness",            "annual", "chair-ok", 20,  "COLREGS, marine rules, water hazard assessment. Knowledge-based; annual review."),
    t("SE-2",  "–",  "Water Operations",   "Docking, Mooring & Sailing",                   "weeks",  "real",     45,  "Extremely perishable hands-on skill. Requires real seaplane and water operations."),
    t("SE-3",  "–",  "Takeoff",            "Glassy Water Takeoff",                          "1-2mo",  "real",     25,  "No visual depth cues; instruments + technique. Highly situational; requires real water ops."),
    t("SE-4",  "–",  "Takeoff",            "Rough Water Takeoff",                           "3-6mo",  "real",     20,  "Technique for chop and swells. Requires actual water conditions."),
    t("SE-5",  "–",  "Takeoff",            "Confined Area / River Takeoff",                "3-6mo",  "real",     20,  "Obstacle clearance, water surface assessment. Real environment only."),
    t("SE-6",  "–",  "Landings",           "Glassy Water Landing",                          "weeks",  "real",     30,  "Most accident-prone seaplane maneuver. No depth cues — altitude judgment entirely by instruments and technique. Highly perishable."),
    t("SE-7",  "–",  "Landings",           "Rough Water Landing",                           "3-6mo",  "real",     20,  "Step landing technique in chop. Requires real conditions."),
    t("SE-8",  "–",  "Landings",           "Confined Area Approach & Landing",             "3-6mo",  "real",     25,  "Obstacle clearance, short-water approach. Real environment required."),
    t("SE-9",  "–",  "Emergency Ops",      "Water Emergency Procedures",                   "annual", "chair-ok", 20,  "Engine failure over water, ELT, survival. Knowledge + chair flying."),
    t("SE-10", "–",  "Postflight",         "Post-Landing Water Ops & Securing",             "3-6mo",  "real",     20,  "Beaching, mooring, corrosion inspection. Real environment required."),
  ],

  // ══════════════════════════════════════════════════════════════════════
  // GL — Glider Rating  (FAA-S-ACS-11)
  // ══════════════════════════════════════════════════════════════════════
  GL: [
    t("GL-1",  "–",  "Preflight Prep",     "Glider Performance & Aerodynamics",            "annual", "chair-ok", 30,  "L/D, polar curve, thermal theory. Knowledge-based; annual review."),
    t("GL-2",  "–",  "Preflight Prep",     "Soaring Weather & Thermal Forecasting",        "3-6mo",  "chair-ok", 30,  "Thermals, ridge lift, wave, convergence zones. Seasonal knowledge; fades without use."),
    t("GL-3",  "–",  "Ground Ops",         "Glider Assembly & Preflight",                  "3-6mo",  "real",     30,  "Wing attach, control check, rigging. Aircraft-specific; requires actual glider."),
    t("GL-4",  "–",  "Launch",             "Aerotow Launch",                               "1-2mo",  "real",     20,  "Position behind towplane, box, slack line. Highly perishable visual skill."),
    t("GL-5",  "–",  "Launch",             "Ground Launch (winch/auto-tow) if applicable", "1-2mo",  "real",     20,  "High rotation rate, attitude management. Requires real launch."),
    t("GL-6",  "–",  "Soaring",            "Thermal Soaring & Energy Management",          "weeks",  "real",     60,  "Centering thermals, speed-to-fly, task management. Highly perishable — requires real soaring flight."),
    t("GL-7",  "–",  "Soaring",            "Straight Glides & Turns",                      "1-2mo",  "real",     20,  "Energy conservation, precise coordination. Real glider required."),
    t("GL-8",  "–",  "Soaring",            "Minimum Sink / Best Glide Speeds",             "1-2mo",  "real",     15,  "Speed discipline in unpowered flight. Requires real aircraft for feel."),
    t("GL-9",  "–",  "Landings",           "Normal Glider Approach & Landing",             "weeks",  "real",     30,  "No go-around; judgment and planning critical. Very perishable — one chance."),
    t("GL-10", "–",  "Landings",           "Spoiler/Dive Brake Management",               "1-2mo",  "real",     20,  "Airspeed and glidepath control with spoilers. Requires real glider."),
    t("GL-11", "–",  "Landings",           "Off-Airport (Field) Landing",                  "3-6mo",  "real",     30,  "Field selection, pattern, surface assessment. Requires real soaring environment."),
    t("GL-12", "–",  "Emergency Ops",      "Abnormal Release / Rope Break",                "3-6mo",  "real",     15,  "Immediate action on tow failure. Must be practiced in actual glider periodically."),
    t("GL-13", "–",  "Emergency Ops",      "Stalls & Spins in Glider",                    "3-6mo",  "real",     20,  "Spin entry/recovery in unpowered aircraft differs from powered. Real aircraft required."),
    t("GL-14", "–",  "Postflight",         "Glider Disassembly & Securing",               "stable", "real",     20,  "Rigging/de-rigging is aircraft-specific but procedural. Fades slowly."),
  ],
};

// ─── UI CONFIG ────────────────────────────────────────────────────────────────
const RATINGS = [
  { key:"PPL", label:"Private Pilot",    icon:"🛩️",  color:"#3b82f6", doc:"FAA-S-ACS-6C" },
  { key:"IR",  label:"Instrument",       icon:"🌫️",  color:"#8b5cf6", doc:"FAA-S-ACS-8C" },
  { key:"CPL", label:"Commercial",       icon:"💼",  color:"#f59e0b", doc:"FAA-S-ACS-7B" },
  { key:"TW",  label:"Tailwheel",        icon:"🛞",  color:"#ec4899", doc:"§61.31(i)"     },
  { key:"MEL", label:"Multi-Engine",     icon:"✈️",  color:"#ef4444", doc:"§61.31"        },
  { key:"SEA", label:"Seaplane",         icon:"🌊",  color:"#06b6d4", doc:"ACS-6C ASES"   },
  { key:"GL",  label:"Glider",           icon:"🪁",  color:"#22c55e", doc:"FAA-S-ACS-11"  },
];

export default function App() {
  const [activeRating, setActiveRating]   = useState("PPL");
  const [viewMode, setViewMode]           = useState("matrix");    // matrix | schedule | costs | sources
  const [showMode, setShowMode]           = useState("incremental"); // incremental | cumulative
  const [sortBy, setSortBy]               = useState("fade");
  const [filterFade, setFilterFade]       = useState("all");
  const [filterType, setFilterType]       = useState("all");
  const [wetRate, setWetRate]             = useState(160);
  const [simRate, setSimRate]             = useState(45);
  const [sourceTab, setSourceTab]         = useState("fadeRate");

  const ratingMeta = RATINGS.find(r => r.key === activeRating);

  // Cumulative task sets (each rating includes all prereqs)
  const PREREQS = { PPL:["PPL"], IR:["PPL","IR"], CPL:["PPL","IR","CPL"], TW:["PPL","TW"], MEL:["PPL","MEL"], SEA:["PPL","SEA"], GL:["GL"] };

  const activeTasks = useMemo(() => {
    const keys = showMode === "cumulative" ? (PREREQS[activeRating] || [activeRating]) : [activeRating];
    return keys.flatMap(k => ALL_TASKS[k] || []);
  }, [activeRating, showMode]);

  const filtered = useMemo(() => {
    let tasks = [...activeTasks];
    if (filterFade !== "all") tasks = tasks.filter(t => t.fadeRate === filterFade);
    if (filterType !== "all") tasks = tasks.filter(t => t.trainingType === filterType);
    if (sortBy === "fade") tasks.sort((a,b) => FADE_CONFIG[a.fadeRate].sortOrder - FADE_CONFIG[b.fadeRate].sortOrder);
    if (sortBy === "area") tasks.sort((a,b) => a.area.localeCompare(b.area));
    if (sortBy === "type") tasks.sort((a,b) => a.trainingType.localeCompare(b.trainingType));
    return tasks;
  }, [activeTasks, filterFade, filterType, sortBy]);

  // Cost calculations
  const costs = useMemo(() => {
    const realTasks = activeTasks.filter(t => t.trainingType === "real");
    const simTasks  = activeTasks.filter(t => t.trainingType === "sim-ok");
    const byFade = {};
    realTasks.forEach(t => { if(!byFade[t.fadeRate]) byFade[t.fadeRate] = []; byFade[t.fadeRate].push(t); });
    let realHours = 0, simHours = 0, sessions = [];
    Object.entries(byFade).forEach(([fade, tasks]) => {
      const freq = FADE_CONFIG[fade].freqPerYear;
      const minPerSession = tasks.reduce((s,t) => s + t.estMinutes, 0);
      const hrsPerSession = Math.max(0.8, minPerSession / 60);
      const annualHrs = hrsPerSession * freq;
      realHours += annualHrs;
      sessions.push({ fade, tasks: tasks.map(t=>t.task), freq, hrsPerSession: hrsPerSession.toFixed(1), annualHours: annualHrs.toFixed(1) });
    });
    simTasks.forEach(t => { simHours += (t.estMinutes/60) * FADE_CONFIG[t.fadeRate].freqPerYear; });
    return {
      realHours: realHours.toFixed(1), simHours: simHours.toFixed(1),
      totalHours: (realHours + simHours).toFixed(1),
      realCost: Math.round(realHours * wetRate), simCost: Math.round(simHours * simRate),
      totalCost: Math.round(realHours * wetRate + simHours * simRate),
      sessions: sessions.sort((a,b) => FADE_CONFIG[a.fade].sortOrder - FADE_CONFIG[b.fade].sortOrder),
    };
  }, [activeTasks, wetRate, simRate]);

  // Schedule
  const schedule = useMemo(() => {
    const months = Array.from({length:12}, (_,i) => ({
      month:i+1, label:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      real:[], sim:[], chair:[]
    }));
    activeTasks.forEach(t => {
      const freq = FADE_CONFIG[t.fadeRate].freqPerYear;
      const interval = Math.max(1, Math.round(12/freq));
      for(let m=0; m<12; m+=interval) {
        const b = t.trainingType === "real" ? "real" : t.trainingType === "sim-ok" ? "sim" : "chair";
        if(months[m]) months[m][b].push(t.task);
      }
    });
    return months;
  }, [activeTasks]);

  const rc = ratingMeta.color;

  return (
    <div style={{fontFamily:"'DM Mono','Courier New',monospace",background:"#0d1117",minHeight:"100vh",color:"#e2e8f0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
        .btn{background:none;border:1px solid #334155;border-radius:5px;padding:4px 11px;font-family:'DM Mono',monospace;font-size:11px;color:#94a3b8;cursor:pointer;transition:all .15s;}
        .btn:hover{border-color:#475569;color:#e2e8f0;}
        .btn.on{background:#1e293b;color:#f59e0b;border-color:#f59e0b;}
        .chip{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;}
        .tab{background:none;border:none;cursor:pointer;padding:9px 16px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.1em;color:#475569;border-bottom:2px solid transparent;transition:all .15s;}
        .tab:hover{color:#94a3b8;}
        .tab.on{color:#f59e0b;border-bottom-color:#f59e0b;}
        .rating-btn{background:none;border:1px solid #1e293b;border-radius:7px;padding:10px 14px;cursor:pointer;transition:all .15s;text-align:left;width:100%;}
        .rating-btn:hover{border-color:#334155;}
        .task-row{border-bottom:1px solid #1e293b;padding:11px 0;display:grid;grid-template-columns:3fr 82px 120px 1fr;gap:10px;align-items:start;}
        .task-row:hover{background:#0f1923;}
        .stat{background:#0f1923;border:1px solid #1e293b;border-radius:8px;padding:18px;}
        .range{-webkit-appearance:none;appearance:none;width:100%;height:3px;border-radius:2px;background:#334155;outline:none;}
        .range::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:#f59e0b;cursor:pointer;}
        .mc{background:#0f1923;border:1px solid #1e293b;border-radius:6px;padding:10px;}
        .ev{font-size:10px;color:#94a3b8;padding:2px 0 2px 7px;border-left:2px solid;margin:2px 0;line-height:1.3;}
        .src-card{background:#0f1923;border:1px solid #1e293b;border-radius:8px;padding:16px;margin-bottom:10px;}
        a{color:#60a5fa;text-decoration:none;}a:hover{text-decoration:underline;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:"#0a0e14",borderBottom:"1px solid #1e293b",padding:"14px 20px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:10,color:"#f59e0b",letterSpacing:".15em",marginBottom:3}}>PART 91 PROFICIENCY PLANNER</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:700,color:"#f1f5f9"}}>ACS Skills × Fade Rate × Training Type</div>
          </div>
          <div style={{fontSize:10, color:"#334155", letterSpacing:".08em", display:"flex", alignItems:"center", gap:12}}>
            <span>PPL · IR · CPL · TW · MEL · SEA · GL</span>
            <a href="https://github.com/coldnebo/seagull" target="_blank" rel="noreferrer"
              style={{color:"#475569", fontSize:10, border:"1px solid #1e293b", borderRadius:4, padding:"3px 8px", textDecoration:"none", letterSpacing:".05em"}}>
              ⭐ GitHub
            </a>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",minHeight:"calc(100vh - 58px)"}}>

        {/* ── SIDEBAR ── */}
        <div style={{width:168,flexShrink:0,background:"#0a0e14",borderRight:"1px solid #1e293b",padding:"16px 10px",display:"flex",flexDirection:"column",gap:6}}>
          <div style={{fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:4,paddingLeft:4}}>RATING / ENDORSEMENT</div>
          {RATINGS.map(r => {
            const active = activeRating === r.key;
            return (
              <button key={r.key} className="rating-btn"
                style={{borderColor: active ? r.color+"66" : "#1e293b", background: active ? r.color+"0f" : "none"}}
                onClick={()=>setActiveRating(r.key)}>
                <div style={{fontSize:13,marginBottom:2}}>{r.icon}</div>
                <div style={{fontSize:11,color: active ? r.color : "#94a3b8",fontWeight:500}}>{r.label}</div>
                <div style={{fontSize:9,color:"#334155",marginTop:2}}>{r.doc}</div>
              </button>
            );
          })}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{flex:1,overflow:"auto"}}>

          {/* Sub-header */}
          <div style={{background:"#0a0e14",borderBottom:"1px solid #1e293b",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex"}}>
              {[
                {k:"matrix",   l:"TASK MATRIX"},
                {k:"schedule", l:"12-MONTH PLAN"},
                {k:"costs",    l:"COST ANALYSIS"},
                {k:"sources",  l:"SOURCES"},
              ].map(v=>(
                <button key={v.k} className={`tab ${viewMode===v.k?"on":""}`} onClick={()=>setViewMode(v.k)}>{v.l}</button>
              ))}
            </div>
            {(activeRating==="IR"||activeRating==="CPL") && (
              <div style={{display:"flex",gap:6,paddingBottom:4}}>
                <span style={{fontSize:10,color:"#334155",alignSelf:"center"}}>SHOW:</span>
                <button className={`btn ${showMode==="incremental"?"on":""}`} onClick={()=>setShowMode("incremental")}>Incremental</button>
                <button className={`btn ${showMode==="cumulative"?"on":""}`} onClick={()=>setShowMode("cumulative")}>Cumulative</button>
              </div>
            )}
          </div>

          <div style={{padding:"20px"}}>

            {/* ══ MATRIX ══ */}
            {viewMode === "matrix" && (
              <div>
                {/* Summary row */}
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:18}}>
                  {Object.entries(FADE_CONFIG).map(([k,v])=>{
                    const cnt = activeTasks.filter(t=>t.fadeRate===k).length;
                    if(!cnt) return null;
                    return(
                      <div key={k} style={{background:"#0f1923",border:`1px solid ${v.color}33`,borderRadius:6,padding:"7px 12px",display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:v.color}}/>
                        <span style={{fontSize:10,color:v.color}}>{v.label}</span>
                        <span style={{fontSize:12,fontWeight:500,color:"#f1f5f9"}}>{cnt}</span>
                        <span style={{fontSize:9,color:"#475569"}}>tasks</span>
                      </div>
                    );
                  })}
                  <div style={{background:"#0f1923",border:"1px solid #1e293b",borderRadius:6,padding:"7px 12px",marginLeft:"auto"}}>
                    <span style={{fontSize:10,color:"#475569"}}>{activeTasks.length} tasks · {ratingMeta.label} {showMode==="cumulative"?"(cumulative)":"(incremental)"}</span>
                  </div>
                </div>

                {/* Filters */}
                <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:9,color:"#334155",letterSpacing:".1em"}}>FADE:</span>
                  {["all","weeks","1-2mo","3-6mo","annual","stable"].map(f=>(
                    <button key={f} className={`btn ${filterFade===f?"on":""}`} onClick={()=>setFilterFade(f)}>
                      {f==="all"?"ALL":FADE_CONFIG[f]?.label||f}
                    </button>
                  ))}
                  <span style={{fontSize:9,color:"#334155",letterSpacing:".1em",marginLeft:6}}>TYPE:</span>
                  {["all","real","sim-ok","chair-ok"].map(f=>(
                    <button key={f} className={`btn ${filterType===f?"on":""}`} onClick={()=>setFilterType(f)}>
                      {f==="all"?"ALL":TRAINING_CONFIG[f].icon+" "+(f==="real"?"Real":f==="sim-ok"?"Sim":"Chair")}
                    </button>
                  ))}
                  <span style={{fontSize:9,color:"#334155",letterSpacing:".1em",marginLeft:6}}>SORT:</span>
                  {["fade","area","type"].map(s=>(
                    <button key={s} className={`btn ${sortBy===s?"on":""}`} onClick={()=>setSortBy(s)}>{s.toUpperCase()}</button>
                  ))}
                </div>

                {/* Column headers */}
                <div style={{display:"grid",gridTemplateColumns:"3fr 82px 120px 1fr",gap:10,padding:"7px 0",borderBottom:"1px solid #1e293b",marginBottom:2}}>
                  {["TASK","FADE RATE","TRAINING TYPE","NOTES"].map(h=>(
                    <div key={h} style={{fontSize:9,color:"#334155",letterSpacing:".1em"}}>{h}</div>
                  ))}
                </div>

                {filtered.map(tk=>{
                  const fc=FADE_CONFIG[tk.fadeRate], tc=TRAINING_CONFIG[tk.trainingType];
                  return(
                    <div key={tk.id} className="task-row">
                      <div>
                        <div style={{fontSize:12,color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",fontWeight:500,marginBottom:2}}>{tk.task}</div>
                        <div style={{fontSize:9,color:"#334155"}}>{tk.areaName}{tk.area!=="–"?` · Area ${tk.area}`:""}</div>
                      </div>
                      <div>
                        <div className="chip" style={{background:`${fc.color}18`,color:fc.color,border:`1px solid ${fc.color}44`}}>{fc.label}</div>
                      </div>
                      <div style={{fontSize:10,color:"#94a3b8"}}>{tc.icon} {tc.label}</div>
                      <div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>{tk.notes}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ SCHEDULE ══ */}
            {viewMode === "schedule" && (
              <div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,color:"#94a3b8",marginBottom:10,lineHeight:1.7}}>
                    Recommended minimum proficiency events by month. Bundle real-aircraft events — a 1.5-hr flight can cover multiple tasks from the same fade tier.
                  </div>
                  <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                    {[{c:"#ef4444",l:"✈️ Real aircraft"},{c:"#3b82f6",l:"🖥️ Sim / BATD"},{c:"#22c55e",l:"📋 Chair / study"}].map(l=>(
                      <div key={l.l} style={{display:"flex",alignItems:"center",gap:7,fontSize:10,color:"#94a3b8"}}>
                        <div style={{width:9,height:9,borderRadius:2,background:l.c,opacity:.7}}/>
                        {l.l}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {schedule.map(m=>(
                    <div key={m.month} className="mc">
                      <div style={{fontSize:10,color:"#f59e0b",letterSpacing:".1em",marginBottom:7,fontWeight:500}}>{m.label}</div>
                      {m.real.length===0&&m.sim.length===0&&m.chair.length===0&&<div style={{fontSize:9,color:"#334155"}}>Light month</div>}
                      {m.real.map((e,i)=><div key={i} className="ev" style={{borderLeftColor:"#ef4444"}}>{e}</div>)}
                      {m.sim.map((e,i)=><div key={i} className="ev" style={{borderLeftColor:"#3b82f6"}}>{e}</div>)}
                      {m.chair.map((e,i)=><div key={i} className="ev" style={{borderLeftColor:"#22c55e"}}>{e}</div>)}
                    </div>
                  ))}
                </div>
                <div style={{marginTop:16,background:"#0f1923",border:"1px solid #1e293b",borderRadius:8,padding:14,fontSize:11,color:"#64748b",lineHeight:1.8}}>
                  <span style={{color:"#f59e0b"}}>TIP: </span>
                  A well-planned 1.5-hr flight can cover all tasks in the same fade tier. Keep a personal logbook column for each ACS task practiced — this lets you spot which skills haven't been touched recently.
                </div>
              </div>
            )}

            {/* ══ COSTS ══ */}
            {viewMode === "costs" && (
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
                  {[{label:"WET AIRCRAFT RATE ($/hr)",val:wetRate,set:setWetRate,min:80,max:500,step:5,color:"#ef4444"},
                    {label:"SIM / BATD RATE ($/hr)",val:simRate,set:setSimRate,min:0,max:200,step:5,color:"#3b82f6"}].map(s=>(
                    <div key={s.label} className="stat">
                      <div style={{fontSize:9,color:"#475569",letterSpacing:".1em",marginBottom:10}}>{s.label}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:28,fontWeight:700,color:s.color,marginBottom:8}}>${s.val}</div>
                      <input type="range" className="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e=>s.set(+e.target.value)}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#334155",marginTop:3}}>
                        <span>${s.min}</span><span>${s.max}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
                  {[
                    {l:"Real A/C Hours/yr",v:costs.realHours,u:"hrs",c:"#ef4444"},
                    {l:"Sim / BATD Hours/yr",v:costs.simHours,u:"hrs",c:"#3b82f6"},
                    {l:"Total Hours/yr",v:costs.totalHours,u:"hrs",c:"#94a3b8"},
                    {l:"Real A/C Cost/yr",v:`$${costs.realCost.toLocaleString()}`,u:"",c:"#ef4444"},
                    {l:"Sim Cost/yr",v:`$${costs.simCost.toLocaleString()}`,u:"",c:"#3b82f6"},
                    {l:"Total Annual Budget",v:`$${costs.totalCost.toLocaleString()}`,u:"",c:"#f59e0b"},
                  ].map(s=>(
                    <div key={s.l} className="stat">
                      <div style={{fontSize:9,color:"#475569",letterSpacing:".08em",marginBottom:5}}>{s.l}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:24,fontWeight:700,color:s.c}}>{s.v}<span style={{fontSize:12,color:"#475569",marginLeft:3}}>{s.u}</span></div>
                    </div>
                  ))}
                </div>

                <div style={{marginBottom:14}}>
                  <div style={{fontSize:9,color:"#475569",letterSpacing:".1em",marginBottom:10}}>FLIGHT SESSION BREAKDOWN (REAL AIRCRAFT)</div>
                  {costs.sessions.map((s,i)=>{
                    const fc=FADE_CONFIG[s.fade];
                    return(
                      <div key={i} style={{background:"#0f1923",border:"1px solid #1e293b",borderRadius:6,padding:"11px 14px",marginBottom:7,display:"grid",gridTemplateColumns:"90px 80px 80px 1fr",gap:10,alignItems:"center"}}>
                        <div className="chip" style={{background:`${fc.color}18`,color:fc.color,border:`1px solid ${fc.color}44`}}>{fc.label}</div>
                        <div>
                          <div style={{fontSize:11,color:"#f59e0b"}}>{s.freq}×/yr</div>
                          <div style={{fontSize:9,color:"#475569"}}>{s.hrsPerSession}hr/session</div>
                        </div>
                        <div>
                          <div style={{fontSize:11,color:"#f1f5f9"}}>{s.annualHours}hrs</div>
                          <div style={{fontSize:9,color:"#475569"}}>${Math.round(s.annualHours*wetRate).toLocaleString()}/yr</div>
                        </div>
                        <div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>
                          {s.tasks.slice(0,4).join(" · ")}{s.tasks.length>4?` +${s.tasks.length-4} more`:""}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{background:"#0f1923",border:"1px solid #1e293b",borderRadius:8,padding:14}}>
                  <div style={{fontSize:9,color:"#f59e0b",letterSpacing:".1em",marginBottom:8}}>ASSUMPTIONS</div>
                  <div style={{fontSize:11,color:"#64748b",lineHeight:1.9}}>
                    • Hours represent <strong style={{color:"#94a3b8"}}>minimum proficiency maintenance</strong>, not FAA currency (currency ≠ proficiency).<br/>
                    • Real-aircraft sessions assume efficient task bundling within each fade tier.<br/>
                    • "Sim-ok" assumes a BATD/AATD or quality desktop sim (e.g. Redbird, X-Plane with realistic avionics).<br/>
                    • "Chair-ok" tasks assumed $0 — ~30 min self-study/session.<br/>
                    • Biennial Flight Review (every 24 months, ~2 hrs) not itemized separately — it covers many of these tasks.<br/>
                    • IR currency: 6HITS within 6 calendar months; IPC required if lapsed beyond 12 months.
                  </div>
                </div>
              </div>
            )}

            {/* ══ SOURCES ══ */}
            {viewMode === "sources" && (
              <div>
                <div style={{marginBottom:20,fontSize:12,color:"#94a3b8",lineHeight:1.8}}>
                  All fade-rate and training-type judgments in this tool are grounded in published research and FAA regulatory documents. Sources are grouped below by the type of judgment they support.
                </div>

                {/* Source category tabs */}
                <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:"1px solid #1e293b"}}>
                  {[
                    {k:"fadeRate",l:"Fade Rate Research"},
                    {k:"trainingType",l:"Sim vs Real Research"},
                    {k:"regulatory",l:"FAA Regulatory"},
                  ].map(s=>(
                    <button key={s.k} className={`tab ${sourceTab===s.k?"on":""}`} onClick={()=>setSourceTab(s.k)}>{s.l}</button>
                  ))}
                </div>

                {SOURCES[sourceTab].map(src=>(
                  <div key={src.id} className="src-card">
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:8}}>
                      <div>
                        <span style={{fontSize:9,color:"#475569",marginRight:8,letterSpacing:".1em"}}>[{src.id}]</span>
                        <span style={{fontSize:13,color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{src.label}</span>
                      </div>
                      <a href={src.url} target="_blank" rel="noreferrer"
                        style={{fontSize:10,color:"#3b82f6",whiteSpace:"nowrap",flexShrink:0,border:"1px solid #1e3a5f",borderRadius:4,padding:"3px 8px"}}>
                        Open ↗
                      </a>
                    </div>
                    <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.7,marginBottom:8}}>{src.desc}</div>
                    <div style={{fontSize:10,color:"#475569"}}>
                      <span style={{color:"#334155"}}>Applies to: </span>{src.applies}
                    </div>
                  </div>
                ))}

                <div style={{marginTop:20,background:"#0f1923",border:"1px solid #1e293b",borderRadius:8,padding:14,fontSize:11,color:"#64748b",lineHeight:1.8}}>
                  <span style={{color:"#f59e0b",fontSize:9,letterSpacing:".1em",display:"block",marginBottom:6}}>METHODOLOGY NOTE</span>
                  Fade-rate categories are informed by the research above but represent <em>expert-synthesized estimates</em>, not exact empirical measurements for each specific task. 
                  The aviation-specific literature (EASA/FAA 2021, Hendrickson et al. 2006) provides the strongest direct evidence. 
                  Per-task fade rates for endorsement areas (tailwheel, seaplane, glider) are interpolated from general skill-fade principles and the FAA Airplane Flying Handbook guidance on perishability of motor skills.
                  All regulatory currency requirements are drawn directly from 14 CFR Part 61 and the respective ACS documents.
                </div>
                <div style={{marginTop:12, background:"#0f1923", border:"1px solid #7f1d1d", borderRadius:8, padding:14}}>
                  <div style={{fontSize:9, color:"#ef4444", letterSpacing:".1em", marginBottom:8}}>DISCLAIMER</div>
                  <div style={{fontSize:11, color:"#64748b", lineHeight:1.9}}>
                    This application is an independent, community-developed reference tool and is <strong style={{color:"#94a3b8"}}>not affiliated with, endorsed by, or approved by the Federal Aviation Administration (FAA)</strong> or any other aviation authority. It is not official training material, a substitute for FAA-approved instruction, or a legal interpretation of any regulation or standard.
                    <br/><br/>
                    Fade rate estimates and training type recommendations are synthesized from published research and represent the authors' best judgment — they are not empirically validated for every task or aircraft type. All information should be independently verified with a qualified flight instructor (CFI) and the applicable FAA Airman Certification Standards (ACS), Advisory Circulars, and 14 CFR regulations before use in any training context.
                    <br/><br/>
                    Flying involves risk. Nothing in this tool substitutes for sound aeronautical judgment, proper instruction, and compliance with applicable regulations. Always consult a CFI.
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
