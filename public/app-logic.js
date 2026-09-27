// --- CONFIG & STATE ---
const THEMES = {
    green:  { primary: '#198754', dark: '#146c43', text: 'Hemat & Sehat! 🌱' },
    blue:   { primary: '#0d6efd', dark: '#0a58ca', text: 'Kondisi Aman 💧' },
    yellow: { primary: '#ffc107', dark: '#e0a800', text: 'Hati-hati, Boros! ⚠️' },
    red:    { primary: '#dc3545', dark: '#b02a37', text: 'BAHAYA! OVER BUDGET 🚨' }
};

const CAT_EXPENSE = ["Makan", "Transport", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Lainnya"];
const CAT_INCOME = ["Gaji", "Bonus", "Penjualan", "Hadiah", "Investasi", "Lainnya"];

let dataTransaksi = [];
let savedBudgetNominal = 3000000;
let savedBudgetPeriode = 'bulanan';

let selectedTxId = null;
let tempPhotoData = null;

// --- 0. INIT: load transactions + budget from the server ---
async function initApp() {
    const [txRes, budgetRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/budget'),
    ]);
    const txRows = await txRes.json();
    dataTransaksi = txRows.map(t => ({
        id: t.id,
        tanggal: t.tanggal,
        nominal: Number(t.nominal),
        kategori: t.kategori,
        tipe: t.tipe,
        catatan: t.catatan,
        foto: t.foto,
    }));
    const budget = await budgetRes.json();
    savedBudgetNominal = Number(budget.nominal);
    savedBudgetPeriode = budget.periode;

    toggleKategori();
    updateUI();
}
initApp();

// --- 1. HANDLE INPUT ---
function toggleKategori() {
    const isExpense = document.getElementById('tipePengeluaran').checked;
    const select = document.getElementById('inputKategori');
    select.innerHTML = "";
    const cats = isExpense ? CAT_EXPENSE : CAT_INCOME;
    cats.forEach(c => select.innerHTML += `<option value="${c}">${c}</option>`);
}

document.getElementById('form-transaksi').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nominal = parseInt(document.getElementById('inputNominal').value);
    const kategori = document.getElementById('inputKategori').value;
    const catatan = document.getElementById('inputCatatan').value;
    const tipe = document.getElementById('tipePengeluaran').checked ? 'expense' : 'income';

    if (nominal > 0) {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tanggal: new Date().toISOString(),
                nominal, kategori, tipe, catatan,
                foto: tempPhotoData,
            }),
        });
        const tx = await res.json();
        dataTransaksi.push({ ...tx, nominal: Number(tx.nominal) });
        bootstrap.Modal.getInstance(document.getElementById('modalInput')).hide();
        resetForm();
        updateUI();
    }
});

// --- 2. UPDATE UI & BUDGET LOGIC ---
function getFilteredData() {
    const filterType = document.getElementById('timeFilter').value;
    const now = new Date();
    return dataTransaksi.filter(t => {
        const tDate = new Date(t.tanggal);
        if (filterType === 'mingguan') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return tDate >= oneWeekAgo;
        } else if (filterType === 'bulanan') {
            return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        } else {
            return tDate.getFullYear() === now.getFullYear();
        }
    });
}

function calculateAdaptiveBudget() {
    const filterType = document.getElementById('timeFilter').value;

    let monthlyBase = savedBudgetNominal;
    if (savedBudgetPeriode === 'mingguan') monthlyBase = savedBudgetNominal * 4.333;
    else if (savedBudgetPeriode === 'tahunan') monthlyBase = savedBudgetNominal / 12;

    let activeBudget = monthlyBase;
    let labelFilter = 'Bulan';

    if (filterType === 'mingguan') {
        activeBudget = monthlyBase / 4.333;
        labelFilter = 'Minggu';
    } else if (filterType === 'tahunan') {
        activeBudget = monthlyBase * 12;
        labelFilter = 'Tahun';
    }

    return { limit: activeBudget, label: labelFilter };
}

