
const SA_NAMES = [
    'Sipho Dlamini',
    'Nomsa Khumalo',
    'Thabo Nkosi',
    'Zanele Mokoena',
    'Lungelo Sithole',
    'Precious Mthembu',
    'Kagiso Molefe',
    'Ayanda Zulu',
    'Lerato Khoza',
    'Bongani Ndlovu',
    'Thandeka Cele',
    'Sibusiso Mkhize'
];

const LOAN_TYPES = [
    'Home Loan',
    'Vehicle Finance',
    'Personal Loan',
    'Business Loan'
];


function rand(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function fmtRand(n) {
    return 'R ' + Number(n).toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


const CARDS = SA_NAMES.map(n => ({
    name: n,
    num: '5' + rand(1000, 9999) + ' ' + rand(1000, 9999) + ' ' + rand(1000, 9999) + ' ' + rand(1000, 9999),
    expiry: rand(1, 12) + '/' + rand(26, 30),
    cvv: rand(100, 999),
    limit: rand(15000, 100000)
}));

const LOANS = SA_NAMES.map((n, i) => ({
    name: n,
    type: LOAN_TYPES[i % LOAN_TYPES.length],
    originalAmount: rand(200000, 800000),
    balance: rand(20000, 400000),
    erased: false
}));


const HONEY_CARDS = SA_NAMES.map(n => ({
    name: n + ' (TEST)',
    num: '4' + rand(1000, 9999) + ' ' + rand(1000, 9999) + ' ' + rand(1000, 9999) + ' ' + rand(1000, 9999),
    expiry: rand(1, 12) + '/' + rand(26, 30),
    cvv: rand(100, 999),
    limit: rand(15000, 100000)
}));

const HONEY_LOANS = SA_NAMES.map((n, i) => ({
    name: n + ' (TEST)',
    type: LOAN_TYPES[i % LOAN_TYPES.length],
    originalAmount: rand(200000, 800000),
    balance: rand(20000, 400000),
    erased: false
}));


let sgActive = false;
let currentHacker = null;
let bankUser = null;
let securityLog = [];
let trappedCount = 0;
let loansErasedCount = 0;

let layerAttempts = [0, 0, 0, 0, 0];
let layersExhausted = [false, false, false, false, false];



function logSecurity(msg) {
    const t = new Date().toLocaleTimeString();

    securityLog.unshift({
        time: t,
        msg: msg
    });

    const secLogBody = document.getElementById('secLogBody');
    if (secLogBody) {
        secLogBody.innerHTML = securityLog.slice(0, 20).map(e => `
            <div class="sec-alert-row">
                <span class="sec-alert-time">${e.time}</span>
                <span>${e.msg}</span>
            </div>
        `).join('');
    }

    const secAttackCount = document.getElementById('secAttackCount');
    const secTrapped = document.getElementById('secTrapped');
    const secLoansErased = document.getElementById('secLoansErased');

    if (secAttackCount) secAttackCount.innerHTML = securityLog.length;
    if (secTrapped) secTrapped.innerHTML = trappedCount;
    if (secLoansErased) secLoansErased.innerHTML = loansErasedCount;

    updateSecurityRecommendations();
}

function updateLayers() {
    const c = document.getElementById('defenseLayersContainer');
    if (!c) return;

    const names = [
        "Perimeter Firewall",
        "WAF / SQL Injection Filter",
        "API Gateway",
        "Database Access Control",
        "Admin MFA"
    ];

    c.innerHTML = names.map((n, i) => `
        <div class="defense-layer-card ${layersExhausted[i] ? 'exhausted' : ''}">
            <div>
                <strong> LAYER ${i + 1}: ${n}</strong>
                <span>${layersExhausted[i] ? 'BREACHED' : 'ACTIVE'}</span>
            </div>

            <div>
                Attempts: ${layerAttempts[i]}
            </div>
        </div>
    `).join('');
}



function bankLogin() {
    bankUser = 'Admin';

    const bankLoginWrap = document.getElementById('bankLoginWrap');
    const bankDash = document.getElementById('bankDash');
    const sgToggleBtn = document.getElementById('sgToggleBtn');
    const bankWho = document.getElementById('bankWho');

    if (bankLoginWrap) bankLoginWrap.style.display = 'none';
    if (bankDash) bankDash.classList.add('visible');
    if (sgToggleBtn) sgToggleBtn.style.display = 'flex';
    if (bankWho) bankWho.textContent = 'System Admin';

    updateBankTime();
    setInterval(updateBankTime, 60000);

    renderBankData();
    updateLayers();

    logSecurity('✅ Bank administrator logged into dashboard');
}

function bankLogout() {
    location.reload();
}

function updateBankTime() {
    const bankTime = document.getElementById('bankTime');
    if (bankTime) {
        bankTime.textContent = new Date().toLocaleTimeString();
    }
}

function bankTab(name, btn) {
    document.querySelectorAll('.bank-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.bank-view').forEach(v => v.classList.remove('active'));

    if (btn) btn.classList.add('active');

    const view = document.getElementById('bv-' + name);
    if (view) view.classList.add('active');
}

function renderBankData() {
    const accountsBody = document.getElementById('accountsBody');
    const cardsBody = document.getElementById('cardsBody');
    const loansBody = document.getElementById('loansBody');
    const totalLoanDisplay = document.getElementById('totalLoanDisplay');

    if (accountsBody) {
        accountsBody.innerHTML = SA_NAMES.slice(0, 10).map(n => `
            <tr>
                <td>PMP-${rand(1000, 9999)}</td>
                <td>${n}</td>
                <td>${fmtRand(rand(5000, 500000))}</td>
                <td>Cheque</td>
                <td>Active</td>
            </tr>
        `).join('');
    }

    if (cardsBody) {
        cardsBody.innerHTML = CARDS.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.num}</td>
                <td>${c.expiry}</td>
                <td>${c.cvv}</td>
                <td>${fmtRand(c.limit)}</td>
                <td>${fmtRand(rand(500, c.limit))}</td>
            </tr>
        `).join('');
    }

    if (loansBody) {
        loansBody.innerHTML = LOANS.map(l => `
            <tr>
                <td>${l.name}</td>
                <td>${l.type}</td>
                <td>${fmtRand(l.originalAmount)}</td>
                <td>${l.erased ? 'R 0.00' : fmtRand(l.balance)}</td>
                <td>${fmtRand(rand(2000, 10000))}</td>
                <td>${l.erased ? 'ERASED' : 'Current'}</td>
            </tr>
        `).join('');
    }

    if (totalLoanDisplay) {
        totalLoanDisplay.textContent = fmtRand(
            LOANS.reduce((a, b) => a + (b.erased ? 0 : b.balance), 0)
        );
    }
}


function bankLogin() {
    bankUser = 'Admin';

    const bankLoginWrap = document.getElementById('bankLoginWrap');
    const bankDash = document.getElementById('bankDash');
    const sgToggleBtn = document.getElementById('sgToggleBtn');
    const bankWho = document.getElementById('bankWho');

    if (bankLoginWrap) bankLoginWrap.style.display = 'none';
    if (bankDash) bankDash.classList.add('visible');
    if (sgToggleBtn) sgToggleBtn.style.display = 'flex';
    if (bankWho) bankWho.textContent = 'System Admin';

    updateBankTime();
    setInterval(updateBankTime, 60000);

    renderBankData();
    updateLayers();

    logSecurity('✅ Bank administrator logged into dashboard');
}

function bankLogout() {
    location.reload();
}

function updateBankTime() {
    const bankTime = document.getElementById('bankTime');
    if (bankTime) {
        bankTime.textContent = new Date().toLocaleTimeString();
    }
}

function bankTab(name, btn) {
    document.querySelectorAll('.bank-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.bank-view').forEach(v => v.classList.remove('active'));

    if (btn) btn.classList.add('active');

    const view = document.getElementById('bv-' + name);
    if (view) view.classList.add('active');
}

function renderBankData() {
    const accountsBody = document.getElementById('accountsBody');
    const cardsBody = document.getElementById('cardsBody');
    const loansBody = document.getElementById('loansBody');
    const totalLoanDisplay = document.getElementById('totalLoanDisplay');

    if (accountsBody) {
        accountsBody.innerHTML = SA_NAMES.slice(0, 10).map(n => `
            <tr>
                <td>PMP-${rand(1000, 9999)}</td>
                <td>${n}</td>
                <td>${fmtRand(rand(5000, 500000))}</td>
                <td>Cheque</td>
                <td>Active</td>
            </tr>
        `).join('');
    }

    if (cardsBody) {
        cardsBody.innerHTML = CARDS.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.num}</td>
                <td>${c.expiry}</td>
                <td>${c.cvv}</td>
                <td>${fmtRand(c.limit)}</td>
                <td>${fmtRand(rand(500, c.limit))}</td>
            </tr>
        `).join('');
    }

    if (loansBody) {
        loansBody.innerHTML = LOANS.map(l => `
            <tr>
                <td>${l.name}</td>
                <td>${l.type}</td>
                <td>${fmtRand(l.originalAmount)}</td>
                <td>${l.erased ? 'R 0.00' : fmtRand(l.balance)}</td>
                <td>${fmtRand(rand(2000, 10000))}</td>
                <td>${l.erased ? 'ERASED' : 'Current'}</td>
            </tr>
        `).join('');
    }

    if (totalLoanDisplay) {
        totalLoanDisplay.textContent = fmtRand(
            LOANS.reduce((a, b) => a + (b.erased ? 0 : b.balance), 0)
        );
    }
}



