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
