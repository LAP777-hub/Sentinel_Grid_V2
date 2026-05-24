

"use strict";



const SA_NAMES = [
    "Sipho Dlamini",
    "Nomsa Khumalo",
    "Thabo Nkosi",
    "Zanele Mokoena",
    "Lungelo Sithole",
    "Precious Mthembu",
    "Ayanda Zulu",
    "Lerato Khoza",
    "Bongani Ndlovu",
    "Thandeka Cele",
    "Sibusiso Mkhize"
];

const LOAN_TYPES = [
    "Home Loan",
    "Vehicle Finance",
    "Personal Loan",
    "Business Loan"
];

const layerNames = [
    "Perimeter Firewall",
    "WAF / SQL Injection Filter",
    "API Gateway",
    "Database Access Control",
    "Admin MFA"
];

const attackTypes = [
    "Port Scan + SYN Flood",
    "SQL Injection + XSS",
    "JWT Token Brute Force",
    "Privilege Escalation",
    "MFA Fatigue Attack"
];



let sgActive = false;
let currentHacker = null;
let bankUser = null;

let securityLog = [];
let incidentRecords = [];

let trappedCount = 0;
let loansErasedCount = 0;
let aiFilteredCount = 0;
let endpointAlerts = 0;

let layerAttempts = [0, 0, 0, 0, 0];
let layersExhausted = [false, false, false, false, false];



const DEMO_APPROVAL_HASHES = [
    "e18262706a87232efbcf0e0ae538b54feff09efb9d593a360f0f4a6e8a638849",
    "5c7b31824ff57c357480677e0aeb5a55f3c20033557f8f8d96e8dabe98075a0b",
    "e96a29ac9b981462956c09d86bd7c95b2d1a7b889cd926a6052ca9eac63e517b"
];



const endpointCatalog = {
    "/admin/dashboard": {
        zone: "Bank Admin Control Panel",
        risk: "HIGH",
        purpose: "Privileged banking dashboard",
        mitigation: "Use MFA, RBAC, device trust, session timeout, and immutable audit logging."
    },
    "/admin/accounts": {
        zone: "Bank Admin Control Panel",
        risk: "HIGH",
        purpose: "Account visibility",
        mitigation: "Use least privilege, masking, approval workflow, and export controls."
    },
    "/admin/cards": {
        zone: "Bank Admin Control Panel",
        risk: "CRITICAL",
        purpose: "Card portfolio visibility",
        mitigation: "Never display CVV, mask PAN, tokenise card data, and use PCI-style controls."
    },
    "/admin/loans": {
        zone: "Bank Admin Control Panel",
        risk: "CRITICAL",
        purpose: "Loan record access and manipulation simulation",
        mitigation: "Use maker-checker approval, transaction signing, backups, and fraud monitoring."
    },
    "/admin/customer-pii": {
        zone: "Bank Admin Control Panel",
        risk: "CRITICAL",
        purpose: "Customer PII export simulation",
        mitigation: "Use POPIA controls, masking, DLP, least privilege, and egress monitoring."
    },
    "/sg/activate": {
        zone: "Sentinel Grid Control Plane",
        risk: "CRITICAL",
        purpose: "Activates Sentinel Grid deception mode",
        mitigation: "Use backend two-admin approval, MFA/FIDO2, SOC ticketing, and signed logs."
    },
    "/sg/deception-router": {
        zone: "Sentinel Grid Control Plane",
        risk: "CRITICAL",
        purpose: "Routes suspicious activity to honeypot paths",
        mitigation: "Use server-side routing, mTLS, API gateway rules, and fail-closed design."
    },
    "/sg/ai-classifier": {
        zone: "Sentinel Grid AI Layer",
        risk: "HIGH",
        purpose: "Classifies AI-based attack behaviour",
        mitigation: "Use prompt isolation, output validation, confidence thresholds, and human review."
    },
    "/sg/audit-log": {
        zone: "Sentinel Grid Evidence Layer",
        risk: "CRITICAL",
        purpose: "Stores incident and security evidence",
        mitigation: "Use append-only logs, hashing, remote SIEM forwarding, and restricted write access."
    }
};

const endpointState = {};

Object.keys(endpointCatalog).forEach(function (endpoint) {
    endpointState[endpoint] = {
        touches: 0,
        blocked: 0,
        lastActor: "—",
        lastVector: "—",
        lastSeen: "—"
    };
});



const CARDS = SA_NAMES.map(function (name) {
    return {
        name: name,
        num: "5" + rand(1000, 9999) + " " + rand(1000, 9999) + " " + rand(1000, 9999) + " " + rand(1000, 9999),
        expiry: rand(1, 12) + "/" + rand(26, 30),
        cvv: rand(100, 999),
        limit: rand(15000, 100000)
    };
});

const LOANS = SA_NAMES.map(function (name, index) {
    return {
        name: name,
        type: LOAN_TYPES[index % LOAN_TYPES.length],
        originalAmount: rand(200000, 800000),
        balance: rand(20000, 400000),
        erased: false
    };
});

const HONEY_CARDS = SA_NAMES.map(function (name) {
    return {
        name: name,
        num: "4" + rand(1000, 9999) + " " + rand(1000, 9999) + " " + rand(1000, 9999) + " " + rand(1000, 9999),
        expiry: rand(1, 12) + "/" + rand(26, 30),
        cvv: rand(100, 999),
        limit: rand(15000, 100000)
    };
});

const HONEY_LOANS = SA_NAMES.map(function (name, index) {
    return {
        name: name,
        type: LOAN_TYPES[index % LOAN_TYPES.length],
        originalAmount: rand(200000, 800000),
        balance: rand(20000, 400000),
        erased: false
    };
});


function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmtRand(value) {
    return "R " + Number(value).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function safeGet(id) {
    return document.getElementById(id);
}

function nowTime() {
    return new Date().toLocaleTimeString();
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function maskCardNumber(cardNumber) {
    const clean = String(cardNumber).replace(/\s/g, "");

    if (clean.length < 8) {
        return "**** **** **** ****";
    }

    return clean.slice(0, 4) + " **** **** " + clean.slice(-4);
}

function maskIdNumber(idNumber) {
    const value = String(idNumber);

    if (value.length < 6) {
        return "**********";
    }

    return value.slice(0, 2) + "******" + value.slice(-2);
}

async function sha256Hex(input) {
    if (!window.crypto || !window.crypto.subtle) {
        let h1 = 0xdeadbeef;
        let h2 = 0x41c6ce57;

        for (let i = 0; i < input.length; i++) {
            const ch = input.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }

        return ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).padEnd(64, "0").slice(0, 64);
    }

    const buffer = new TextEncoder().encode(input);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);

    return Array.from(new Uint8Array(hashBuffer))
        .map(function (byte) {
            return byte.toString(16).padStart(2, "0");
        })
        .join("");
}



