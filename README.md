# Seagull

A proficiency planner for Part 91 pilots.

* 🛩️ [Try it live → coldnebo.github.io/seagull](https://coldnebo.github.io/seagull/)


## Disclaimer

This application is an independent, community-developed reference tool and is not affiliated with, endorsed by, or approved by the Federal Aviation Administration (FAA) or any other aviation authority. It is not official training material, a substitute for FAA-approved instruction, or a legal interpretation of any regulation or standard.

Fade rate estimates and training type recommendations are synthesized from published research and represent the authors' best judgment — they are not empirically validated for every task or aircraft type. All information should be independently verified with a qualified flight instructor (CFI) and the applicable FAA Airman Certification Standards (ACS), Advisory Circulars, and 14 CFR regulations before use in any training context.

Flying involves risk. Nothing in this tool substitutes for sound aeronautical judgment, proper instruction, and compliance with applicable regulations. Always consult a CFI.

This project is MIT licensed, so if you like the concept and want to expand on it, or reframe it, please do so.


## Provenance and Concept

This app was designed in collaboration with Claude Sonnet 4.6 to rapidly explore the following concept:

* ACS Tasks and Skills for common Part 91 operations
  * by fade-time
  * by training type: CHAIR, SIM, REAL
* develop a schedule for proficiency upkeep
* estimate costs for upkeep

The FAA identifies the difference between currency and proficiency. In professional aviation (part 121/135 operations) recurrent training is formalized and has a structure. In general aviation there are currency requirements, but proficiency is largely left to each pilot to determine for themselves.

There is research however that measures proficiency in terms of "fade-time" -- the amount of time it takes skills to atrophy. Recurrent training schedules are designed refresh perishable skills.

Can we take the ACS standards for ratings along with common endorsements found in Part 91 general aviation and reorganize the tasks by their fade-time?

In addition, can we organize ACS tasks that might be refreshed by chair-flying, 'dry-time' or simulation versus real flight time?

Can we take this information and build a schedule of training goals for Part 91 pilots interested in maintaining proficiency? Also, let's add a calculator to estimate the total costs of this training schedule.

CFI/CFII ratings are out of scope for now — the proficiency dynamic there is fundamentally different since instruction itself is the currency.

## My Background

I am a senior software engineer (full stack) by day and an intermittent private pilot student every decade or so. My personal journey has it's own ups and downs, but like many students the biggest factor is cost. 

Part of what motivated this project is looking ahead to mission and maintenance of a PPL after I complete training. I have had several friends that stopped flying soon after getting their PPL and most of it was related to costs and not having a mission for flying regularly.

Also as a long time member of the flight simulation community, I have an interest in maximizing training benefit by using all the available tools whether that's chair flying for emergency procedures memorization or flight sims for tasks like radio work. It's worth noting that these research sources confirm what the industry generally says: most of your flight time needs to be real in order to train perishable skills, but this app may give you a more precise understanding of exactly which skills and how they might be divided up.

