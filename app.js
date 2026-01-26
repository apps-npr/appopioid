let drugsData = [];
let currentRegimen = null;
let currentStatus = 'naive';

// Assessment Data Config
const assessData = {
    nips: {
        title: "NIPS Score",
        items: [
            { q: "สีหน้า (Facial Expression)", opts: [{t:"ผ่อนคลาย (Relaxed)", v:0}, {t:"แสยะ/ขมวดคิ้ว (Grimace)", v:1}] },
            { q: "การร้องไห้ (Cry)", opts: [{t:"ไม่ร้อง (No Cry)", v:0}, {t:"ร้องคราง (Whimper)", v:1}, {t:"ร้องเสียงดัง (Vigorous)", v:2}] },
            { q: "การหายใจ (Breathing)", opts: [{t:"สม่ำเสมอ (Relaxed)", v:0}, {t:"ไม่สม่ำเสมอ/กลั้น (Change)", v:1}] },
            { q: "แขน (Arms)", opts: [{t:"วางสบาย (Relaxed)", v:0}, {t:"งอ/เกร็ง (Flexed/Ext)", v:1}] },
            { q: "ขา (Legs)", opts: [{t:"วางสบาย (Relaxed)", v:0}, {t:"งอ/เกร็ง (Flexed/Ext)", v:1}] },
            { q: "ระดับการตื่น (Alertness)", opts: [{t:"หลับ/สงบ (Sleeping/Calm)", v:0}, {t:"กระสับกระส่าย (Uncomfortable)", v:1}] }
        ],
        threshold: 4, msgSafe: "ปวดน้อย (No/Mild Pain)", msgPain: "ปวดปานกลาง-มาก (Pain >= 4) -> พิจารณาให้ยาแก้ปวด"
    },
    cheops: {
        title: "CHEOPS Score",
        items: [
            { q: "การร้องไห้ (Cry)", opts: [{t:"ไม่ร้อง (No cry)", v:1}, {t:"ร้องคราง (Moaning)", v:2}, {t:"กรีดร้อง (Scream)", v:3}] },
            { q: "สีหน้า (Facial)", opts: [{t:"ยิ้ม (Smiling)", v:0}, {t:"เฉยๆ (Composed)", v:1}, {t:"เบ้หน้า (Grimace)", v:2}] },
            { q: "การส่งเสียง (Verbal)", opts: [{t:"พูดเรื่องดี (Positive)", v:0}, {t:"ไม่พูด/บ่นเรื่องอื่น (None/Other)", v:1}, {t:"บ่นปวด (Complaint)", v:2}] },
            { q: "ลำตัว (Torso)", opts: [{t:"เฉยๆ (Neutral)", v:1}, {t:"เกร็ง/บิดตัว (Tense/Shifting)", v:2}, {t:"ถูกมัด (Restrained)", v:2}] },
            { q: "การสัมผัส (Touch)", opts: [{t:"ไม่แตะแผล (Not touching)", v:1}, {t:"เอื้อมแตะแผล (Reach/Touch)", v:2}, {t:"ถูกมัด (Restrained)", v:2}] },
            { q: "ขา (Legs)", opts: [{t:"วางท่าสบาย (Neutral)", v:1}, {t:"ดิ้น/เตะ (Kicking)", v:2}, {t:"ถูกมัด (Restrained)", v:2}] }
        ],
        threshold: 8, msgSafe: "ปวดน้อย (No/Mild Pain)", msgPain: "ปวดปานกลาง-มาก (Pain >= 8) -> พิจารณาให้ยาแก้ปวด"
    },
    bps: {
        title: "BPS Score (ผู้ป่วยวิกฤต/ใส่ท่อ)",
        items: [
            { q: "สีหน้า (Facial Expression)", opts: [{t:"ผ่อนคลาย (Relaxed)", v:1}, {t:"ขมวดคิ้วเล็กน้อย (Partially tightened)", v:2}, {t:"ขมวดคิ้วมาก (Fully tightened)", v:3}, {t:"หน้าแสยะ (Grimacing)", v:4}] },
            { q: "การเคลื่อนไหวแขน (Upper Limbs)", opts: [{t:"ไม่ขยับ (No movement)", v:1}, {t:"งอแขนเล็กน้อย (Partially bent)", v:2}, {t:"งอแขนมาก/กำมือ (Fully bent)", v:3}, {t:"เกร็งตลอดเวลา (Permanently retracted)", v:4}] },
            { q: "การต้านเครื่องช่วยหายใจ (Compliance)", opts: [{t:"ไม่ต้าน (Tolerating)", v:1}, {t:"ไอแต่ยังทนได้ (Coughing)", v:2}, {t:"ต้านเครื่อง (Fighting)", v:3}, {t:"ไม่รับเครื่องเลย (Unable to control)", v:4}] }
        ],
        threshold: 6, msgSafe: "ควบคุมความปวดได้ดี (Acceptable)", msgPain: "มีความปวด (Significant Pain) -> พิจารณาให้ยาแก้ปวด"
    },
    cpot: {
        title: "CPOT Score (ผู้ป่วยวิกฤต)",
        items: [
            { q: "สีหน้า (Facial)", opts: [{t:"ผ่อนคลาย (Relaxed)", v:0}, {t:"ตึงเครียด (Tense)", v:1}, {t:"หน้าแสยะ (Grimacing)", v:2}] },
            { q: "การเคลื่อนไหว (Body Movement)", opts: [{t:"ปกติ (Absence)", v:0}, {t:"ปกป้องตนเอง (Protection)", v:1}, {t:"กระสับกระส่าย (Restlessness)", v:2}] },
            { q: "การต้านเครื่อง/การส่งเสียง (Ventilator/Vocalization)", opts: [{t:"ไม่ต้าน/ปกติ (Tolerating)", v:0}, {t:"ไอ/คราง (Coughing/Moaning)", v:1}, {t:"ต้านเครื่อง/ร้องไห้ (Fighting/Crying)", v:2}] },
            { q: "ความตึงตัวกล้ามเนื้อ (Muscle Tension)", opts: [{t:"หย่อนตัว (Relaxed)", v:0}, {t:"ตึงเกร็ง (Tense/Rigid)", v:1}, {t:"เกร็งมาก (Very Tense)", v:2}] }
        ],
        threshold: 3, msgSafe: "ปวดน้อย/ไม่มี (Pain Controlled)", msgPain: "มีความปวด (Pain Present) -> พิจารณาให้ยาแก้ปวด"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('drugs.json')
        .then(response => response.json())
        .then(data => { drugsData = data; renderDrugList(data); })
        .catch(err => console.error('Error loading drugs:', err));
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// --- Tab 1: Profile ---
function renderDrugList(data) {
    const container = document.getElementById('drugList');
    container.innerHTML = '';
    data.forEach(drug => {
        const card = document.createElement('div');
        card.className = 'drug-card';
        
        let tagClass = 'feed'; let tagText = 'Feed ได้';
        if (drug.form === 'patch' || (drug.note && drug.note.includes('แผ่นแปะ'))) { 
            tagClass = 'patch'; tagText = drug.note || 'แผ่นแปะ'; 
        } else if (drug.form === 'amp' || (drug.note && drug.note.includes('ยาฉีด'))) {
            tagClass = 'patch'; tagText = 'ยาฉีด'; // Re-use patch style for injection
        } else if (!drug.can_feed) { 
            tagClass = 'nofeed'; tagText = drug.note || 'ห้ามบด'; 
        } else if (drug.note) {
            tagText = drug.note;
        }

        card.innerHTML = `
            <img src="${drug.image}" alt="${drug.name}">
            <h4>${drug.name}</h4>
            <p>${drug.strength} ${drug.unit}</p>
            <p style="font-size:0.75rem; color:#666">
               Onset: ${drug.onset}<br>
               Dur: ${drug.duration}
            </p>
            <span class="tag ${tagClass}">
                ${tagText}
            </span>
        `;
        container.appendChild(card);
    });
}

function searchDrug() {
    const term = document.getElementById('drugSearch').value.toLowerCase();
    const filtered = drugsData.filter(d => d.name.toLowerCase().includes(term));
    renderDrugList(filtered);
}

// --- Tab 2: Assessment (Modal Logic) ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const type = modalId.split('-')[0];
    const data = assessData[type];
    
    const formDiv = document.getElementById(`${type}-form`);
    let html = '';
    data.items.forEach((item, idx) => {
        html += `<div class="assess-item"><h5>${item.q}</h5>`;
        item.opts.forEach(opt => {
            html += `<label class="assess-opt"><input type="radio" name="${type}_q${idx}" value="${opt.v}" onchange="calcAssess('${type}')"> ${opt.t}</label>`;
        });
        html += `</div>`;
    });
    formDiv.innerHTML = html;
    document.getElementById(`${type}-result`).style.display = 'none';
    modal.style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function calcAssess(type) {
    const data = assessData[type];
    let total = 0;
    let allChecked = true;

    for(let i=0; i<data.items.length; i++) {
        const radios = document.getElementsByName(`${type}_q${i}`);
        let val = null;
        for(let r of radios) {
            if(r.checked) val = parseInt(r.value);
        }
        if(val === null) {
            allChecked = false;
        } else {
            total += val;
        }
    }

    if(allChecked) {
        const resDiv = document.getElementById(`${type}-result`);
        const isPain = total >= data.threshold;
        resDiv.style.display = 'block';
        resDiv.className = 'assess-result ' + (isPain ? 'result-pain' : 'result-safe');
        resDiv.innerHTML = `คะแนนรวม: ${total} <br> ${isPain ? data.msgPain : data.msgSafe}`;
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// --- Tab 3: Converter ---
function calculateConverter() {
    const drug = document.getElementById('conv-drug-select').value;
    const dose = parseFloat(document.getElementById('conv-dose').value) || 0;
    const safetyReduce = document.getElementById('conv-reduce').checked;
    
    let ome = 0;
    // Updated Conversion Factors
    switch (drug) {
        // Common
        case 'tramadol_po': ome = dose * 0.2; break; 
        case 'codeine_po': ome = dose * 0.15; break; 
        case 'morphine_po': ome = dose * 1; break;
        case 'morphine_inj': ome = dose * 3; break; 
        case 'hydromorphone_po': ome = dose * 5; break; 
        case 'oxycodone': ome = dose * 1.5; break; 
        case 'fentanyl_patch': ome = dose * 2.4; break; 

        // Others
        case 'tramadol_inj': ome = (dose / 100) * 30; break; 
        case 'codeine_inj': ome = (dose / 120) * 30; break;
        case 'fentanyl_inj': ome = (dose * 1000 / 100) * 30; break; 
        case 'buprenorphine_inj': ome = (dose / 0.3) * 30; break; 
        case 'methadone': 
            if(dose <= 20) ome = dose * 4;
            else if(dose <= 40) ome = dose * 8;
            else if(dose <= 60) ome = dose * 10;
            else ome = dose * 12;
            break;
        case 'pethidine_inj': ome = dose * 0.1 * 3; break; 
        case 'levorphanol': ome = dose * 11; break;
        case 'tapentadol': ome = dose * 0.4; break;
    }

    if (safetyReduce) {
        ome = ome * 0.7; 
    }

    const mo_iv = (ome / 3).toFixed(1);
    let fen_patch = "N/A";
    if(ome < 45) fen_patch = "12 mcg/hr (start low)";
    else if(ome < 135) fen_patch = "25 mcg/hr";
    else if(ome < 225) fen_patch = "50 mcg/hr";
    else if(ome < 315) fen_patch = "75 mcg/hr";
    else fen_patch = "100 mcg/hr";

    const resultBox = document.getElementById('conv-result');
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `
        <p style="font-size:1.1rem; color:#2d3436;"><strong>Oral Morphine Eq (OME):</strong> ${ome.toFixed(1)} mg/day</p>
        ${safetyReduce ? '<span class="badge danger" style="font-size:0.7rem">Reduced 30% for safety</span>' : ''}
        <hr>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div><strong>Morphine Inj:</strong><br>${mo_iv} mg/day</div>
            <div><strong>Fentanyl Patch:</strong><br>${fen_patch}</div>
            <div><strong>Oxycodone:</strong><br>${(ome / 1.5).toFixed(1)} mg</div>
            <div><strong>Hydromorphone:</strong><br>${(ome / 5).toFixed(1)} mg</div>
        </div>
    `;
}

// === NEW: Enhanced Management Logic (Combinations) ===

function getCombinations(target, strengths, maxItems = 3) {
    // Function to find drug combinations
    let results = [];
    
    function findCombo(currentCombo, currentSum) {
        // Tolerance +- 15%
        if (currentSum >= target * 0.85 && currentSum <= target * 1.15) {
            results.push([...currentCombo]);
            return;
        }
        if (currentSum > target * 1.15 || currentCombo.length >= maxItems) return;

        for (let s of strengths) {
            // Optimization: Only add if <= last added (to avoid dupes like 10+30 vs 30+10)
            if (currentCombo.length > 0 && s > currentCombo[currentCombo.length-1]) continue;
            findCombo([...currentCombo, s], currentSum + s);
        }
    }
    
    // Sort strengths descending
    strengths.sort((a,b) => b - a);
    findCombo([], 0);
    
    // Sort results by proximity to target
    results.sort((a,b) => {
        const sumA = a.reduce((x,y)=>x+y,0);
        const sumB = b.reduce((x,y)=>x+y,0);
        return Math.abs(target - sumA) - Math.abs(target - sumB);
    });

    // Deduplicate and limit
    const uniqueResults = [];
    const seen = new Set();
    for (let res of results) {
        const key = res.sort((a,b)=>b-a).join('+');
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(res);
        }
    }
    return uniqueResults.slice(0, 4); // Top 4 options
}

function calculateManagement() {
    const isManual = document.getElementById('manual-mode-toggle').checked;
    const isFeed = document.getElementById('is-feed').checked;
    const isRenal = document.getElementById('renal-toggle').checked;
    const eGFR = parseFloat(document.getElementById('mg-egfr').value) || 100;
    
    // 1. Determine Target OME
    let targetOME = 0;
    let adjustInfo = "";

    if (isManual) {
        targetOME = parseFloat(document.getElementById('manual-ome-input').value) || 0;
        adjustInfo = "Manual Input";
        if (targetOME <= 0) { alert("กรุณาระบุ OME"); return; }
    } else {
        const painScore = parseInt(document.getElementById('mg-pain').value);
        const currentStatus = document.getElementById('btn-naive').classList.contains('active') ? 'naive' : 'user';
        
        // Show Step 1/2 cards
        const nonOpioidCard = document.getElementById('non-opioid-card');
        const weakOpioidCard = document.getElementById('weak-opioid-card');
        const opioidCard = document.getElementById('opioid-regimen-card');
        document.getElementById('mg-result').classList.remove('hidden');
        nonOpioidCard.classList.add('hidden'); weakOpioidCard.classList.add('hidden'); opioidCard.classList.add('hidden');

        if (painScore <= 3 && currentStatus === 'naive') { nonOpioidCard.classList.remove('hidden'); return; }
        if (painScore >= 4 && painScore <= 6 && currentStatus === 'naive') { weakOpioidCard.classList.remove('hidden'); return; }
        
        opioidCard.classList.remove('hidden');

        if (currentStatus === 'naive') {
            targetOME = 20; adjustInfo = "Naive Start";
        } else {
            const prevDrug = document.getElementById('mg-prev-drug').value;
            const prevDose = parseFloat(document.getElementById('mg-prev-dose').value) || 0;
            let baseOME = (prevDrug === 'codeine' || prevDrug === 'tramadol') ? prevDose * 0.15 : prevDose;
            let increasePct = (painScore >= 7) ? 50 : 30;
            targetOME = baseOME * (1 + (increasePct/100));
            adjustInfo = `Adjusted +${increasePct}%`;
        }
    }

    // 2. Renal Adjustment
    let renalWarn = "";
    let renalFactor = 1.0;
    if (isRenal) {
        if (eGFR >= 10 && eGFR <= 50) { renalFactor = 0.75; renalWarn = "Renal Stage 3: Reduce 25%"; }
        else if (eGFR < 10) { renalFactor = 0.5; renalWarn = "Renal Stage 4-5: Reduce 50%"; }
    }
    const safeOME = targetOME * renalFactor;

    // 3. Generate Options
    let optionsHTML = "";
    
    // --- Kapanol (OD) Options ---
    const kapStrengths = [100, 50, 20, 10]; // Added 10mg
    const kapCombos = getCombinations(safeOME, kapStrengths);
    
    kapCombos.forEach(combo => {
        const counts = {};
        combo.forEach(x => counts[x] = (counts[x] || 0) + 1);
        const regimenText = Object.keys(counts).sort((a,b)=>b-a).map(k => `Kapanol ${k} mg x ${counts[k]}`).join(" + ") + " OD";
        const total = combo.reduce((a,b)=>a+b, 0);
        optionsHTML += createOptionCard('Kapanol', regimenText, `${total} mg/day`, renalFactor < 1);
    });

    // --- MST (BID) Options ---
    if (!isFeed) {
        const mstStrengths = [200, 100, 60, 30, 10]; // Added 200mg
        const targetBID = safeOME / 2;
        const mstCombos = getCombinations(targetBID, mstStrengths);

        mstCombos.forEach(combo => {
            const counts = {};
            combo.forEach(x => counts[x] = (counts[x] || 0) + 1);
            const regimenText = Object.keys(counts).sort((a,b)=>b-a).map(k => `MST ${k} mg x ${counts[k]}`).join(" + ") + " (BID)";
            const total = combo.reduce((a,b)=>a+b, 0) * 2;
            optionsHTML += createOptionCard('MST', regimenText, `${total} mg/day`, renalFactor < 1);
        });
    }

    // --- Fentanyl Options ---
    const fenStrengths = [100, 75, 50, 25, 12]; // Added 75, 100
    const targetFen = safeOME / 2.4;
    const fenCombos = getCombinations(targetFen, fenStrengths);

    fenCombos.forEach(combo => {
        const counts = {};
        combo.forEach(x => counts[x] = (counts[x] || 0) + 1);
        const regimenText = Object.keys(counts).sort((a,b)=>b-a).map(k => `Fentanyl ${k} mcg/hr x ${counts[k]}`).join(" + ") + " q72h";
        const totalMcg = combo.reduce((a,b)=>a+b, 0);
        const totalOME = (totalMcg * 2.4).toFixed(0);
        optionsHTML += createOptionCard('Fentanyl Patch', regimenText, `~${totalOME} mg OME`, false);
    });

    document.getElementById('target-ome-display').innerHTML = `
        <strong>Target OME:</strong> ~${safeOME.toFixed(1)} mg/day <br>
        <small>${adjustInfo}</small><br>
        <small style="color:red">${renalWarn}</small>
    `;
    document.getElementById('rec-options').innerHTML = optionsHTML || "<p>Please consult specialist (Out of range)</p>";
    
    if(document.querySelector('.option-item')) selectOption(document.querySelector('.option-item'));
}

function createOptionCard(name, regimen, total, isRenal) {
    return `<div class="option-item" onclick="selectOption(this)" data-name="${name}" data-regimen="${regimen}">
        <div style="display:flex; justify-content:space-between;">
            <strong>${name}</strong>
            <span class="badge" style="background:${isRenal?'#ff7675':'#74b9ff'}">${isRenal?'Renal Adj':'Std'}</span>
        </div>
        <p>${regimen}</p>
        <small>Total: ${total}</small>
    </div>`;
}

function selectOption(el) {
    document.querySelectorAll('.option-item').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    currentRegimen = { name: el.getAttribute('data-name'), regimen: el.getAttribute('data-regimen') };
    updateDispensing();
}

function updateDispensing() {
    if(!currentRegimen) return;
    const days = parseInt(document.getElementById('dispense-days').value) || 14;
    const list = document.getElementById('dispense-list');
    
    let dispenseHTML = `<p><strong>1. ATC:</strong> ${currentRegimen.name} <br> ${currentRegimen.regimen}</p>`;
    let atcTotalDailyMg = 0;

    // Parse Regimen
    const regex = /(\d+)\s*(mg|mcg\/hr)\s*x\s*(\d+)/g;
    let match;
    let totalItems = {}; 

    let freq = 1; 
    if (currentRegimen.regimen.includes("BID")) freq = 2;
    if (currentRegimen.regimen.includes("q72h")) freq = 1/3;

    while ((match = regex.exec(currentRegimen.regimen)) !== null) {
        const strength = parseInt(match[1]);
        const unit = match[2];
        const countPerDose = parseInt(match[3]);
        
        const key = `${strength} ${unit}`;
        
        let totalQty = 0;
        if (unit.includes("mcg")) {
            totalQty = countPerDose * Math.ceil(days / 3);
            atcTotalDailyMg += (strength * countPerDose) * 2.4; 
        } else {
            totalQty = countPerDose * freq * days;
            atcTotalDailyMg += (strength * countPerDose) * freq; 
        }
        
        totalItems[key] = (totalItems[key] || 0) + totalQty;
    }

    for (let [key, qty] of Object.entries(totalItems)) {
        let unitText = key.includes("mcg") ? "patches" : "tabs/caps";
        dispenseHTML += `<p class="text-highlight">👉 Dispense (${key}): ${qty} ${unitText}</p>`;
    }

    // Rescue Logic
    const rescueTotalMg = atcTotalDailyMg * 0.15; 
    const rescueVol = rescueTotalMg / 2; 
    const estimatedMlNeeded = rescueVol * 4 * days; 
    const btpBottles = Math.ceil(estimatedMlNeeded / 60);

    const sigText = `${rescueVol.toFixed(1)} ml (${rescueTotalMg.toFixed(1)} mg) q 2-4 hr prn`;

    list.innerHTML = `
        ${dispenseHTML}
        <hr>
        <p><strong>2. Rescue:</strong> Morphine Syr (10mg/5ml)</p>
        <p>Sig: ${sigText}</p>
        <p class="text-highlight">👉 Dispense: ${btpBottles} Bottles (60ml)</p>
    `;
}

// Helper Functions
function updatePainLabel(val) {
    let text = "No Pain"; let color = "#55efc4"; let textColor = "#333";
    if(val >= 1) { text = "Mild"; color = "#81ecec"; }
    if(val >= 4) { text = "Moderate"; color = "#ffeaa7"; }
    if(val >= 7) { text = "Severe"; color = "#ff7675"; textColor = "white"; }
    const badge = document.getElementById('pain-val');
    badge.innerText = `${val} (${text})`; badge.style.background = color; badge.style.color = textColor;
}
function setOpioidStatus(status) {
    currentStatus = status;
    document.getElementById('btn-naive').classList.toggle('active', status === 'naive');
    document.getElementById('btn-user').classList.toggle('active', status === 'user');
    if(status === 'user') document.getElementById('prev-drug-section').classList.remove('hidden');
    else document.getElementById('prev-drug-section').classList.add('hidden');
}
function toggleManualMode() {
    const isManual = document.getElementById('manual-mode-toggle').checked;
    document.getElementById('auto-input-section').classList.toggle('hidden', isManual);
    document.getElementById('manual-input-section').classList.toggle('hidden', !isManual);
}
function toggleRenalInput() { document.getElementById('renal-input').classList.toggle('hidden', !document.getElementById('renal-toggle').checked); }
function forceModerate() { document.getElementById('mg-pain').value = 5; updatePainLabel(5); calculateManagement(); }
function forceSevere() { document.getElementById('mg-pain').value = 8; updatePainLabel(8); calculateManagement(); }
function setDays(d) { document.getElementById('dispense-days').value = d; updateDispensing(); }
