const SA_NAMES = [
    'Sipho Dlamini', 'Nomsa Khumalo', 'Thabo Nkosi', 'Zanele Mokoena', 'Lungelo Sithole',
    'Precious Mthembu', 'Kagiso Molefe', 'Ayanda Zulu', 'Lerato Khoza', 'Bongani Ndlovu',
    'Thandeka Cele', 'Sibusiso Mkhize'
];

const LOAN_TYPES = ['Home Loan', 'Vehicle Finance', 'Personal Loan', 'Business Loan'];

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function fmtRand(n) { return 'R ' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

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

// HONEYPOT DATA - (TEST) REMOVED - looks identical to real data
const HONEY_CARDS = SA_NAMES.map(n => ({
    name: n,
    num: '4' + rand(1000, 9999) + ' ' + rand(1000, 9999) + ' ' + rand(1000, 9999) + ' ' + rand(1000, 9999),
    expiry: rand(1, 12) + '/' + rand(26, 30),
    cvv: rand(100, 999),
    limit: rand(15000, 100000)
}));

const HONEY_LOANS = SA_NAMES.map((n, i) => ({
    name: n,
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
const layerNames = ["Perimeter Firewall", "WAF / SQL Injection Filter", "API Gateway", "Database Access Control", "Admin MFA"];
const attackTypes = ["Port Scan + SYN Flood", "SQL Injection + XSS", "JWT Token Brute Force", "Privilege Escalation", "MFA Fatigue Attack"];

function logSecurity(msg) {
    const t = new Date().toLocaleTimeString();
    securityLog.unshift({ time: t, msg: msg });
    const secLogBody = document.getElementById('secLogBody');
    if (secLogBody) secLogBody.innerHTML = securityLog.slice(0, 20).map(e => `<div class="sec-alert-row"><span class="sec-alert-time">${e.time}</span><span>${e.msg}</span></div>`).join('');
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
    
    c.innerHTML = `<div class="defense-layers-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">${layerNames.map((n, i) => `
        <div class="defense-layer-card ${layersExhausted[i] ? 'breached' : ''}" style="background: #e2e8f0; border-left: 3px solid ${layersExhausted[i] ? '#dc2626' : '#22c55e'}; padding: 8px; border-radius: 4px; text-align: center;">
            <div class="layer-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
                <div class="layer-name" style="font-weight: 600; font-size: 10px;">🛡️ LAYER ${i + 1}</div>
                <div class="layer-status ${layersExhausted[i] ? 'breached' : 'active'}" style="font-size: 8px; font-weight: 600; padding: 2px 6px; border-radius: 10px; background: ${layersExhausted[i] ? '#dc2626' : '#22c55e'}; color: white;">${layersExhausted[i] ? 'BREACHED' : 'ACTIVE'}</div>
                <div class="layer-status-dot ${layersExhausted[i] ? 'breached' : 'active'}" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${layersExhausted[i] ? '#dc2626' : '#22c55e'}; box-shadow: 0 0 2px ${layersExhausted[i] ? '#dc2626' : '#22c55e'};"></div>
            </div>
            <div class="layer-name" style="font-size: 9px; margin-bottom: 4px;">${n}</div>
            <div class="layer-attempt-type" style="font-size: 8px; color: #475569; margin-top: 4px; font-family: monospace;">🎯 ${layerAttempts[i]} | ${attackTypes[i]}</div>
        </div>
    `).join('')}</div>`;
}

function bankLogin() {
    bankUser = 'Admin';
    document.getElementById('bankLoginWrap').style.display = 'none';
    document.getElementById('bankDash').classList.add('visible');
    document.getElementById('sgToggleBtn').style.display = 'flex';
    document.getElementById('bankWho').textContent = 'System Admin';
    updateBankTime();
    setInterval(updateBankTime, 60000);
    renderBankData();
    updateLayers();
    logSecurity('✅ Bank administrator logged into dashboard');
}

function bankLogout() { location.reload(); }
function updateBankTime() { const bt = document.getElementById('bankTime'); if (bt) bt.textContent = new Date().toLocaleTimeString(); }

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
    if (accountsBody) accountsBody.innerHTML = SA_NAMES.slice(0, 10).map(n => `<tr><td style="font-family:monospace">PMP-${rand(1000, 9999)}</td><td>${n}</td><td>${fmtRand(rand(5000, 500000))}</td><td>Cheque</td><td><span class="bank-badge badge-active">Active</span></td>`).join('');
    if (cardsBody) cardsBody.innerHTML = CARDS.map(c => `<tr><td>${c.name}</td><td class="card-num" style="font-family:monospace">${c.num}</td><td style="font-family:monospace">${c.expiry}</td><td style="font-family:monospace">${c.cvv}</td><td style="font-family:monospace">${fmtRand(c.limit)}</td><td style="font-family:monospace">${fmtRand(rand(500, c.limit))}</td><td><span class="bank-badge badge-active">Active</span></td>`).join('');
    if (loansBody) loansBody.innerHTML = LOANS.map(l => `<tr><td>${l.name}</td><td>${l.type}</td><td>${fmtRand(l.originalAmount)}</td><td>${l.erased ? 'R 0.00' : fmtRand(l.balance)}</td><td>${fmtRand(rand(2000, 10000))}</td><td>${l.erased ? 'ERASED' : 'Current'}</td>`).join('');
    if (totalLoanDisplay) totalLoanDisplay.textContent = fmtRand(LOANS.reduce((a, b) => a + (b.erased ? 0 : b.balance), 0));
}

function selectActor(code) {
    document.querySelectorAll('.hack-actor-btn').forEach(b => b.classList.remove('selected'));
    const actorBtn = document.getElementById('actor-' + code);
    if (actorBtn) actorBtn.classList.add('selected');
    currentHacker = code;
}

function hackLogin() {
    if (!currentHacker) { const he = document.getElementById('hackErr'); if (he) he.textContent = 'Select actor'; return; }
    document.getElementById('hackLoginWrap').style.display = 'none';
    document.getElementById('hackDash').classList.add('visible');
    document.getElementById('hackWhoLabel').textContent = currentHacker;
    document.getElementById('hackTopStatus').textContent = 'LIVE';
    updateSGUI();
    logSecurity(`⚠️ Threat actor ${currentHacker} entered hacker console`);
}

function hackLogout() { location.reload(); }
function hackTab(name, btn) {
    document.querySelectorAll('.hack-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.hack-view').forEach(v => v.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const view = document.getElementById('hv-' + name);
    if (view) view.classList.add('active');
}

function handleSGButton() { sgActive ? deactivateSG() : openSgModal(); }
function openSgModal() { const sgm = document.getElementById('sgModal'); if (sgm) sgm.classList.add('open'); }
function closeSgModal() {
    const sgm = document.getElementById('sgModal'); if (sgm) sgm.classList.remove('open');
    ['sgC1', 'sgC2', 'sgC3'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const sgErr = document.getElementById('sgErr'); if (sgErr) sgErr.textContent = '';
}

function activateSG() {
    const vals = [document.getElementById('sgC1')?.value.trim(), document.getElementById('sgC2')?.value.trim(), document.getElementById('sgC3')?.value.trim()];
    const validCodes = ['SG-ALPHA-01', 'SG-BRAVO-02', 'SG-DELTA-03'];
    const matched = vals.filter(v => validCodes.includes(v));
    if (matched.length >= 2) { sgActive = true; closeSgModal(); updateSGUI(); logSecurity('🔒 SENTINEL-GRID ACTIVATED - Honeypot data active'); }
    else { const sgErr = document.getElementById('sgErr'); if (sgErr) sgErr.textContent = 'Invalid codes'; }
}

function deactivateSG() { sgActive = false; updateSGUI(); logSecurity('⚠️ SENTINEL-GRID DEACTIVATED - Real data exposed'); }

function updateSGUI() {
    const btn = document.getElementById('sgToggleBtn');
    const hackInd = document.getElementById('hackSgIndicator');
    if (btn) { btn.className = sgActive ? 'sg-pill on' : 'sg-pill off'; if (btn.children[1]) btn.children[1].innerText = sgActive ? 'SG ACTIVE' : 'SG OFF'; }
    if (hackInd) { hackInd.className = sgActive ? 'hack-sg-indicator on' : 'hack-sg-indicator off'; hackInd.textContent = sgActive ? 'SG: ACTIVE' : 'SG: INACTIVE'; }
}

function appendMsg(container, text, cls = 't-out') { if (!container) return; const d = document.createElement('div'); d.className = 't-line ' + cls; d.textContent = text; container.appendChild(d); container.scrollTop = container.scrollHeight; }

function runAttack(layerIdx) {
    if (!currentHacker) { alert('Select actor first'); return; }
    if (sgActive) {
        const terminal = document.getElementById('attackTerminal'); const body = document.getElementById('attackTermBody');
        if (terminal) terminal.style.display = 'block';
        if (body) appendMsg(body, `[!] System protected. Access denied.`, 't-err');
        return;
    }
    if (layersExhausted[layerIdx]) {
        const terminal = document.getElementById('attackTerminal'); const body = document.getElementById('attackTermBody');
        if (terminal) terminal.style.display = 'block';
        if (body) appendMsg(body, `[!] Layer already compromised.`, 't-err');
        return;
    }
    const breachedCount = layersExhausted.filter(v => v === true).length;
    if (breachedCount === 4 && layerIdx !== 4) {
        const terminal = document.getElementById('attackTerminal'); const body = document.getElementById('attackTermBody');
        if (terminal) terminal.style.display = 'block';
        if (body) appendMsg(body, `[!] Cannot breach - only Admin MFA layer remains.`, 't-err');
        return;
    }
    const terminal = document.getElementById('attackTerminal'); const body = document.getElementById('attackTermBody');
    if (terminal) terminal.style.display = 'block';
    layerAttempts[layerIdx]++;
    const attempt = layerAttempts[layerIdx];
    const needed = [3, 4, 5, 6, 4][layerIdx];
    appendMsg(body, `[${layerNames[layerIdx]}] Brute force attempt ${attempt}...`, 't-cmd');
    setTimeout(() => {
        if (attempt >= needed) {
            layersExhausted[layerIdx] = true;
            appendMsg(body, `[+] ${layerNames[layerIdx]} - Breach successful.`, 't-suc');
            logSecurity(`🔴 LAYER ${layerIdx + 1} BREACHED by ${currentHacker} after ${attempt} brute force attempts`);
            if (layersExhausted.every(v => v === true) && !sgActive) {
                sgActive = true;
                updateSGUI();
                logSecurity('🔒 SENTINEL-GRID ACTIVATED - All 5 layers breached. Honeypot deployed.');
                appendMsg(body, '[!] CRITICAL: All layers breached. Sentinel-Grid activated.', 't-warn');
            }
        } else {
            appendMsg(body, `[${layerNames[layerIdx]}] Brute force attempt ${attempt} failed.`, 't-err');
            logSecurity(`Layer ${layerIdx + 1} brute force attempt #${attempt} failed`);
        }
        updateLayers();
    }, 800);
}

function runAIAttack() {
    if (!currentHacker) { alert('Select actor first'); return; }
    if (sgActive) {
        const terminal = document.getElementById('attackTerminal'); const body = document.getElementById('attackTermBody');
        if (terminal) terminal.style.display = 'block';
        if (body) appendMsg(body, `[!] AI attack blocked - System protected.`, 't-err');
        return;
    }
    const cmd = document.getElementById('aiCommand')?.value.trim() || '';
    if (!cmd) { alert('Describe your attack'); return; }
    const terminal = document.getElementById('attackTerminal'); const body = document.getElementById('attackTermBody');
    if (terminal) terminal.style.display = 'block';
    appendMsg(body, `🤖 AI: "${cmd}"`, 't-cmd');
    setTimeout(() => {
        let targetLayer = layersExhausted.findIndex(v => v === false);
        if (targetLayer === -1) targetLayer = 4;
        appendMsg(body, `🤖 AI targeting ${layerNames[targetLayer]} with brute force...`, 't-suc');
        runAttack(targetLayer);
    }, 1200);
}

function runCardAttack() {
    if (!currentHacker) { alert('Select actor first'); return; }
    const terminal = document.getElementById('cardTerminal'); const body = document.getElementById('cardTermBody');
    if (terminal) terminal.style.display = 'block';
    if (body) body.innerHTML = '';
    appendMsg(body, '[*] Connecting to card vault...', 't-cmd');
    setTimeout(() => {
        appendMsg(body, '[*] Connection established. Extracting data...', 't-out');
        setTimeout(() => {
            const data = sgActive ? HONEY_CARDS : CARDS;
            appendMsg(body, `[+] Extracted ${data.length} card records`, 't-suc');
            const table = document.getElementById('cardTableBody');
            if (table) table.innerHTML = data.map(c => `<tr><td style="color:#a0ffcc">${c.name}</td><td style="font-family:monospace">${c.num}</td><td style="font-family:monospace">${c.expiry}</td><td style="font-family:monospace">${c.cvv}</td><td style="font-family:monospace">${fmtRand(c.limit)}</td>`).join('');
            const cardResults = document.getElementById('cardResults');
            if (cardResults) cardResults.style.display = 'block';
            logSecurity(`📇 CARD DATA EXTRACTED by ${currentHacker} (${sgActive ? 'HONEYPOT' : 'REAL'})`);
            if (sgActive) trappedCount++;
        }, 500);
    }, 800);
}

function runLoanAccess() {
    if (!currentHacker) { alert('Select actor first'); return; }
    const terminal = document.getElementById('loanTerminal'); const body = document.getElementById('loanTermBody');
    if (terminal) terminal.style.display = 'block';
    if (body) body.innerHTML = '';
    appendMsg(body, '[*] Bypassing loan DB authentication...', 't-cmd');
    setTimeout(() => {
        appendMsg(body, '[*] Access granted. Fetching records...', 't-out');
        setTimeout(() => {
            const data = sgActive ? HONEY_LOANS : LOANS;
            appendMsg(body, `[+] Loaded ${data.length} loan records`, 't-suc');
            const container = document.getElementById('loanList');
            if (container) container.innerHTML = data.map((l, i) => `
                <div class="loan-hack-row" data-idx="${i}">
                    <div class="loan-hack-name">${l.name} — ${l.type}</div>
                    <div class="loan-hack-bal ${l.erased ? 'erased' : ''}">${l.erased ? 'R 0.00' : fmtRand(l.balance)}</div>
                    <div><button class="loan-hack-btn" onclick="clearLoan(${i})">CLEAR</button><button class="loan-hack-btn" onclick="reduceLoan(${i})">-R435</button><button class="loan-hack-btn" onclick="eraseLoan(${i})">ERASE</button></div>
                </div>
            `).join('');
            const loanResults = document.getElementById('loanResults');
            if (loanResults) loanResults.style.display = 'block';
            logSecurity(`🏦 LOAN DATABASE ACCESSED by ${currentHacker} (${sgActive ? 'HONEYPOT' : 'REAL'})`);
            if (sgActive) trappedCount++;
            makeLoansClickable();
        }, 500);
    }, 800);
}

function makeLoansClickable() {
    document.querySelectorAll('.loan-hack-row').forEach(row => {
        row.style.cursor = 'pointer';
        row.onclick = function(e) {
            if (e.target.tagName === 'BUTTON') return;
            document.querySelectorAll('.loan-hack-row').forEach(r => { r.classList.remove('selected'); r.style.backgroundColor = ''; });
            this.classList.add('selected');
            this.style.backgroundColor = 'rgba(0,255,136,0.1)';
        };
    });
}

function getSelectedLoanIndex(idx) {
    if (idx !== undefined) return idx;
    const row = document.querySelector('.loan-hack-row.selected');
    if (!row) { alert('Click a loan row first'); return null; }
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
    if (!sgActive) { loansErasedCount++; renderBankData(); logSecurity(`💰 LOAN CLEARED for ${data[i].name} by ${currentHacker}`); }
    else { trappedCount++; logSecurity(`🍯 HONEYPOT LOAN CLEAR attempt captured from ${currentHacker}`); }
    updateLayers();
}

function reduceLoan(idx) {
    const i = getSelectedLoanIndex(idx);
    if (i === null) return;
    const data = sgActive ? HONEY_LOANS : LOANS;
    if (data[i].erased) return;
    data[i].balance = Math.max(0, data[i].balance - 435);
    if (data[i].balance === 0) data[i].erased = true;
    refreshLoanDisplay();
    if (!sgActive) { renderBankData(); logSecurity(`💰 LOAN REDUCED for ${data[i].name} by R435`); }
    else { trappedCount++; logSecurity(`🍯 HONEYPOT LOAN REDUCTION attempt captured from ${currentHacker}`); }
}

function eraseLoan(idx) {
    const i = getSelectedLoanIndex(idx);
    if (i === null) return;
    const data = sgActive ? HONEY_LOANS : LOANS;
    if (data[i].erased) return;
    data[i].erased = true;
    data[i].balance = 0;
    refreshLoanDisplay();
    if (!sgActive) { loansErasedCount++; renderBankData(); logSecurity(`❌ LOAN ERASED for ${data[i].name} by ${currentHacker}`); }
    else { trappedCount++; logSecurity(`🍯 HONEYPOT LOAN ERASE attempt captured from ${currentHacker}`); }
}

function refreshLoanDisplay() {
    const data = sgActive ? HONEY_LOANS : LOANS;
    const container = document.getElementById('loanList');
    if (!container) return;
    container.innerHTML = data.map((l, i) => `
        <div class="loan-hack-row" data-idx="${i}">
            <div class="loan-hack-name">${l.name} — ${l.type}</div>
            <div class="loan-hack-bal ${l.erased ? 'erased' : ''}">${l.erased ? 'R 0.00' : fmtRand(l.balance)}</div>
            <div><button class="loan-hack-btn" onclick="clearLoan(${i})">CLEAR</button><button class="loan-hack-btn" onclick="reduceLoan(${i})">-R435</button><button class="loan-hack-btn" onclick="eraseLoan(${i})">ERASE</button></div>
        </div>
    `).join('');
    makeLoansClickable();
}

function runPiiAttack() {
    if (!currentHacker) { alert('Select actor first'); return; }
    const terminal = document.getElementById('piiTerminal'); const body = document.getElementById('piiTermBody');
    if (terminal) terminal.style.display = 'block';
    if (body) body.innerHTML = '';
    appendMsg(body, '[*] Dumping CRM database...', 't-cmd');
    setTimeout(() => {
        appendMsg(body, '[+] Extracted client PII records', 't-suc');
        // (TEST) REMOVED - honeypot PII now shows clean names
        const data = sgActive ? SA_NAMES.slice(0, 8).map(n => ({ name: n, id: '9' + rand(100000000, 999999999), email: n.toLowerCase().replace(' ', '.') + '@test.com', phone: '0' + rand(700000000, 799999999) })) : SA_NAMES.slice(0, 8).map(n => ({ name: n, id: '9' + rand(100000000, 999999999), email: n.toLowerCase().replace(' ', '.') + '@example.com', phone: '0' + rand(700000000, 799999999) }));
        const piiTableBody = document.getElementById('piiTableBody');
        if (piiTableBody) piiTableBody.innerHTML = data.map(p => `<tr><td style="color:#a0ffcc">${p.name}</td><td style="font-family:monospace">${p.id}</td><td style="font-family:monospace">${p.email}</td><td style="font-family:monospace">${p.phone}</td>`).join('');
        const piiResults = document.getElementById('piiResults');
        if (piiResults) piiResults.style.display = 'block';
        logSecurity(`📁 PII DATA EXTRACTED by ${currentHacker} (${sgActive ? 'HONEYPOT' : 'REAL'})`);
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
    if (trappedHoneypot) recommendations.push({ priority: "URGENT", title: "Honeypot Deception Active", action: "The attacker is interacting with Sentinel-Grid decoy data. Keep monitoring the attacker while protecting the real banking environment.", immediate: "Escalate to the SOC analyst, isolate affected endpoints, preserve logs, and block the suspicious source." });
    if (sgCurrentlyActive) recommendations.push({ priority: "HIGH", title: "Sentinel-Grid Is Active", action: "Fake card, loan, and PII records are being served to the attacker. This buys time for investigation and containment.", immediate: "Do not deactivate SG until the SOC analyst completes investigation." });
    if (layersBreached > 0) recommendations.push({ priority: "HIGH", title: `${layersBreached}/${totalLayers} Defense Layers Breached`, action: "One or more security layers have been exhausted. Strengthen access control, review firewall rules, and inspect API traffic.", immediate: "Patch the breached layer and rotate affected credentials." });
    if (loansAffected) recommendations.push({ priority: "CRITICAL", title: "Loan Records Were Manipulated", action: "Loan balances were modified while SG was inactive. This indicates real data impact.", immediate: "Trigger disaster recovery, restore from backup, and begin audit investigation." });
    if (recentAttacks >= 10) recommendations.push({ priority: "MEDIUM", title: "High Attack Activity", action: "Multiple security events have been recorded in a short time.", immediate: "Increase monitoring frequency and export logs for incident reporting." });
    if (recommendations.length === 0) recommendations.push({ priority: "NORMAL", title: "System Stable", action: "No major attacker activity detected yet.", immediate: "Keep Sentinel-Grid ready and continue monitoring." });
    recContainer.innerHTML = recommendations.map(r => `<div class="rec-card" style="background: white; border: 1px solid #e2e8f0; padding: 10px; margin-bottom: 8px; border-radius: 4px;"><div style="font-size: 9px; font-weight: 700; color: ${r.priority === 'CRITICAL' ? '#dc2626' : r.priority === 'URGENT' ? '#ea580c' : '#16a34a'};">${r.priority}</div><h4 style="font-size: 11px; margin: 4px 0;">${r.title}</h4><p style="font-size: 10px; margin: 4px 0;">${r.action}</p><strong style="font-size: 9px;">Immediate Action:</strong><p style="font-size: 9px; margin: 2px 0;">${r.immediate}</p></div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    updateLayers();
    updateSGUI();
    document.addEventListener('keydown', e => { const bankLoginWrap = document.getElementById('bankLoginWrap'); if (e.key === 'Enter' && bankLoginWrap && bankLoginWrap.style.display !== 'none') bankLogin(); });
    setInterval(() => { if (bankUser) updateSecurityRecommendations(); }, 2000);
});