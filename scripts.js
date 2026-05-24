// ======================================================
// SECTION 1: DATA ARRAYS, HELPERS & GLOBAL STATE
// ======================================================

// DATA ARRAYS
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

// HELPER FUNCTIONS
function rand(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function fmtRand(n) {
    return 'R ' + Number(n).toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// REAL DATA SIMULATION
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

// HONEYPOT DATA SIMULATION
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

// GLOBAL STATE
let sgActive = false;
let currentHacker = null;
let bankUser = null;
let securityLog = [];
let trappedCount = 0;
let loansErasedCount = 0;

let layerAttempts = [0, 0, 0, 0, 0];
let layersExhausted = [false, false, false, false, false];

// ======================================================
// SECTION 2: SECURITY LOGGING & DEFENSE LAYER UI
// ======================================================

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

// ======================================================
// SECTION 3: BANK AUTHENTICATION, NAVIGATION & DASHBOARD DATA
// ======================================================

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

// ======================================================
// SECTION 3: BANK AUTHENTICATION, NAVIGATION & DASHBOARD DATA
// ======================================================

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