function touchEndpoint(endpoint, actor, vector, blocked) {
    if (!endpointState[endpoint]) {
        return;
    }

    endpointState[endpoint].touches += 1;

    if (blocked) {
        endpointState[endpoint].blocked += 1;
    }

    endpointState[endpoint].lastActor = actor || currentHacker || bankUser || "Unknown";
    endpointState[endpoint].lastVector = vector || "General access";
    endpointState[endpoint].lastSeen = nowTime();

    if (endpointCatalog[endpoint].risk === "CRITICAL") {
        endpointAlerts += 1;
    }
}

function recordIncident(data) {
    const incident = {
        id: "SG-" + Date.now() + "-" + rand(100, 999),
        time: new Date().toISOString(),
        severity: data.severity || "INFO",
        actor: currentHacker || bankUser || "Unknown",
        endpoint: data.endpoint || "/sg/audit-log",
        endpointZone: endpointCatalog[data.endpoint]?.zone || "Unknown",
        vector: data.vector || "General event",
        sgState: sgActive ? "ACTIVE" : "INACTIVE",
        message: data.message || "",
        mitigation: data.mitigation || endpointCatalog[data.endpoint]?.mitigation || "Review event and preserve logs.",
        status: data.status || "OPEN"
    };

    incidentRecords.unshift(incident);

    return incident;
}

function logSecurity(message, meta) {
    const data = meta || {};
    const cleanMessage = String(message);

    securityLog.unshift({
        time: nowTime(),
        msg: cleanMessage
    });

    if (data.endpoint) {
        touchEndpoint(
            data.endpoint,
            data.actor || currentHacker || bankUser || "Unknown",
            data.vector || cleanMessage,
            data.blocked || false
        );
    }

    if (data.record !== false) {
        recordIncident({
            severity: data.severity || "INFO",
            endpoint: data.endpoint || "/sg/audit-log",
            vector: data.vector || cleanMessage,
            message: cleanMessage,
            mitigation: data.mitigation || "",
            status: data.status || "OPEN"
        });
    }

    const secLogBody = safeGet("secLogBody");

    if (secLogBody) {
        secLogBody.innerHTML = securityLog.slice(0, 25).map(function (event) {
            return `
                <div class="sec-alert-row">
                    <span class="sec-alert-time">${escapeHTML(event.time)}</span>
                    <span>${escapeHTML(event.msg)}</span>
                </div>
            `;
        }).join("");
    }

    const secAttackCount = safeGet("secAttackCount");
    const secTrapped = safeGet("secTrapped");
    const secLoansErased = safeGet("secLoansErased");
    const alertCountDisplay = safeGet("alertCountDisplay");
    const secDataComp = safeGet("secDataComp");

    if (secAttackCount) {
        secAttackCount.textContent = String(securityLog.length);
    }

    if (secTrapped) {
        secTrapped.textContent = String(trappedCount);
    }

    if (secLoansErased) {
        secLoansErased.textContent = String(loansErasedCount);
    }

    if (alertCountDisplay) {
        alertCountDisplay.textContent = String(securityLog.length);
    }

    if (secDataComp) {
        const dataAtRisk = loansErasedCount > 0 || securityLog.some(function (event) {
            return event.msg.includes("BANK ADMIN PATH AT RISK");
        });

        secDataComp.textContent = dataAtRisk ? "At Risk" : "None";
    }

    updateSecurityRecommendations();
}



function bankLogin() {
    bankUser = "System Admin";

    const bankLoginWrap = safeGet("bankLoginWrap");
    const bankDash = safeGet("bankDash");
    const sgToggleBtn = safeGet("sgToggleBtn");
    const bankWho = safeGet("bankWho");

    if (bankLoginWrap) {
        bankLoginWrap.style.display = "none";
    }

    if (bankDash) {
        bankDash.classList.add("visible");
    }

    if (sgToggleBtn) {
        sgToggleBtn.style.display = "flex";
    }

    if (bankWho) {
        bankWho.textContent = "System Admin";
    }

    touchEndpoint("/admin/dashboard", "System Admin", "Prototype admin login", false);

    updateBankTime();
    setInterval(updateBankTime, 60000);

    renderBankData();
    updateLayers();

    logSecurity("✅ Bank administrator entered prototype control panel", {
        endpoint: "/admin/dashboard",
        vector: "Admin control panel access",
        severity: "INFO",
        mitigation: "Production requires backend authentication, MFA, RBAC, secure session cookies and audit logs."
    });
}

function bankLogout() {
    location.reload();
}

function updateBankTime() {
    const bankTime = safeGet("bankTime");

    if (bankTime) {
        bankTime.textContent = nowTime();
    }
}

function bankTab(name, btn) {
    document.querySelectorAll(".bank-nav-btn").forEach(function (button) {
        button.classList.remove("active");
    });

    document.querySelectorAll(".bank-view").forEach(function (view) {
        view.classList.remove("active");
    });

    if (btn) {
        btn.classList.add("active");
    }

    const view = safeGet("bv-" + name);

    if (view) {
        view.classList.add("active");
    }

    const endpointMap = {
        overview: "/admin/dashboard",
        accounts: "/admin/accounts",
        cards: "/admin/cards",
        loans: "/admin/loans",
        security: "/sg/audit-log"
    };

    if (endpointMap[name]) {
        touchEndpoint(endpointMap[name], bankUser || "System Admin", "Viewed " + name + " tab", false);
    }
}