function updateUI() {
    const filteredData = getFilteredData();
    const listEl = document.getElementById('list-transaksi');

    let totalExpense = 0;
    let totalIncome = 0;

    filteredData.forEach(t => {
        if (t.tipe === 'income') totalIncome += t.nominal;
        else totalExpense += t.nominal;
    });

    document.getElementById('total-expense').innerText = 'Rp ' + totalExpense.toLocaleString('id-ID');
    const saldo = totalIncome - totalExpense;
    const saldoEl = document.getElementById('total-balance');
    saldoEl.innerText = (saldo >= 0 ? '+ ' : '- ') + 'Rp ' + Math.abs(saldo).toLocaleString('id-ID');
    saldoEl.style.color = saldo >= 0 ? '#fff' : '#ffcccc';

    listEl.innerHTML = '';
    filteredData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 20).forEach(t => {
        const d = new Date(t.tanggal);
        const isInc = t.tipe === 'income';
        const colorClass = isInc ? 'text-success' : 'text-danger';
        const borderClass = isInc ? 'border-income' : 'border-expense';
        const sign = isInc ? '+' : '-';
        const hasPhoto = t.foto ? '<i class="fas fa-paperclip text-muted ms-1" style="font-size:0.7rem;"></i>' : '';

        listEl.innerHTML += `
            <div class="transaksi-item d-flex justify-content-between align-items-center ${borderClass}" onclick="showDetail(${t.id})">
                <div>
                    <div class="fw-bold">${t.kategori} ${hasPhoto}</div>
                    <small class="text-muted">${d.toLocaleDateString('id-ID')} • ${t.catatan || ''}</small>
                </div>
                <div class="fw-bold ${colorClass}">${sign} Rp ${t.nominal.toLocaleString('id-ID')}</div>
            </div>`;
    });

    if (filteredData.length === 0) listEl.innerHTML = '<div class="text-center text-muted py-5">Belum ada data</div>';

    updateTheme(totalExpense);
}

