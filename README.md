
**"While the recent Ekurhuleni billing system breach exposed how vulnerable municipal financial systems are to catastrophic data manipulation—a gap our Sentinel Grid tool directly addresses—our prototype simulates a billing system on one screen and a hacking interface on the other, demonstrating how five existing security layers feeding every log into Sentinel Grid trigger perfectly nested honeypots that convince attackers their hack succeeded while keeping all real billing data completely intact."**

How to Run / How to Test
Click the prototype link: https://heckerthon.netlify.app/

Access the Billing System (Admin Panel):

Acceptable usernames: SiyaB, Lucky, Oara

Password (all users): sasingenje@25

Understand Sentinel Grid Activation (Two Modes):

Mode	Trigger	What Happens
Auto-Activation	After 5 defense layers are exhausted	SG kicks in automatically — no manual action needed. Honeypots deploy, hackers see fake data, real billing system stays intact.
Manual Full Protection	Enter SG admin codes (see below)	Activates SG immediately without waiting for 5 layers to fail. 5 layers + SG = maximum protection. No breach possible.
Manual Activation Codes (Full Protection - 5 Layers + SG):

SG Code 1: SG-V2-ORION-7194!

SG Code 2: SG-V2-NOVA-4826!

SG Code 3: SG-V2-VAULT-9307!

DUO Code: 482901

⚠️ Note: Only these credentials work. Key test case: Hacker attempts to manipulate existing client bills while is off anmd after all layers or some are down attack is a succes and when  SG is active (either auto or manual mode) all hacker gets a interface of the bank that looks so real and the data and bills manipulateable they can reduce clear and even rease but that is just fake dada in nested honeypots all municicplality real data bills stay intact. Tester may explore all features.





## Dev Team

| Name | Role | GitHub Profile |
|------|------|----------------|
| Siyabonga José Ndzobondzobo | Prototype Planning and overview design & HTML | [github.com/siyabonga-jose](https://github.com/siyajndzobs) |
| Lucky Pinga | Architecture Designing & JavaScript | [github.com/luckypinga](https://github.com/luckypinga) |
| Oarabetse Morara | Research Lead & CSS | [github.com/oarabetse-morara](https://github.com/oarabetse-morara) |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| VS Code | Code editor |
| GitHub | Version control & collaboration |
| Figma | Prototype & UI design |
| HTML | Structure |
| CSS | Styling |
| JavaScript | Interactivity & logic |

---

## Conclusions & Lessons Learned

**Security on the solution first, then the problem.** The Ekurhuleni incident taught us that reactive security fails when attackers are already inside. Sentinel Grid flips the model: deception buys time, logs everything, and preserves data integrity even while attackers believe they've won. Our biggest lesson is that elegant security architecture must anticipate breach—and design for the moment after the perimeter falls, not before.