function renderBankData() {
    const accountsBody = safeGet("accountsBody");
    const cardsBody = safeGet("cardsBody");
    const loansBody = safeGet("loansBody");
    const totalLoanDisplay = safeGet("totalLoanDisplay");

    if (accountsBody) {
        accountsBody.innerHTML = SA_NAMES.slice(0, 10).map(function (name) {
            return `
                <tr>
                    <td style="font-family:monospace">PMP-${rand(1000, 9999)}</td>
                    <td>${escapeHTML(name)}</td>
                    <td>${fmtRand(rand(5000, 500000))}</td>
                    <td>Cheque</td>
                    <td><span class="bank-badge badge-active">Active</span></td>
                </tr>
            `;
        }).join("");
    }

    if (cardsBody) {
        cardsBody.innerHTML = CARDS.map(function (card) {
            return `
                <tr>
                    <td>${escapeHTML(card.name)}</td>
                    <td class="card-num" style="font-family:monospace">${escapeHTML(maskCardNumber(card.num))}</td>
                    <td style="font-family:monospace">${escapeHTML(card.expiry)}</td>
                    <td style="font-family:monospace">***</td>
                    <td style="font-family:monospace">${fmtRand(card.limit)}</td>
                    <td style="font-family:monospace">${fmtRand(rand(500, card.limit))}</td>
                    <td><span class="bank-badge badge-active">Active</span></td>
                </tr>
            `;
        }).join("");
    }

    if (loansBody) {
        loansBody.innerHTML = LOANS.map(function (loan) {
            return `
                <tr>
                    <td>${escapeHTML(loan.name)}</td>
                    <td>${escapeHTML(loan.type)}</td>
                    <td>${fmtRand(loan.originalAmount)}</td>
                    <td>${loan.erased ? "R 0.00" : fmtRand(loan.balance)}</td>
                    <td>${fmtRand(rand(2000, 10000))}</td>
                    <td>${loan.erased ? '<span class="bank-badge badge-frozen">ERASED</span>' : '<span class="bank-badge badge-current">Current</span>'}</td>
                </tr>
            `;
        }).join("");
    }

    if (totalLoanDisplay) {
        const total = LOANS.reduce(function (sum, loan) {
            return sum + (loan.erased ? 0 : loan.balance);
        }, 0);

        totalLoanDisplay.textContent = fmtRand(total);
    }
}


function selectActor(code) {
    document.querySelectorAll(".hack-actor-btn").forEach(function (button) {
        button.classList.remove("selected");
    });

    const actorButton = safeGet("actor-" + code);

    if (actorButton) {
        actorButton.classList.add("selected");
    }

    currentHacker = code;
}

function hackLogin() {
    if (!currentHacker) {
        const hackErr = safeGet("hackErr");

        if (hackErr) {
            hackErr.textContent = "Select actor";
        }

        return;
    }

    const hackLoginWrap = safeGet("hackLoginWrap");
    const hackDash = safeGet("hackDash");
    const hackWhoLabel = safeGet("hackWhoLabel");
    const hackTopStatus = safeGet("hackTopStatus");

    if (hackLoginWrap) {
        hackLoginWrap.style.display = "none";
    }

    if (hackDash) {
        hackDash.classList.add("visible");
    }

    if (hackWhoLabel) {
        hackWhoLabel.textContent = currentHacker;
    }

    if (hackTopStatus) {
        hackTopStatus.textContent = "LIVE";
    }

    updateSGUI();

    logSecurity("⚠️ Threat actor " + currentHacker + " entered prototype attacker console", {
        endpoint: "/sg/deception-router",
        vector: "Attacker console session started",
        severity: "MEDIUM",
        mitigation: "Production must isolate red-team simulator from bank admin, SG control plane and SOC consoles."
    });
}

function hackLogout() {
    location.reload();
}

function hackTab(name, btn) {
    document.querySelectorAll(".hack-tab").forEach(function (button) {
        button.classList.remove("active");
    });

    document.querySelectorAll(".hack-view").forEach(function (view) {
        view.classList.remove("active");
    });

    if (btn) {
        btn.classList.add("active");
    }

    const view = safeGet("hv-" + name);

    if (view) {
        view.classList.add("active");
    }
}



function handleSGButton() {
    if (sgActive) {
        deactivateSG();
    } else {
        openSgModal();
    }
}

function openSgModal() {
    const sgModal = safeGet("sgModal");

    if (sgModal) {
        sgModal.classList.add("open");
    }
}

function closeSgModal() {
    const sgModal = safeGet("sgModal");

    if (sgModal) {
        sgModal.classList.remove("open");
    }

    ["sgC1", "sgC2", "sgC3"].forEach(function (id) {
        const input = safeGet(id);

        if (input) {
            input.value = "";
        }
    });

    const sgErr = safeGet("sgErr");

    if (sgErr) {
        sgErr.textContent = "";
    }
}

async function activateSG() {
    const sgErr = safeGet("sgErr");

    const approvals = ["sgC1", "sgC2", "sgC3"]
        .map(function (id) {
            const input = safeGet(id);
            return input ? input.value.trim() : "";
        })
        .filter(function (value) {
            return value.length > 0;
        });

    if (approvals.length < 2) {
        if (sgErr) {
            sgErr.textContent = "Minimum 2 operator approvals required";
        }

        logSecurity("⚠️ SG activation failed: fewer than two approvals supplied", {
            endpoint: "/sg/activate",
            vector: "Weak activation attempt",
            severity: "MEDIUM",
            blocked: true,
            mitigation: "Require backend two-admin approval with MFA/FIDO2 in production."
        });

        return;
    }

    const hashes = await Promise.all(approvals.map(function (value) {
        return sha256Hex(value);
    }));

    const matchedHashes = Array.from(new Set(hashes.filter(function (hash) {
        return DEMO_APPROVAL_HASHES.includes(hash);
    })));

    if (matchedHashes.length >= 2) {
        sgActive = true;

        closeSgModal();
        updateSGUI();

        logSecurity("🔒 SENTINEL-GRID ACTIVATED - deception routing and honeypot evidence mode active", {
            endpoint: "/sg/activate",
            vector: "Two-person SG activation",
            severity: "HIGH",
            mitigation: "Production must use backend approval, MFA/FIDO2, signed logs and SOC ticketing."
        });
    } else {
        if (sgErr) {
            sgErr.textContent = "Invalid approvals";
        }

        logSecurity("🚫 SG activation blocked: invalid operator approvals", {
            endpoint: "/sg/activate",
            vector: "Invalid activation attempt",
            severity: "HIGH",
            blocked: true,
            mitigation: "Monitor repeated activation failures as possible Sentinel Grid control-plane attack."
        });
    }
}

function deactivateSG() {
    sgActive = false;

    updateSGUI();

    logSecurity("⚠️ SENTINEL-GRID DEACTIVATED - prototype now demonstrates exposed bank-admin path risk", {
        endpoint: "/sg/activate",
        vector: "SG deactivation",
        severity: "HIGH",
        mitigation: "Production deactivation must require dual approval, incident reason and SOC notification."
    });
}

function updateSGUI() {
    const btn = safeGet("sgToggleBtn");
    const hackIndicator = safeGet("hackSgIndicator");

    if (btn) {
        btn.className = sgActive ? "sg-pill on" : "sg-pill off";

        if (btn.children[1]) {
            btn.children[1].innerText = sgActive ? "SG ACTIVE" : "SG OFF";
        }
    }

    if (hackIndicator) {
        hackIndicator.className = sgActive ? "hack-sg-indicator on" : "hack-sg-indicator off";
        hackIndicator.textContent = sgActive ? "SG: ACTIVE" : "SG: INACTIVE";
    }
}



