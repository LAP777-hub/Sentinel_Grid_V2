# SENTINEL-GRID V2

**Team Name:** Neutral Fence  
**Project Type:** Defensive Cybersecurity / AI Honeypot Simulation  
**Hackathon Prototype:** Banking System Protection with Adaptive Deception

---

## Project Overview

SENTINEL-GRID V2 is a defensive cybersecurity prototype designed to demonstrate how an adaptive honeypot and deception system can protect a simulated banking environment from AI-assisted cyberattacks.

The project contains three connected prototypes:

1. **Banking System Prototype**  
   A simulated banking admin system containing fake banking data, including customers, accounts, credit card records, transactions, and loan balances.

2. **SENTINEL-GRID Security Module**  
   An insertable and removable security layer that can be activated by administrators. When active, it redirects attackers into fake banking honeypots instead of allowing them to reach the real simulated banking dataset.

3. **Simulated Hacker Testing Prototype**  
   A safe local testing panel used to demonstrate two attack scenarios:
   - Attempting to steal credit card information.
   - Attempting to erase or manipulate a client loan balance.

This project is for educational, research, and defensive demonstration purposes only.

---

## Problem Statement

Modern cyberattacks can move faster than human defenders can respond. In a banking environment, attackers may attempt to steal credit card information, manipulate loan records, or access sensitive financial data before analysts have enough time to react.

Traditional security systems often detect threats after damage has already started. SENTINEL-GRID V2 demonstrates a different approach: instead of only blocking the attacker, it redirects the attacker into a fake environment, feeds them believable simulated data, logs the activity, alerts defenders, and buys time for response.

---

## Proposed Solution

SENTINEL-GRID V2 works as an adaptive deception layer for the banking prototype.

When SENTINEL-GRID is inactive, the simulated hacker can reach the real simulated banking dataset.

When SENTINEL-GRID is inserted and activated, the same attack attempts are redirected into honeypots:

- Credit card theft attempts are redirected to a **Fake Card Vault**.
- Loan balance manipulation attempts are redirected to a **Fake Loan Core System**.

The attacker believes the attack succeeded, but the real simulated banking data remains safe.

---

## Main Features

### Banking System Prototype

- Bank admin dashboard
- 150 simulated banking clients
- 37 simulated clients with loans
- Simulated credit card records
- Simulated loan records
- Simulated transactions
- Security module status page
- Cybersecurity team dashboard

### SENTINEL-GRID Security Module

- Insertable and removable from the banking system
- Activation and deactivation controls
- Two-out-of-three admin activation logic
- Hidden backend-based activation code verification
- Honeypot grid
- Live threat feed
- Threat intelligence logs
- Firewall/isolation simulation
- Time-bought tracking
- Recommended response actions

### Simulated Hacker Prototype

- Safe local simulation only
- Test Case 1: Attempt to steal credit card information
- Test Case 2: Attempt to erase a loan balance
- Displays different results depending on SENTINEL-GRID status

---

## Demo Test Cases

The project demonstrates four required hackathon tests.

### Test 1: Credit Card Theft Without SENTINEL-GRID

SENTINEL-GRID is not inserted or inactive.

Expected result:

- The simulated hacker successfully accesses real simulated card records.
- The banking prototype shows that real simulated data was exposed.

### Test 2: Loan Balance Erasure Without SENTINEL-GRID

SENTINEL-GRID is not inserted or inactive.

Expected result:

- The simulated hacker successfully changes or erases a real simulated loan balance.
- The banking prototype shows that the real simulated loan ledger was modified.

### Test 3: Credit Card Theft With SENTINEL-GRID Active

SENTINEL-GRID is inserted and activated.

Expected result:

- The simulated hacker receives fake honeypot card data.
- The real simulated card records remain safe.
- SENTINEL-GRID logs the attack.
- The cybersecurity team dashboard receives an alert.

### Test 4: Loan Balance Erasure With SENTINEL-GRID Active

SENTINEL-GRID is inserted and activated.

Expected result:

- The simulated hacker modifies only fake honeypot loan data.
- The real simulated loan balance remains unchanged.
- SENTINEL-GRID logs the attack.
- The cybersecurity team dashboard receives an alert.

---

## Project Structure

```text
Sentinel_Grid_V2/
│
├── README.md
├── LICENSE
├── .gitignore
├── requirements.txt
├── app.py
├── HACKER_TEST_CASES.md
│
├── data/
│   ├── bank_real_data.json
│   ├── honeypot_fake_data.json
│   ├── sentinel_logs.json
│   ├── cyber_alerts.json
│   ├── system_state.json
│   └── secure_codes.json
│
├── templates/
│   ├── base.html
│   ├── bank_login.html
│   ├── bank_dashboard.html
│   ├── customers.html
│   ├── credit_cards.html
│   ├── loans.html
│   ├── transactions.html
│   ├── security_module.html
│   ├── sentinel_dashboard.html
│   ├── cyber_team_dashboard.html
│   ├── hacker_panel.html
│   ├── test_results.html
│   └── docs.html
│
├── static/
│   ├── style.css
│   ├── app.js
│   └── images/
│
├── docs/
│   ├── project_overview.md
│   ├── system_architecture.md
│   ├── test_plan.md
│   └── future_hardware_integration.md
│
└── screenshots/
    └── .gitkeep