function updateTheme(currentExpense) {
    const adaptive = calculateAdaptiveBudget();
    const activeLimit = adaptive.limit;

    const percentage = (currentExpense / activeLimit) * 100;
    const bar = document.getElementById('bar-fill');
    const statusText = document.getElementById('status-text');
    const root = document.documentElement;

    document.getElementById('label-plafon').innerText = `Plafon (/ ${adaptive.label}): Rp ${activeLimit.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
    document.getElementById('persen-plafon').innerText = `${percentage.toFixed(0)}%`;
    bar.style.width = `${Math.min(percentage, 100)}%`;

    let theme = THEMES.blue;
    if (percentage < 50) theme = THEMES.green;
    else if (percentage < 75) theme = THEMES.blue;
    else if (percentage < 100) theme = THEMES.yellow;
    else theme = THEMES.red;

    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-dark', theme.dark);

    if (theme === THEMES.yellow) {
        document.querySelector('.card-saldo').style.color = '#333';
        document.querySelectorAll('.header-select, .header-btn-icon').forEach(el => { el.style.borderColor = "rgba(0,0,0,0.2)"; el.style.color = "#333"; });
    } else {
        document.querySelector('.card-saldo').style.color = 'white';
        document.querySelectorAll('.header-select, .header-btn-icon').forEach(el => { el.style.borderColor = "rgba(255,255,255,0.3)"; el.style.color = "white"; });
    }
    statusText.innerText = theme.text;
}

function bukaModalBudget() {
    document.getElementById('inputBudgetNominal').value = savedBudgetNominal;
    document.getElementById('inputBudgetPeriode').value = savedBudgetPeriode;
    new bootstrap.Modal(document.getElementById('modalBudget')).show();
}

async function simpanBudget() {
    const nominal = parseFloat(document.getElementById('inputBudgetNominal').value);
    const periode = document.getElementById('inputBudgetPeriode').value;
    if (nominal && nominal > 0) {
        const res = await fetch('/api/budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nominal, periode }),
        });
        const budget = await res.json();
        savedBudgetNominal = Number(budget.nominal);
        savedBudgetPeriode = budget.periode;
        bootstrap.Modal.getInstance(document.getElementById('modalBudget')).hide();
        updateUI();
    } else { alert("Nominal tidak valid"); }
}

// --- 3. DETAIL, MODALS, EXCEL ---
function showDetail(id) {
    selectedTxId = id;
    const tx = dataTransaksi.find(t => t.id === id);
    if (!tx) return;

    const isInc = tx.tipe === 'income';
    document.getElementById('detail-amount').innerText = 'Rp ' + tx.nominal.toLocaleString('id-ID');
    document.getElementById('detail-amount').className = isInc ? 'fw-bold mb-0 text-success' : 'fw-bold mb-0 text-danger';
    document.getElementById('detail-date').innerText = new Date(tx.tanggal).toLocaleString('id-ID');
    document.getElementById('detail-category').innerText = tx.kategori;
    document.getElementById('detail-type').innerText = isInc ? 'Pemasukan' : 'Pengeluaran';
    document.getElementById('detail-note').innerText = tx.catatan || '-';

    const imgContainer = document.getElementById('detail-image-container');
    const img = document.getElementById('detail-img');
    if (tx.foto) {
        img.src = tx.foto;
        imgContainer.style.display = 'block';
    } else {
        imgContainer.style.display = 'none';
    }

    new bootstrap.Modal(document.getElementById('modalDetail')).show();
}

async function deleteCurrentTransaction() {
    if (confirm('Hapus transaksi ini?')) {
        await fetch(`/api/transactions/${selectedTxId}`, { method: 'DELETE' });
        dataTransaksi = dataTransaksi.filter(t => t.id !== selectedTxId);
        bootstrap.Modal.getInstance(document.getElementById('modalDetail')).hide();
        updateUI();
    }
}

function exportExcel() {
    if (dataTransaksi.length === 0) { alert("Tidak ada data untuk diexport"); return; }
    const exportData = dataTransaksi.map(t => ({
        Tanggal: new Date(t.tanggal).toLocaleDateString('id-ID'),
        Waktu: new Date(t.tanggal).toLocaleTimeString('id-ID'),
        Tipe: t.tipe === 'income' ? 'Pemasukan' : 'Pengeluaran',
        Kategori: t.kategori,
        Nominal: t.nominal,
        Catatan: t.catatan,
        Foto_Base64: t.foto ? "Ada" : "Tidak Ada"
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
    XLSX.writeFile(wb, "ZenFund_Backup.xlsx");
}

function triggerImport() { document.getElementById('fileImport').click(); }

function importExcel(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (confirm(`Import ${json.length} data?`)) {
            for (const row of json) {
                let tipe = 'expense';
                if (row.Tipe && row.Tipe.toLowerCase().includes('masuk')) tipe = 'income';
                const res = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tanggal: new Date().toISOString(),
                        nominal: row.Nominal || 0,
                        kategori: row.Kategori || 'Lainnya',
                        tipe,
                        catatan: row.Catatan || '',
                        foto: null,
                    }),
                });
                const tx = await res.json();
                dataTransaksi.push({ ...tx, nominal: Number(tx.nominal) });
            }
            updateUI();
            alert("Import Berhasil!");
        }
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
}

// --- 4. UTILS & CAMERA ---
function toggleAbout(show) { document.getElementById('about-page').style.display = show ? 'block' : 'none'; }
function resetForm() {
    document.getElementById('form-transaksi').reset();
    document.getElementById('camera-preview').style.display = 'none';
    document.getElementById('ocr-status').style.display = 'none';
    tempPhotoData = null;
    toggleKategori();
}
function bukaModalInput() { resetForm(); new bootstrap.Modal(document.getElementById('modalInput')).show(); setTimeout(() => document.getElementById('inputNominal').focus(), 500); }
async function resetData() {
    if (confirm("Hapus SEMUA data transaksi ZenFund?")) {
        await fetch('/api/transactions', { method: 'DELETE' });
        dataTransaksi = [];
        updateUI();
    }
}

document.getElementById('cameraInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                tempPhotoData = canvas.toDataURL('image/jpeg', 0.7);
                document.getElementById('camera-preview').src = tempPhotoData;
                document.getElementById('camera-preview').style.display = 'block';
                document.getElementById('ocr-status').style.display = 'block';
                document.getElementById('ocr-status').innerText = "Membaca teks...";
                Tesseract.recognize(tempPhotoData, 'eng').then(({ data: { text } }) => {
                    const numbers = text.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g);
                    if (numbers) {
                        const valid = numbers.map(n => parseFloat(n.replace(/[.,]/g, ''))).filter(n => n > 1000);
                        if (valid.length) { document.getElementById('inputNominal').value = Math.max(...valid); document.getElementById('ocr-status').innerText = "Nominal ditemukan!"; }
                        else { document.getElementById('ocr-status').innerText = "Nominal tidak terbaca otomatis."; }
                    } else { document.getElementById('ocr-status').innerText = "Gagal membaca struk."; }
                });
            }
        }
        reader.readAsDataURL(file);
    }
});

// --- 5. RENCANA & CHART PERCENTAGE ---
function hitungRencana() {
    const harga = parseFloat(document.getElementById('hargaBarang').value);
    const sisihan = parseFloat(document.getElementById('uangSishan').value);
    const periode = parseInt(document.getElementById('periodeSisihan').value);
    if (!harga || !sisihan) return;
    const days = Math.ceil(harga / (sisihan / periode));
    const date = new Date(); date.setDate(date.getDate() + days);
    document.getElementById('hasil-analisis').style.display = 'block';
    document.getElementById('res-tanggal-besar').innerText = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    renderCalendar(date);
    document.getElementById('ai-text').innerText = days < 30 ? "Target mudah! Kurang dari sebulan." : "Butuh konsistensi jangka panjang.";
}

function renderCalendar(targetDate) {
    const container = document.getElementById('cal-days-grid');
    const monthLabel = document.getElementById('cal-month-name');
    container.innerHTML = "";
    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach(d => container.innerHTML += `<div class="cal-day-name">${d}</div>`);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    monthLabel.innerText = targetDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) container.innerHTML += `<div class="cal-day empty"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
        let className = "cal-day";
        if (day === targetDate.getDate()) className += " target-date";
        container.innerHTML += `<div class="${className}">${day}</div>`;
    }
}