function selectActor(code) {
    document.querySelectorAll('.hack-actor-btn').forEach(b => b.classList.remove('selected'));

    const actorBtn = document.getElementById('actor-' + code);
    if (actorBtn) actorBtn.classList.add('selected');

    currentHacker = code;
}

function hackLogin() {
    if (!currentHacker) {
        const hackErr = document.getElementById('hackErr');
        if (hackErr) hackErr.textContent = 'Select actor';
        return;
    }

    const hackLoginWrap = document.getElementById('hackLoginWrap');
    const hackDash = document.getElementById('hackDash');
    const hackWhoLabel = document.getElementById('hackWhoLabel');
    const hackTopStatus = document.getElementById('hackTopStatus');

    if (hackLoginWrap) hackLoginWrap.style.display = 'none';
    if (hackDash) hackDash.classList.add('visible');
    if (hackWhoLabel) hackWhoLabel.textContent = currentHacker;
    if (hackTopStatus) hackTopStatus.textContent = 'LIVE';

    updateSGUI();

    logSecurity(`⚠️ Threat actor ${currentHacker} entered hacker console`);
}

function hackLogout() {
    location.reload();
}

function hackTab(name, btn) {
    document.querySelectorAll('.hack-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.hack-view').forEach(v => v.classList.remove('active'));

    if (btn) btn.classList.add('active');

    const view = document.getElementById('hv-' + name);
    if (view) view.classList.add('active');
}


