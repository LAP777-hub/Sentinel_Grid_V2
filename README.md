
**"While the recent Ekurhuleni billing system breach exposed how vulnerable municipal financial systems are to catastrophic data manipulation—a gap our Sentinel Grid tool directly addresses—our prototype simulates a billing system on one screen and a hacking interface on the other, demonstrating how five existing security layers feeding every log into Sentinel Grid trigger perfectly nested honeypots that convince attackers their hack succeeded while keeping all real billing data completely intact."**

---

## How to Run / How to Test

1. **Click the prototype link:** [https://heckerthon.netlify.app/](https://heckerthon.netlify.app/)

2. **Access the Billing System (Admin Panel):**
   - **Acceptable usernames:** `SiyaB`, `Lucky`, `Oara`
   - **Password (all users):** `sasingenje@25`

3. **Activate Sentinel Grid (Full Protection Mode - No Breach Possible):**
   - Use the same credentials above, then enter any of these SG codes:
     - `SG-V2-ORION-7194!`
     - `SG-V2-NOVA-4826!`
     - `SG-V2-VAULT-9307!`
   - **DUO Code:** `482901`

> ⚠️ **Note:** Only these credentials work. Key test case 01: Hacker attempts to manipulate existing client bills while SG is active. Tester may explore all features.

---

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