let myChart;
function renderChart() {
    const ctx = document.getElementById('chartMingguan');
    const data = getFilteredData().filter(t => t.tipe === 'expense');

    const filterLabel = document.getElementById('timeFilter').options[document.getElementById('timeFilter').selectedIndex].text;
    document.getElementById('chart-period-label').innerText = "Periode: " + filterLabel;

    if (data.length === 0) {
        if (myChart) myChart.destroy();
        document.getElementById('chart-legend').innerHTML = '<div class="text-center text-muted py-3">Belum ada pengeluaran</div>';
        return;
    }

    const totals = {};
    let totalSemua = 0;
    data.forEach(t => {
        totals[t.kategori] = (totals[t.kategori] || 0) + t.nominal;
        totalSemua += t.nominal;
    });

    const labels = Object.keys(totals);
    const dataValues = Object.values(totals);

    const colorsMap = { 'Makan': '#ff6384', 'Transport': '#36a2eb', 'Belanja': '#ffcd56', 'Tagihan': '#4bc0c0', 'Hiburan': '#fd7e14', 'Kesehatan': '#20c997', 'Lainnya': '#9966ff' };
    const bgColors = labels.map(l => colorsMap[l] || '#c9cbcf');

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: labels, datasets: [{ data: dataValues, backgroundColor: bgColors, borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    let legendHTML = '';
    labels.forEach((label, index) => {
        const val = dataValues[index];
        const pct = ((val / totalSemua) * 100).toFixed(1);
        legendHTML += `
            <div class="legend-item d-flex justify-content-between align-items-center">
                <div>
                    <span style="color:${bgColors[index]}; font-size:1.2rem;">●</span>
                    <span class="text-muted ms-1">${label}</span>
                </div>
                <div class="text-end">
                    <span class="fw-bold">Rp ${val.toLocaleString('id-ID')}</span>
                    <span class="badge bg-light text-dark border ms-2" style="width: 50px;">${pct}%</span>
                </div>
            </div>`;
    });
    document.getElementById('chart-legend').innerHTML = legendHTML;
}