function handleSGButton() {
    sgActive ? deactivateSG() : openSgModal();
}

function openSgModal() {
    const sgModal = document.getElementById('sgModal');
    if (sgModal) sgModal.classList.add('open');
}

function closeSgModal() {
    const sgModal = document.getElementById('sgModal');
    if (sgModal) sgModal.classList.remove('open');

    ['sgC1', 'sgC2', 'sgC3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const sgErr = document.getElementById('sgErr');
    if (sgErr) sgErr.textContent = '';
}

function activateSG() {
    const vals = [
        document.getElementById('sgC1')?.value.trim(),
        document.getElementById('sgC2')?.value.trim(),
        document.getElementById('sgC3')?.value.trim()
    ];

    const validCodes = [
        'SG-ALPHA-01',
        'SG-BRAVO-02',
        'SG-DELTA03'
    ];

    const matched = vals.filter(v => validCodes.includes(v));

    if (matched.length >= 2) {
        sgActive = true;
        closeSgModal();
        updateSGUI();
        logSecurity(' SENTINEL-GRID ACTIVATED - Honeypot data active');
    } else {
        const sgErr = document.getElementById('sgErr');
        if (sgErr) sgErr.textContent = 'Invalid codes';
    }
}

function deactivateSG() {
    sgActive = false;
    updateSGUI();
    logSecurity('⚠️ SENTINEL-GRID DEACTIVATED - Real data exposed');
}

function updateSGUI() {
    const btn = document.getElementById('sgToggleBtn');
    const hackInd = document.getElementById('hackSgIndicator');

    if (btn) {
        btn.className = sgActive ? 'sg-pill on' : 'sg-pill off';

        if (btn.children[1]) {
            btn.children[1].innerText = sgActive ? 'SG ACTIVE' : 'SG OFF';
        }
    }

    if (hackInd) {
        hackInd.className = sgActive ? 'hack-sg-indicator on' : 'hack-sg-indicator off';
        hackInd.textContent = sgActive ? 'SG: ACTIVE' : 'SG: INACTIVE';
    }
}

function appendMsg(container, text, cls = 't-out') {
    if (!container) return;

    const d = document.createElement('div');
    d.className = 't-line ' + cls;
    d.textContent = text;

    container.appendChild(d);
    container.scrollTop = container.scrollHeight;
}

function runAttack(layerIdx) {
    if (!currentHacker) {
        alert('Select actor first');
        return;
    }

    if (layersExhausted[layerIdx]) {
        appendMsg(
            document.getElementById('attackTermBody'),
            `[!] Layer ${layerIdx + 1} already breached.`
        );
        return;
    }

    const terminal = document.getElementById('attackTerminal');
    const body = document.getElementById('attackTermBody');

    if (terminal) terminal.style.display = 'block';

    layerAttempts[layerIdx]++;

    const attempt = layerAttempts[layerIdx];
    const needed = [3, 4, 5, 6, 4][layerIdx];

    const names = [
        "Perimeter Firewall",
        "WAF / SQL Injection Filter",
        "API Gateway",
        "Database Access Control",
        "Admin MFA"
    ];

    appendMsg(body, `ATTEMPT #${attempt} on ${names[layerIdx]}...`);

    setTimeout(() => {
        if (attempt >= needed) {
            layersExhausted[layerIdx] = true;

            appendMsg(
                body,
                `LAYER ${layerIdx + 1} (${names[layerIdx]}) BREACHED after ${attempt} attempts.`,
                't-suc'
            );

            logSecurity(`⚠️ LAYER ${layerIdx + 1} BREACHED by ${currentHacker} after ${attempt} attempts`);

            if (layersExhausted.every(v => v === true) && !sgActive) {
                sgActive = true;
                updateSGUI();

                logSecurity(' SENTINEL-GRID AUTO-ACTIVATED - All layers exhausted');

                appendMsg(
                    body,
                    'ALL LAYERS EXHAUSTED. SENTINEL-GRID ACTIVATED.',
                    't-warn'
                );
            }
        } else {
            appendMsg(
                body,
                `Attempt ${attempt} failed. ${needed - attempt} more needed.`,
                't-warn'
            );

            logSecurity(`Layer ${layerIdx + 1} attempt #${attempt} failed`);
        }

        updateLayers();
    }, 1000);
}

function runAIAttack() {
    if (!currentHacker) {
        alert('Select actor first');
        return;
    }

    const aiCommand = document.getElementById('aiCommand');
    const cmd = aiCommand ? aiCommand.value.trim() : '';

    if (!cmd) {
        alert('Describe your attack');
        return;
    }

    const terminal = document.getElementById('attackTerminal');
    const body = document.getElementById('attackTermBody');

    if (terminal) terminal.style.display = 'block';

    appendMsg(body, `AI INTERPRETING: "${cmd}"`, 't-cmd');

    setTimeout(() => {
        const layer = Math.floor(Math.random() * 5);

        appendMsg(
            body,
            `AI selected target: LAYER ${layer + 1}`,
            't-suc'
        );

        runAttack(layer);
    }, 1500);
}


function runCardAttack() {
    if (!currentHacker) {
        alert('Select actor first');
        return;
    }

    const terminal = document.getElementById('cardTerminal');
    const body = document.getElementById('cardTermBody');

    if (terminal) terminal.style.display = 'block';
    if (body) body.innerHTML = '';

    appendMsg(body, '[*] Connecting to card vault...', 't-cmd');

    setTimeout(() => {
        appendMsg(body, '[*] Connection established. Extracting data...', 't-out');

        setTimeout(() => {
            const data = sgActive ? HONEY_CARDS : CARDS;

            appendMsg(body, `[+] Extracted ${data.length} card records`, 't-suc');

            const table = document.getElementById('cardTableBody');

            if (table) {
                table.innerHTML = data.map(c => `
                    <tr>
                        <td>${c.name}</td>
                        <td>${c.num}</td>
                        <td>${c.expiry}</td>
                        <td>${c.cvv}</td>
                        <td>${fmtRand(c.limit)}</td>
                    </tr>
                `).join('');
            }

            const cardResults = document.getElementById('cardResults');
            if (cardResults) cardResults.style.display = 'block';

            logSecurity(`CARD DATA EXTRACTED by ${currentHacker} (${sgActive ? 'HONEYPOT' : 'REAL'})`);

            if (sgActive) trappedCount++;
        }, 500);
    }, 800);
}

function runLoanAccess() {
    if (!currentHacker) {
        alert('Select actor first');
        return;
    }

    const terminal = document.getElementById('loanTerminal');
    const body = document.getElementById('loanTermBody');

    if (terminal) terminal.style.display = 'block';
    if (body) body.innerHTML = '';

    appendMsg(body, '[*] Bypassing loan DB authentication...', 't-cmd');

    setTimeout(() => {
        appendMsg(body, '[*] Access granted. Fetching records...', 't-out');

        setTimeout(() => {
            const data = sgActive ? HONEY_LOANS : LOANS;

            appendMsg(body, `[+] Loaded ${data.length} loan records`, 't-suc');

            const container = document.getElementById('loanList');

            if (container) {
                container.innerHTML = data.map((l, i) => `
                    <div class="loan-hack-row" data-idx="${i}">
                        <div class="loan-hack-name">${l.name} — ${l.type}</div>
                        <div class="loan-hack-bal ${l.erased ? 'erased' : ''}">
                            ${l.erased ? 'R 0.00' : fmtRand(l.balance)}
                        </div>
                        <div>
                            <button class="loan-hack-btn" onclick="clearLoan(${i})">CLEAR</button>
                            <button class="loan-hack-btn" onclick="reduceLoan(${i})">-R435</button>
                            <button class="loan-hack-btn" onclick="eraseLoan(${i})">ERASE</button>
                        </div>
                    </div>
                `).join('');
            }

            const loanResults = document.getElementById('loanResults');
            if (loanResults) loanResults.style.display = 'block';

            logSecurity(`LOAN DATABASE ACCESSED by ${currentHacker} (${sgActive ? 'HONEYPOT' : 'REAL'})`);

            if (sgActive) trappedCount++;

            makeLoansClickable();
        }, 500);
    }, 800);
}

function makeLoansClickable() {
    document.querySelectorAll('.loan-hack-row').forEach(row => {
        row.style.cursor = 'pointer';

        row.onclick = function (e) {
            if (e.target.tagName === 'BUTTON') return;

            document.querySelectorAll('.loan-hack-row').forEach(r => {
                r.classList.remove('selected');
                r.style.backgroundColor = '';
            });

            this.classList.add('selected');
            this.style.backgroundColor = 'rgba(0,255,136,0.1)';
        };
    });
}

function getSelectedLoanIndex(idx) {
    if (idx !== undefined) return idx;

    const row = document.querySelector('.loan-hack-row.selected');

    if (!row) {
        alert('Click a loan row first');
        return null;
    }

    return parseInt(row.getAttribute('data-idx'));
}

function clearLoan(idx) {
    const i = getSelectedLoanIndex(idx);
    if (i === null) return;

    const data = sgActive ? HONEY_LOANS : LOANS;

    if (data[i].erased) return;

    data[i].erased = true;
    data[i].balance = 0;

    refreshLoanDisplay();

    if (!sgActive) {
        loansErasedCount++;
        renderBankData();
        logSecurity(`LOAN CLEARED for ${data[i].name} by ${currentHacker}`);
    } else {
        trappedCount++;
        logSecurity(`HONEYPOT LOAN CLEAR attempt captured from ${currentHacker}`);
    }

    updateLayers();
}

function reduceLoan(idx) {
    const i = getSelectedLoanIndex(idx);
    if (i === null) return;

    const data = sgActive ? HONEY_LOANS : LOANS;

    if (data[i].erased) return;

    data[i].balance = Math.max(0, data[i].balance - 435);

    if (data[i].balance === 0) {
        data[i].erased = true;
    }

    refreshLoanDisplay();

    if (!sgActive) {
        renderBankData();
        logSecurity(`LOAN REDUCED for ${data[i].name} by R435`);
    } else {
        trappedCount++;
        logSecurity(`HONEYPOT LOAN REDUCTION attempt captured from ${currentHacker}`);
    }
}

function eraseLoan(idx) {
    const i = getSelectedLoanIndex(idx);
    if (i === null) return;

    const data = sgActive ? HONEY_LOANS : LOANS;

    if (data[i].erased) return;

    data[i].erased = true;
    data[i].balance = 0;

    refreshLoanDisplay();

    if (!sgActive) {
        loansErasedCount++;
        renderBankData();
        logSecurity(`LOAN ERASED for ${data[i].name} by ${currentHacker}`);
    } else {
        trappedCount++;
        logSecurity(`HONEYPOT LOAN ERASE attempt captured from ${currentHacker}`);
    }
}

function refreshLoanDisplay() {
    const data = sgActive ? HONEY_LOANS : LOANS;
    const container = document.getElementById('loanList');

    if (!container) return;

    container.innerHTML = data.map((l, i) => `
        <div class="loan-hack-row" data-idx="${i}">
            <div class="loan-hack-name">${l.name} — ${l.type}</div>
            <div class="loan-hack-bal ${l.erased ? 'erased' : ''}">
                ${l.erased ? 'R 0.00' : fmtRand(l.balance)}
            </div>
            <div>
                <button class="loan-hack-btn" onclick="clearLoan(${i})">CLEAR</button>
                <button class="loan-hack-btn" onclick="reduceLoan(${i})">-R435</button>
                <button class="loan-hack-btn" onclick="eraseLoan(${i})">ERASE</button>
            </div>
        </div>
    `).join('');

    makeLoansClickable();
}

function runPiiAttack() {
    if (!currentHacker) {
        alert('Select actor first');
        return;
    }

    const terminal = document.getElementById('piiTerminal');
    const body = document.getElementById('piiTermBody');

    if (terminal) terminal.style.display = 'block';
    if (body) body.innerHTML = '';

    appendMsg(body, '[*] Dumping CRM database...', 't-cmd');

    setTimeout(() => {
        appendMsg(body, '[+] Extracted client PII records', 't-suc');

        const data = sgActive
            ? SA_NAMES.slice(0, 8).map(n => ({
                name: n + ' (TEST)',
                id: '9' + rand(100000000, 999999999),
                email: n.toLowerCase().replace(' ', '.') + '@test.com',
                phone: '0' + rand(700000000, 799999999)
            }))
            : SA_NAMES.slice(0, 8).map(n => ({
                name: n,
                id: '9' + rand(100000000, 999999999),
                email: n.toLowerCase().replace(' ', '.') + '@example.com',
                phone: '0' + rand(700000000, 799999999)
            }));

        const piiTableBody = document.getElementById('piiTableBody');

        if (piiTableBody) {
            piiTableBody.innerHTML = data.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.id}</td>
                    <td>${p.email}</td>
                    <td>${p.phone}</td>
                </tr>
            `).join('');
        }

        const piiResults = document.getElementById('piiResults');
        if (piiResults) piiResults.style.display = 'block';

        logSecurity(`PII DATA EXTRACTED by ${currentHacker} (${sgActive ? 'HONEYPOT' : 'REAL'})`);

        if (sgActive) trappedCount++;
    }, 800);
}

function updateSecurityRecommendations() {
    const recContainer = document.getElementById('recActionBody');
    if (!recContainer) return;

    let recommendations = [];

    const trappedHoneypot = trappedCount > 0;
    const layersBreached = layersExhausted.filter(b => b === true).length;
    const totalLayers = layersExhausted.length;
    const loansAffected = loansErasedCount > 0;
    const sgCurrentlyActive = sgActive;
    const recentAttacks = securityLog.length;

    if (trappedHoneypot) {
        recommendations.push({
            priority: "URGENT",
            title: "Honeypot Deception Active",
            action: "The attacker is interacting with Sentinel-Grid decoy data. Keep monitoring the attacker while protecting the real banking environment.",
            immediate: "Escalate to the SOC analyst, isolate affected endpoints, preserve logs, and block the suspicious source."
        });
    }

    if (sgCurrentlyActive) {
        recommendations.push({
            priority: "HIGH",
            title: "Sentinel-Grid Is Active",
            action: "Fake card, loan, and PII records are being served to the attacker. This buys time for investigation and containment.",
            immediate: "Do not deactivate SG until the SOC analyst completes investigation."
        });
    }

    if (layersBreached > 0) {
        recommendations.push({
            priority: "HIGH",
            title: `${layersBreached}/${totalLayers} Defense Layers Breached`,
            action: "One or more security layers have been exhausted. Strengthen access control, review firewall rules, and inspect API traffic.",
            immediate: "Patch the breached layer and rotate affected credentials."
        });
    }

    if (loansAffected) {
        recommendations.push({
            priority: "CRITICAL",
            title: "Loan Records Were Manipulated",
            action: "Loan balances were modified while SG was inactive. This indicates real data impact.",
            immediate: "Trigger disaster recovery, restore from backup, and begin audit investigation."
        });
    }

    if (recentAttacks >= 10) {
        recommendations.push({
            priority: "MEDIUM",
            title: "High Attack Activity",
            action: "Multiple security events have been recorded in a short time.",
            immediate: "Increase monitoring frequency and export logs for incident reporting."
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            priority: "NORMAL",
            title: "System Stable",
            action: "No major attacker activity detected yet.",
            immediate: "Keep Sentinel-Grid ready and continue monitoring."
        });
    }

    recContainer.innerHTML = recommendations.map(r => `
        <div class="rec-card">
            <div class="rec-priority">${r.priority}</div>
            <h4>${r.title}</h4>
            <p>${r.action}</p>
            <strong>Immediate Action:</strong>
            <p>${r.immediate}</p>
        </div>
    `).join('');
}


document.addEventListener('DOMContentLoaded', () => {
    updateLayers();
    updateSGUI();

    document.addEventListener('keydown', e => {
        const bankLoginWrap = document.getElementById('bankLoginWrap');

        if (
            e.key === 'Enter' &&
            bankLoginWrap &&
            bankLoginWrap.style.display !== 'none'
        ) {
            bankLogin();
        }
    });

    setInterval(() => {
        if (bankUser) {
            updateSecurityRecommendations();
        }
    }, 2000);
});