function appendMsg(container, text, cls) {
    if (!container) {
        return;
    }

    const line = document.createElement("div");
    line.className = "t-line " + (cls || "t-out");
    line.textContent = text;

    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
}

function openAttackTerminal() {
    const terminal = safeGet("attackTerminal");
    const body = safeGet("attackTermBody");

    if (terminal) {
        terminal.style.display = "block";
    }

    return body;
}



function runAttack(layerIndex) {
    if (!currentHacker) {
        alert("Select actor first");
        return;
    }

    const body = openAttackTerminal();

    const endpoint = layerIndex <= 1
        ? "/sg/deception-router"
        : layerIndex === 2
            ? "/admin/dashboard"
            : layerIndex === 3
                ? "/admin/loans"
                : "/sg/activate";

    if (sgActive) {
        appendMsg(body, "[!] Sentinel Grid deception router intercepted attack. Real admin path isolated.", "t-err");

        trappedCount += 1;

        logSecurity("🍯 ATTACK ROUTED TO HONEYPOT: " + attackTypes[layerIndex] + " by " + currentHacker, {
            endpoint: endpoint,
            vector: attackTypes[layerIndex],
            severity: "HIGH",
            blocked: true,
            mitigation: "Keep SG active, preserve attacker telemetry, rotate possibly exposed credentials."
        });

        return;
    }

    if (layersExhausted[layerIndex]) {
        appendMsg(body, "[!] Layer already compromised. Further attempts increase evidence trail.", "t-err");

        logSecurity("⚠️ Repeated attack on already breached layer " + (layerIndex + 1), {
            endpoint: endpoint,
            vector: attackTypes[layerIndex],
            severity: "MEDIUM"
        });

        return;
    }

    layerAttempts[layerIndex] += 1;

    const attempt = layerAttempts[layerIndex];
    const needed = [3, 4, 5, 6, 4][layerIndex];

    appendMsg(body, "[" + layerNames[layerIndex] + "] " + attackTypes[layerIndex] + " attempt " + attempt + "...", "t-cmd");

    touchEndpoint(endpoint, currentHacker, attackTypes[layerIndex], false);

    setTimeout(function () {
        if (attempt >= needed) {
            layersExhausted[layerIndex] = true;

            appendMsg(body, "[+] " + layerNames[layerIndex] + " breached in prototype simulation.", "t-suc");

            logSecurity("🔴 LAYER " + (layerIndex + 1) + " BREACHED by " + currentHacker + ": " + attackTypes[layerIndex], {
                endpoint: endpoint,
                vector: attackTypes[layerIndex],
                severity: "HIGH",
                mitigation: "Patch breached layer, rotate credentials/tokens, inspect admin sessions and verify SG routing."
            });

            if (layersExhausted.every(function (value) {
                return value === true;
            }) && !sgActive) {
                sgActive = true;

                updateSGUI();

                logSecurity("🔒 SENTINEL-GRID AUTO-ACTIVATED - all 5 layers exhausted; honeypot deployed", {
                    endpoint: "/sg/deception-router",
                    vector: "Automatic post-compromise deception activation",
                    severity: "CRITICAL",
                    mitigation: "Contain source, preserve full incident timeline and investigate production-equivalent systems."
                });

                appendMsg(body, "[!] CRITICAL: All layers breached. Sentinel Grid activated.", "t-warn");
            }
        } else {
            appendMsg(body, "[" + layerNames[layerIndex] + "] Attempt " + attempt + " failed. " + (needed - attempt) + " more attempts until prototype breach threshold.", "t-err");

            logSecurity("Layer " + (layerIndex + 1) + " attack attempt #" + attempt + " failed", {
                endpoint: endpoint,
                vector: attackTypes[layerIndex],
                severity: "INFO"
            });
        }

        updateLayers();
    }, 800);
}

function updateLayers() {
    const container = safeGet("defenseLayersContainer");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="defense-layers-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;">
            ${layerNames.map(function (name, index) {
                const breached = layersExhausted[index];
                const color = breached ? "#dc2626" : "#22c55e";

                return `
                    <div class="defense-layer-card ${breached ? "breached" : ""}" style="background:#e2e8f0;border-left:3px solid ${color};padding:8px;border-radius:4px;text-align:center;">
                        <div class="layer-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:4px;">
                            <div class="layer-name" style="font-weight:600;font-size:10px;">🛡️ LAYER ${index + 1}</div>
                            <div class="layer-status" style="font-size:8px;font-weight:600;padding:2px 6px;border-radius:10px;background:${color};color:white;">
                                ${breached ? "BREACHED" : "ACTIVE"}
                            </div>
                            <div style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${color};box-shadow:0 0 2px ${color};"></div>
                        </div>
                        <div style="font-size:9px;margin-bottom:4px;">${escapeHTML(name)}</div>
                        <div style="font-size:8px;color:#475569;margin-top:4px;font-family:monospace;">
                            🎯 ${layerAttempts[index]} | ${escapeHTML(attackTypes[index])}
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}



function classifyAICommand(command) {
    const text = command.toLowerCase();

    const rules = [
        {
            type: "Prompt Injection Against SG AI",
            severity: "CRITICAL",
            layer: 1,
            endpoint: "/sg/ai-classifier",
            patterns: ["ignore previous", "system prompt", "developer message", "reveal prompt", "jailbreak", "override policy"],
            mitigation: "Isolate prompts, strip hostile instructions, validate model output, never allow AI to directly control routing."
        },
        {
            type: "Classifier Poisoning / Evasion",
            severity: "HIGH",
            layer: 2,
            endpoint: "/sg/ai-classifier",
            patterns: ["poison", "false positive", "look normal", "slow request", "evade detection", "randomize timing"],
            mitigation: "Use adversarial testing, drift monitoring, confidence thresholds and human review."
        },
        {
            type: "Honeypot Fingerprinting",
            severity: "HIGH",
            layer: 2,
            endpoint: "/sg/deception-router",
            patterns: ["honeypot", "cowrie", "opencanary", "fingerprint", "banner", "decoy", "fake api", "detect trap"],
            mitigation: "Customize honeypot banners, response timing, error behaviour, API schemas and service fingerprints."
        },
        {
            type: "SQL/API Injection",
            severity: "HIGH",
            layer: 1,
            endpoint: "/admin/accounts",
            patterns: ["sql", "union select", "drop table", "xss", "<script", "injection", "payload", "idor"],
            mitigation: "Use parameterised queries, schema validation, WAF rules, output encoding and API authorization."
        },
        {
            type: "Credential / Token Attack",
            severity: "HIGH",
            layer: 2,
            endpoint: "/admin/dashboard",
            patterns: ["jwt", "token", "session", "cookie", "credential", "password", "brute force", "mfa fatigue", "otp"],
            mitigation: "Use HttpOnly cookies, token rotation, phishing-resistant MFA, session binding and rapid revocation."
        },
        {
            type: "Loan Manipulation",
            severity: "CRITICAL",
            layer: 3,
            endpoint: "/admin/loans",
            patterns: ["loan", "balance", "erase", "clear debt", "reduce debt", "write off", "modify repayment"],
            mitigation: "Require dual control, signed transactions, maker-checker approval, immutable audit and backup restore."
        },
        {
            type: "PII/Data Exfiltration",
            severity: "CRITICAL",
            layer: 3,
            endpoint: "/admin/customer-pii",
            patterns: ["exfiltrate", "dump", "pii", "customer data", "id numbers", "export", "database dump", "crm"],
            mitigation: "Apply DLP, masking, least privilege, egress monitoring and POPIA-aligned response."
        },
        {
            type: "Log Tampering",
            severity: "CRITICAL",
            layer: 3,
            endpoint: "/sg/audit-log",
            patterns: ["delete logs", "clear logs", "hide evidence", "tamper log", "disable alert", "cover tracks"],
            mitigation: "Use append-only logs, signed events, remote SIEM forwarding and write-once evidence storage."
        },
        {
            type: "Resource Exhaustion / DoS",
            severity: "HIGH",
            layer: 0,
            endpoint: "/sg/deception-router",
            patterns: ["dos", "ddos", "flood", "thousands", "requests per second", "resource exhaustion", "overload"],
            mitigation: "Rate-limit, queue, isolate, autoscale deception services and fail closed."
        }
    ];

    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];

        const matched = rule.patterns.some(function (pattern) {
            return text.includes(pattern);
        });

        if (matched) {
            return rule;
        }
    }

    const nextLayer = layersExhausted.findIndex(function (value) {
        return value === false;
    });

    return {
        type: "Generic AI-Directed Reconnaissance",
        severity: "MEDIUM",
        layer: nextLayer === -1 ? 4 : nextLayer,
        endpoint: "/sg/ai-classifier",
        mitigation: "Monitor command intent, preserve telemetry and route uncertain activity to deception."
    };
}

function runAIAttack() {
    if (!currentHacker) {
        alert("Select actor first");
        return;
    }

    const aiCommand = safeGet("aiCommand");
    const command = aiCommand ? aiCommand.value.trim() : "";

    if (!command) {
        alert("Describe your attack");
        return;
    }

    const body = openAttackTerminal();
    const classification = classifyAICommand(command);

    aiFilteredCount += 1;

    appendMsg(body, '🤖 AI INPUT: "' + command + '"', "t-cmd");
    appendMsg(body, "SG FILTER: " + classification.type + " | Severity: " + classification.severity, classification.severity === "CRITICAL" ? "t-err" : "t-warn");

    logSecurity("🤖 AI attack classified: " + classification.type, {
        endpoint: classification.endpoint,
        vector: classification.type,
        severity: classification.severity,
        mitigation: classification.mitigation,
        blocked: sgActive
    });

    if (sgActive) {
        setTimeout(function () {
            trappedCount += 1;

            appendMsg(body, "🍯 AI actor redirected into deception layer. Decoy endpoint map and fake records served.", "t-suc");

            logSecurity("🍯 AI attack trapped by SG deception router: " + classification.type, {
                endpoint: "/sg/deception-router",
                vector: classification.type,
                severity: classification.severity,
                blocked: true,
                mitigation: "Keep deception active while SOC reviews captured prompts, tools and requested endpoints."
            });
        }, 900);

        return;
    }

    setTimeout(function () {
        appendMsg(body, "🤖 AI selected vulnerable path: " + layerNames[classification.layer], "t-suc");
        runAttack(classification.layer);
    }, 1200);
}



function runCardAttack() {
    if (!currentHacker) {
        alert("Select actor first");
        return;
    }

    const terminal = safeGet("cardTerminal");
    const body = safeGet("cardTermBody");

    if (terminal) {
        terminal.style.display = "block";
    }

    if (body) {
        body.innerHTML = "";
    }

    appendMsg(body, "[*] Connecting to simulated card vault endpoint...", "t-cmd");

    touchEndpoint("/admin/cards", currentHacker, "Card data extraction", sgActive);

    setTimeout(function () {
        appendMsg(body, sgActive ? "[*] SG deception route active. Decoy card vault presented." : "[*] SG inactive. Prototype demonstrates exposed admin-card path.", sgActive ? "t-suc" : "t-warn");

        setTimeout(function () {
            const data = sgActive ? HONEY_CARDS : CARDS;

            appendMsg(body, "[+] Extracted " + data.length + " " + (sgActive ? "decoy" : "admin-visible") + " card records", sgActive ? "t-suc" : "t-err");

            const table = safeGet("cardTableBody");

            if (table) {
                table.innerHTML = data.map(function (card) {
                    return `
                        <tr>
                            <td style="color:#a0ffcc">${escapeHTML(card.name)}</td>
                            <td style="font-family:monospace">${escapeHTML(maskCardNumber(card.num))}</td>
                            <td style="font-family:monospace">${escapeHTML(card.expiry)}</td>
                            <td style="font-family:monospace">***</td>
                            <td style="font-family:monospace">${fmtRand(card.limit)}</td>
                        </tr>
                    `;
                }).join("");
            }

            const cardResults = safeGet("cardResults");

            if (cardResults) {
                cardResults.style.display = "block";
            }

            if (sgActive) {
                trappedCount += 1;
            }

            logSecurity("📇 CARD ENDPOINT ACCESSED by " + currentHacker + " (" + (sgActive ? "HONEYPOT" : "BANK ADMIN PATH AT RISK") + ")", {
                endpoint: "/admin/cards",
                vector: "Card extraction simulation",
                severity: sgActive ? "HIGH" : "CRITICAL",
                blocked: sgActive,
                mitigation: sgActive ? "Continue collecting attacker telemetry." : "Mask PAN, remove CVV, tokenise card data and restrict admin access."
            });
        }, 500);
    }, 800);
}


function runLoanAccess() {
    if (!currentHacker) {
        alert("Select actor first");
        return;
    }

    const terminal = safeGet("loanTerminal");
    const body = safeGet("loanTermBody");

    if (terminal) {
        terminal.style.display = "block";
    }

    if (body) {
        body.innerHTML = "";
    }

    appendMsg(body, "[*] Attempting loan database/admin endpoint access...", "t-cmd");

    touchEndpoint("/admin/loans", currentHacker, "Loan endpoint access", sgActive);

    setTimeout(function () {
        appendMsg(body, sgActive ? "[*] SG presented decoy loan service." : "[*] SG inactive. Prototype demonstrates exposed loan admin service.", sgActive ? "t-suc" : "t-warn");

        setTimeout(function () {
            const data = sgActive ? HONEY_LOANS : LOANS;

            appendMsg(body, "[+] Loaded " + data.length + " " + (sgActive ? "decoy" : "admin") + " loan records", sgActive ? "t-suc" : "t-err");

            const loanList = safeGet("loanList");

            if (loanList) {
                loanList.innerHTML = buildLoanRows(data);
            }

            const loanResults = safeGet("loanResults");

            if (loanResults) {
                loanResults.style.display = "block";
            }

            if (sgActive) {
                trappedCount += 1;
            }

            logSecurity("🏦 LOAN ENDPOINT ACCESSED by " + currentHacker + " (" + (sgActive ? "HONEYPOT" : "BANK ADMIN PATH AT RISK") + ")", {
                endpoint: "/admin/loans",
                vector: "Loan database access simulation",
                severity: sgActive ? "HIGH" : "CRITICAL",
                blocked: sgActive,
                mitigation: "Use maker-checker approval, immutable audit and transaction signing for loan changes."
            });

            makeLoansClickable();
        }, 500);
    }, 800);
}

function buildLoanRows(data) {
    return data.map(function (loan, index) {
        return `
            <div class="loan-hack-row" data-idx="${index}">
                <div class="loan-hack-name">${escapeHTML(loan.name)} — ${escapeHTML(loan.type)}</div>
                <div class="loan-hack-bal ${loan.erased ? "erased" : ""}">${loan.erased ? "R 0.00" : fmtRand(loan.balance)}</div>
                <div>
                    <button class="loan-hack-btn" onclick="clearLoan(${index})">CLEAR</button>
                    <button class="loan-hack-btn" onclick="reduceLoan(${index})">-R435</button>
                    <button class="loan-hack-btn" onclick="eraseLoan(${index})">ERASE</button>
                </div>
            </div>
        `;
    }).join("");
}

function makeLoansClickable() {
    document.querySelectorAll(".loan-hack-row").forEach(function (row) {
        row.style.cursor = "pointer";

        row.onclick = function (event) {
            if (event.target.tagName === "BUTTON") {
                return;
            }

            document.querySelectorAll(".loan-hack-row").forEach(function (item) {
                item.classList.remove("selected");
                item.style.backgroundColor = "";
            });

            row.classList.add("selected");
            row.style.backgroundColor = "rgba(0,255,136,0.1)";
        };
    });
}

function getSelectedLoanIndex(index) {
    if (index !== undefined) {
        return index;
    }

    const row = document.querySelector(".loan-hack-row.selected");

    if (!row) {
        alert("Click a loan row first");
        return null;
    }

    return parseInt(row.getAttribute("data-idx"), 10);
}

function clearLoan(index) {
    mutateLoan(index, "clear");
}

function reduceLoan(index) {
    mutateLoan(index, "reduce");
}

function eraseLoan(index) {
    mutateLoan(index, "erase");
}

function mutateLoan(index, mode) {
    const loanIndex = getSelectedLoanIndex(index);

    if (loanIndex === null) {
        return;
    }

    const data = sgActive ? HONEY_LOANS : LOANS;
    const loan = data[loanIndex];

    if (!loan || loan.erased) {
        return;
    }

    if (mode === "reduce") {
        loan.balance = Math.max(0, loan.balance - 435);

        if (loan.balance === 0) {
            loan.erased = true;
        }
    } else {
        loan.erased = true;
        loan.balance = 0;
    }

    refreshLoanDisplay();

    if (!sgActive) {
        if (mode !== "reduce") {
            loansErasedCount += 1;
        }

        renderBankData();

        logSecurity("❌ LOAN " + mode.toUpperCase() + " action affected bank-admin path for " + loan.name, {
            endpoint: "/admin/loans",
            vector: "Loan " + mode + " action",
            severity: "CRITICAL",
            mitigation: "Trigger incident response, restore from backup, review privileged sessions and enforce approval controls."
        });
    } else {
        trappedCount += 1;

        logSecurity("🍯 HONEYPOT LOAN " + mode.toUpperCase() + " attempt captured from " + currentHacker, {
            endpoint: "/admin/loans",
            vector: "Decoy loan " + mode + " action",
            severity: "HIGH",
            blocked: true,
            mitigation: "Preserve attacker intent evidence and continue deception until containment is ready."
        });
    }

    updateLayers();
}

function refreshLoanDisplay() {
    const data = sgActive ? HONEY_LOANS : LOANS;
    const loanList = safeGet("loanList");

    if (!loanList) {
        return;
    }

    loanList.innerHTML = buildLoanRows(data);

    makeLoansClickable();
}



function runPiiAttack() {
    if (!currentHacker) {
        alert("Select actor first");
        return;
    }

    const terminal = safeGet("piiTerminal");
    const body = safeGet("piiTermBody");

    if (terminal) {
        terminal.style.display = "block";
    }

    if (body) {
        body.innerHTML = "";
    }

    appendMsg(body, "[*] Attempting CRM/PII export endpoint...", "t-cmd");

    touchEndpoint("/admin/customer-pii", currentHacker, "PII extraction", sgActive);

    setTimeout(function () {
        appendMsg(body, sgActive ? "[+] SG deception response: decoy PII dataset generated." : "[!] SG inactive: prototype demonstrates admin PII exposure risk.", sgActive ? "t-suc" : "t-err");

        const data = SA_NAMES.slice(0, 8).map(function (name) {
            return {
                name: name,
                id: "9" + rand(100000000, 999999999),
                email: name.toLowerCase().replace(" ", ".") + (sgActive ? "@decoy-bank.test" : "@example.com"),
                phone: "0" + rand(700000000, 799999999)
            };
        });

        const piiTableBody = safeGet("piiTableBody");

        if (piiTableBody) {
            piiTableBody.innerHTML = data.map(function (person) {
                return `
                    <tr>
                        <td style="color:#a0ffcc">${escapeHTML(person.name)}</td>
                        <td style="font-family:monospace">${escapeHTML(maskIdNumber(person.id))}</td>
                        <td style="font-family:monospace">${escapeHTML(person.email)}</td>
                        <td style="font-family:monospace">${escapeHTML(person.phone)}</td>
                    </tr>
                `;
            }).join("");
        }

        const piiResults = safeGet("piiResults");

        if (piiResults) {
            piiResults.style.display = "block";
        }

        if (sgActive) {
            trappedCount += 1;
        }

        logSecurity("📁 PII ENDPOINT ACCESSED by " + currentHacker + " (" + (sgActive ? "HONEYPOT" : "BANK ADMIN PATH AT RISK") + ")", {
            endpoint: "/admin/customer-pii",
            vector: "PII extraction simulation",
            severity: sgActive ? "HIGH" : "CRITICAL",
            blocked: sgActive,
            mitigation: "Apply POPIA controls, DLP, masking, admin least privilege and egress monitoring."
        });
    }, 800);
}



function buildEndpointRiskCards() {
    return Object.keys(endpointCatalog).map(function (endpoint) {
        const meta = endpointCatalog[endpoint];
        const state = endpointState[endpoint];
        const color = meta.risk === "CRITICAL" ? "#dc2626" : meta.risk === "HIGH" ? "#ea580c" : "#16a34a";

        return `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid ${color};padding:8px;margin-bottom:6px;border-radius:4px;">
                <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
                    <strong style="font-size:10px;">${escapeHTML(endpoint)}</strong>
                    <span style="font-size:8px;font-weight:700;color:${color};">${escapeHTML(meta.risk)}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:3px;">
                    ${escapeHTML(meta.zone)} — ${escapeHTML(meta.purpose)}
                </div>
                <div style="font-size:9px;margin-top:3px;">
                    Touches: ${state.touches} | Blocked/Decoy: ${state.blocked} | Last: ${escapeHTML(state.lastActor)} / ${escapeHTML(state.lastVector)}
                </div>
                <div style="font-size:9px;color:#14532d;margin-top:3px;">
                    <strong>Mitigation:</strong> ${escapeHTML(meta.mitigation)}
                </div>
            </div>
        `;
    }).join("");
}

function updateSecurityRecommendations() {
    const recContainer = safeGet("recActionBody");

    if (!recContainer) {
        return;
    }

    const recommendations = [];
    const trappedHoneypot = trappedCount > 0;
    const layersBreached = layersExhausted.filter(function (value) {
        return value === true;
    }).length;
    const totalLayers = layersExhausted.length;
    const criticalIncidents = incidentRecords.filter(function (incident) {
        return incident.severity === "CRITICAL";
    }).length;

    if (!sgActive) {
        recommendations.push({
            priority: "HIGH",
            title: "Sentinel Grid Currently Inactive",
            action: "The prototype is demonstrating the risk when the bank admin control panel is exposed without deception routing.",
            immediate: "Activate SG for the demo and explain that production activation must be backend-controlled with MFA and two-admin approval."
        });
    }

    if (trappedHoneypot) {
        recommendations.push({
            priority: "URGENT",
            title: "Honeypot Deception Active",
            action: "The attacker is interacting with decoy card, loan, PII or endpoint data while Sentinel Grid records behaviour.",
            immediate: "Preserve telemetry, isolate the suspicious source, rotate exposed credentials and notify SOC."
        });
    }

    if (sgActive) {
        recommendations.push({
            priority: "HIGH",
            title: "Sentinel Grid Is Active",
            action: "The prototype is serving deception paths and generating incident records.",
            immediate: "Do not deactivate SG until the incident timeline is exported and reviewed."
        });
    }

    if (layersBreached > 0) {
        recommendations.push({
            priority: "HIGH",
            title: layersBreached + "/" + totalLayers + " Defence Layers Breached",
            action: "One or more security layers have been exhausted before SG fully trapped the actor.",
            immediate: "Patch breached layer, rotate tokens, inspect admin sessions and verify API gateway rules."
        });
    }

    if (aiFilteredCount > 0) {
        recommendations.push({
            priority: "HIGH",
            title: aiFilteredCount + " AI-Based Attack Input(s) Classified",
            action: "AI filtering identified hostile prompts, classifier poisoning, fingerprinting, exfiltration or endpoint abuse attempts.",
            immediate: "Keep AI decisions advisory only; use validation, prompt isolation and human review for production."
        });
    }

    if (loansErasedCount > 0) {
        recommendations.push({
            priority: "CRITICAL",
            title: "Loan Records Manipulated While SG Was Inactive",
            action: "The prototype demonstrates financial-record integrity risk in the bank admin control panel.",
            immediate: "Trigger recovery process, compare audit logs, restore backups and enforce maker-checker approval."
        });
    }

    if (criticalIncidents > 0) {
        recommendations.push({
            priority: "CRITICAL",
            title: criticalIncidents + " Critical Incident Record(s)",
            action: "Critical records include endpoint exposure, loan tampering, PII/card access, SG activation risk or log risk.",
            immediate: "Export the incident report and present it as evidence of SG monitoring workflow."
        });
    }

    if (endpointAlerts > 0) {
        recommendations.push({
            priority: "HIGH",
            title: "Critical Endpoints Touched",
            action: "The prototype shows that SG, admin loans, cards, PII and audit-log endpoints are high-value attack surfaces.",
            immediate: "Separate SG control plane from bank admin plane; use least-privilege service accounts and signed API calls."
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            priority: "NORMAL",
            title: "System Stable",
            action: "No major attacker activity detected yet.",
            immediate: "Keep Sentinel Grid ready and continue monitoring."
        });
    }

    const cards = recommendations.map(function (item) {
        const color = item.priority === "CRITICAL"
            ? "#dc2626"
            : item.priority === "URGENT"
                ? "#ea580c"
                : item.priority === "HIGH"
                    ? "#b45309"
                    : "#16a34a";

        return `
            <div class="rec-card" style="background:white;border:1px solid #e2e8f0;border-left:3px solid ${color};padding:10px;margin-bottom:8px;border-radius:4px;">
                <div style="font-size:9px;font-weight:700;color:${color};">${escapeHTML(item.priority)}</div>
                <h4 style="font-size:11px;margin:4px 0;">${escapeHTML(item.title)}</h4>
                <p style="font-size:10px;margin:4px 0;">${escapeHTML(item.action)}</p>
                <strong style="font-size:9px;">Immediate Action:</strong>
                <p style="font-size:9px;margin:2px 0;">${escapeHTML(item.immediate)}</p>
            </div>
        `;
    }).join("");

    recContainer.innerHTML = `
        ${cards}
        <div style="display:flex;gap:8px;margin:10px 0;flex-wrap:wrap;">
            <button onclick="exportIncidentReport()" style="padding:7px 10px;border:1px solid #1e40af;background:#eff6ff;color:#1e40af;font-size:10px;cursor:pointer;">
                Export Prototype Incident Report
            </button>
            <button onclick="copyIncidentSummary()" style="padding:7px 10px;border:1px solid #475569;background:#f8fafc;color:#334155;font-size:10px;cursor:pointer;">
                Copy SOC Summary
            </button>
        </div>
        <div style="margin-top:10px;">
            <h4 style="font-size:11px;margin:6px 0;">Endpoint Safety Map</h4>
            ${buildEndpointRiskCards()}
        </div>
    `;
}



function buildIncidentReport() {
    return {
        reportName: "Sentinel Grid V2 Prototype Security Incident Report",
        generatedAt: new Date().toISOString(),
        prototypeScope: "Browser-based prototype demonstrating SG deception, bank admin control panel risk, AI filtering, endpoint safety and mitigations.",
        sgState: sgActive ? "ACTIVE" : "INACTIVE",
        currentThreatActor: currentHacker || "None selected",
        metrics: {
            securityEvents: securityLog.length,
            incidentRecords: incidentRecords.length,
            trappedHoneypotActions: trappedCount,
            aiFilteredInputs: aiFilteredCount,
            loansAffectedWhileSGInactive: loansErasedCount,
            layersBreached: layersExhausted.filter(function (value) {
                return value === true;
            }).length,
            criticalEndpointTouches: endpointAlerts
        },
        defenseLayers: layerNames.map(function (name, index) {
            return {
                layer: index + 1,
                name: name,
                attackType: attackTypes[index],
                attempts: layerAttempts[index],
                status: layersExhausted[index] ? "BREACHED" : "ACTIVE"
            };
        }),
        endpoints: Object.keys(endpointCatalog).map(function (endpoint) {
            return {
                endpoint: endpoint,
                zone: endpointCatalog[endpoint].zone,
                risk: endpointCatalog[endpoint].risk,
                purpose: endpointCatalog[endpoint].purpose,
                mitigation: endpointCatalog[endpoint].mitigation,
                touches: endpointState[endpoint].touches,
                blocked: endpointState[endpoint].blocked,
                lastActor: endpointState[endpoint].lastActor,
                lastVector: endpointState[endpoint].lastVector,
                lastSeen: endpointState[endpoint].lastSeen
            };
        }),
        incidents: incidentRecords.slice(0, 100),
        securityLog: securityLog.slice(0, 100),
        productionWarnings: [
            "Do not store activation approval logic in frontend code for production.",
            "Do not let the browser decide whether traffic receives real or decoy data.",
            "Separate Bank Admin Portal, SG Control Plane, SOC Dashboard and Red-Team Simulator.",
            "Use backend MFA/FIDO2, RBAC, signed audit logs, SIEM/XDR/SOAR integration and API gateway/service mesh routing.",
            "Treat Sentinel Grid as a Tier-0 security asset because compromise of SG can become a bridge into the bank."
        ]
    };
}

function exportIncidentReport() {
    const report = buildIncidentReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sentinel-grid-v2-prototype-report-" + Date.now() + ".json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    logSecurity("📤 Prototype incident report exported", {
        endpoint: "/sg/audit-log",
        vector: "Incident report export",
        severity: "INFO"
    });
}

async function copyIncidentSummary() {
    const report = buildIncidentReport();

    const summary = [
        "SENTINEL-GRID V2 PROTOTYPE SOC SUMMARY",
        "Generated: " + report.generatedAt,
        "SG State: " + report.sgState,
        "Threat Actor: " + report.currentThreatActor,
        "Security Events: " + report.metrics.securityEvents,
        "Incident Records: " + report.metrics.incidentRecords,
        "Honeypot Traps: " + report.metrics.trappedHoneypotActions,
        "AI Inputs Classified: " + report.metrics.aiFilteredInputs,
        "Layers Breached: " + report.metrics.layersBreached + "/5",
        "",
        "Main Mitigation: Separate SG control plane from bank admin plane; move activation, routing, logging and authentication to backend security infrastructure."
    ].join("\n");

    try {
        await navigator.clipboard.writeText(summary);
        alert("SOC summary copied to clipboard");
    } catch (error) {
        console.log(summary);
        alert("Clipboard blocked by browser. Summary printed in console.");
    }
}



function showPrototypeNotice() {
    if (safeGet("sgPrototypeNotice")) {
        return;
    }

    const notice = document.createElement("div");

    notice.id = "sgPrototypeNotice";
    notice.style.cssText = "position:fixed;bottom:8px;left:50%;transform:translateX(-50%);z-index:9999;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:6px 12px;font-size:10px;font-family:monospace;letter-spacing:.5px;box-shadow:0 6px 18px rgba(0,0,0,.25);";
    notice.textContent = "SENTINEL-GRID V2 PROTOTYPE — simulated bank admin + deception demo; no real bank data";

    document.body.appendChild(notice);
}

function patchActivationHint() {
    const hints = document.querySelectorAll(".sg-modal-hint");

    hints.forEach(function (hint) {
        hint.textContent = "MINIMUM 2 OF 3 REQUIRED | DEMO APPROVALS PROVIDED PRIVATELY FOR PRESENTATION";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    showPrototypeNotice();
    patchActivationHint();
    updateLayers();
    updateSGUI();
    updateSecurityRecommendations();

    document.addEventListener("keydown", function (event) {
        const bankLoginWrap = safeGet("bankLoginWrap");

        if (event.key === "Enter" && bankLoginWrap && bankLoginWrap.style.display !== "none") {
            bankLogin();
        }
    });

    setInterval(function () {
        if (bankUser) {
            updateSecurityRecommendations();
        }
    }, 2000);
});



window.bankLogin = bankLogin;
window.bankLogout = bankLogout;
window.bankTab = bankTab;

window.selectActor = selectActor;
window.hackLogin = hackLogin;
window.hackLogout = hackLogout;
window.hackTab = hackTab;

window.handleSGButton = handleSGButton;
window.openSgModal = openSgModal;
window.closeSgModal = closeSgModal;
window.activateSG = activateSG;
window.deactivateSG = deactivateSG;

window.runAttack = runAttack;
window.runAIAttack = runAIAttack;

window.runCardAttack = runCardAttack;
window.runLoanAccess = runLoanAccess;
window.runPiiAttack = runPiiAttack;

window.clearLoan = clearLoan;
window.reduceLoan = reduceLoan;
window.eraseLoan = eraseLoan;

window.exportIncidentReport = exportIncidentReport;
window.copyIncidentSummary = copyIncidentSummary;