export const bodyMarkup = `
    <div class="container py-3">
        <div class="card card-saldo p-4 mb-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <select id="timeFilter" class="header-select" onchange="updateUI()">
                    <option value="mingguan">Minggu Ini</option>
                    <option value="bulanan" selected>Bulan Ini</option>
                    <option value="tahunan">Tahun Ini</option>
                </select>
                <div class="d-flex gap-2">
                    <button class="header-btn-icon" onclick="toggleAbout(true)" title="Tentang & Panduan"><i class="fas fa-info-circle"></i></button>
                    <button class="header-btn-icon" onclick="triggerImport()" title="Import Excel"><i class="fas fa-file-import"></i></button>
                    <input type="file" id="fileImport" hidden accept=".xlsx, .xls" onchange="importExcel(this)">
                    <button class="header-btn-icon" onclick="exportExcel()" title="Export Excel"><i class="fas fa-file-export"></i></button>
                    <button class="header-btn-icon" onclick="bukaModalBudget()" title="Atur Plafon"><i class="fas fa-cog"></i></button>
                </div>
            </div>

            <div class="row">
                <div class="col-6">
                    <small class="opacity-75">Total Pengeluaran</small>
                    <h3 id="total-expense" class="fw-bold mb-0">Rp 0</h3>
                </div>
                <div class="col-6 text-end">
                    <small class="opacity-75">Saldo (In - Out)</small>
                    <h4 id="total-balance" class="fw-bold mb-0 text-white">Rp 0</h4>
                </div>
            </div>

            <div class="mt-3">
                <div class="d-flex justify-content-between small opacity-75">
                    <span id="label-plafon">Plafon: -</span>
                    <span id="persen-plafon">0%</span>
                </div>
                <div class="budget-bar-bg">
                    <div class="budget-bar-fill" id="bar-fill"></div>
                </div>
                <small id="status-text" class="d-block mt-2 text-center fw-bold small opacity-75">Aman</small>
            </div>
        </div>

        <h6 class="text-muted fw-bold mb-3 ps-1" style="font-size: 0.8rem; letter-spacing: 1px;">RIWAYAT TRANSAKSI</h6>
        <div id="list-transaksi" class="pb-3"></div>
    </div>

    <div class="fab-container">
        <button class="btn-fab" onclick="bukaModalInput()">
            <i class="fas fa-plus"></i>
        </button>
    </div>

    <div id="about-page">
        <button onclick="toggleAbout(false)" style="position:fixed; top:20px; right:20px; z-index:2001; background:rgba(255,255,255,0.2); border:none; color:white; width:40px; height:40px; border-radius:50%; font-size:1.2rem; backdrop-filter:blur(5px);">
            <i class="fas fa-times"></i>
        </button>

        <div class="hero-section text-center">
            <h2 class="fw-bold mb-2">ZenFund</h2>
            <p class="opacity-75 small text-uppercase letter-spacing-2">Sistem Manajemen Keuangan Personal<br>Berbasis Frictionless Experience</p>
        </div>

        <div class="container pb-5">
            <div class="mb-5">
                <h5 class="fw-bold mb-3 text-primary"><i class="fas fa-lightbulb me-2"></i>Latar Belakang</h5>
                <p class="text-muted small" style="line-height: 1.6;">
                    Dalam era ketidakpastian ekonomi, literasi keuangan adalah fondasi vital. Namun, banyak individu gagal mempertahankan konsistensi pencatatan (<i>tracking habit</i>) karena hambatan psikologis dan teknis. Aplikasi konvensional seringkali terlalu kompleks dan lambat. Hal ini menyebabkan "kebocoran finansial" yang tidak terdeteksi.
                </p>
            </div>

            <div class="mb-5">
                <h5 class="fw-bold mb-3 text-primary"><i class="fas fa-layer-group me-2"></i>Solusi Kami</h5>
                <p class="text-muted small mb-4">ZenFund hadir untuk mereduksi hambatan pencatatan hingga titik nol (<i>zero-friction input</i>) demi ketenangan finansial Anda.</p>

                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-camera"></i></div>
                    <h6 class="fw-bold">Input Kilat & OCR</h6>
                    <p class="small text-muted mb-0">Bisa ambil foto langsung atau upload struk dari galeri HP. Sistem akan membaca nominal secara otomatis.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-palette"></i></div>
                    <h6 class="fw-bold">Tema Adaptif (Alarm Visual)</h6>
                    <p class="small text-muted mb-0">Antarmuka berubah warna sesuai kesehatan dompet Anda:
                        <span class="fw-bold" style="color: #198754;">Hijau</span> (Hemat),
                        <span class="fw-bold" style="color: #0d6efd;">Biru</span> (Aman),
                        <span class="fw-bold" style="color: #ffc107;">Kuning</span> (Waspada), hingga
                        <span class="fw-bold" style="color: #dc3545;">Merah</span> (Bahaya).
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-brain"></i></div>
                    <h6 class="fw-bold">Plafon Adaptif & Perencanaan</h6>
                    <p class="small text-muted mb-0">Cukup atur target budget sekali, sistem otomatis menyesuaikannya di berbagai filter waktu. Serta terdapat kalender prediktif untuk menabung.</p>
                </div>
            </div>

            <div class="mb-5 bg-white p-4 rounded-4 shadow-sm border">
                <h5 class="fw-bold mb-4 text-primary"><i class="fas fa-book-reader me-2"></i>Panduan Penggunaan</h5>

                <div class="step-item">
                    <div class="step-number">1</div>
                    <div>
                        <h6 class="fw-bold mb-1">Atur Plafon Budget</h6>
                        <p class="small text-muted mb-0">Klik ikon gerigi <i class="fas fa-cog text-secondary"></i> di kanan atas. Masukkan batas maksimal pengeluaranmu beserta periodenya (misal: Rp 2.000.000 / Bulan).</p>
                    </div>
                </div>

                <div class="step-item">
                    <div class="step-number">2</div>
                    <div>
                        <h6 class="fw-bold mb-1">Catat Transaksi</h6>
                        <p class="small text-muted mb-0">Klik tombol <b class="text-primary">+</b> besar di bawah. Pilih Pengeluaran atau Pemasukan. Gunakan kamera/galeri untuk scan struk agar tidak perlu ketik manual.</p>
                    </div>
                </div>

                <div class="step-item">
                    <div class="step-number">3</div>
                    <div>
                        <h6 class="fw-bold mb-1">Pantau Warna Aplikasi</h6>
                        <p class="small text-muted mb-0">Perhatikan warna kartu saldo. Jika berubah menjadi <b>Kuning</b> atau <b>Merah</b>, artinya pengeluaranmu sudah mendekati batas plafon!</p>
                    </div>
                </div>

                <div class="step-item">
                    <div class="step-number">4</div>
                    <div>
                        <h6 class="fw-bold mb-1">Analisis Detail & Backup</h6>
                        <p class="small text-muted mb-0">Gunakan menu <b>Laporan</b> untuk melihat persentase pengeluaran. Gunakan tombol <i class="fas fa-file-export text-secondary"></i> untuk simpan data ke Excel agar aman.</p>
                    </div>
                </div>
            </div>

            <div class="mb-5">
                <h5 class="fw-bold mb-3 text-primary"><i class="fas fa-question-circle me-2"></i>FAQ</h5>
                <div class="accordion accordion-flush" id="faqAccordion">
                    <div class="accordion-item faq-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                                <strong>Mengapa ZenFund disebut "Frictionless"?</strong>
                            </button>
                        </h2>
                        <div id="faq1" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body small text-muted">
                                Kami menghilangkan hambatan input data. Aplikasi ini dirancang dengan langkah input seminimal mungkin agar Anda tidak malas mencatat.
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item faq-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                                <strong>Bagaimana cara kerja Plafon Adaptif?</strong>
                            </button>
                        </h2>
                        <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body small text-muted">
                                Jika Anda mengatur plafon "Rp 500.000 per Minggu", dan Anda sedang memfilter "Bulan Ini" di layar utama, sistem otomatis mengonversi plafon Anda menjadi proporsi bulanan agar grafik tetap akurat.
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item faq-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                                <strong>Apakah data saya aman dan bisa di-backup?</strong>
                            </button>
                        </h2>
                        <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body small text-muted">
                                Data disimpan di server (database), jadi bisa diakses dari perangkat manapun selama Anda masuk dengan passcode. Untuk backup tambahan, Anda bisa mengekspor data ke format Excel (.xlsx) dengan menekan ikon <i class="fas fa-file-export"></i> di halaman utama.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center py-4 bg-light rounded-4">
                <h6 class="fw-bold mb-2">Punya Pertanyaan Lebih Lanjut?</h6>
                <p class="small text-muted mb-3">Tim kami siap membantu kebutuhan finansial digital Anda.</p>
                <a href="mailto:raynoldkeefa@gmail.com?subject=Tanya%20ZenFund%20App" class="btn btn-outline-primary rounded-pill px-4">
                    <i class="fas fa-envelope me-2"></i> Hubungi via Email
                </a>
            </div>
            <div class="text-center mt-4 pb-4">
                <small class="text-muted opacity-50">&copy; 2026 ZenFund App. All Rights Reserved.</small>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalInput" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold">Tambah Transaksi</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="form-transaksi">
                        <div class="btn-group w-100 mb-3" role="group">
                            <input type="radio" class="btn-check" name="tipeInput" id="tipePengeluaran" value="expense" checked onchange="toggleKategori()">
                            <label class="btn btn-outline-danger" for="tipePengeluaran">Pengeluaran</label>

                            <input type="radio" class="btn-check" name="tipeInput" id="tipePemasukan" value="income" onchange="toggleKategori()">
                            <label class="btn btn-outline-success" for="tipePemasukan">Pemasukan</label>
                        </div>

                        <div class="mb-3 text-center">
                            <label for="cameraInput" class="btn btn-outline-secondary w-100 py-3" style="border-style: dashed;">
                                <i class="fas fa-camera me-2"></i> Foto / Upload Struk
                            </label>
                            <input type="file" accept="image/*" id="cameraInput" hidden>
                            <img id="camera-preview" class="mt-3 shadow-sm">
                            <small class="text-primary fw-bold d-block mt-2" id="ocr-status" style="display:none;">Analisis...</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold">NOMINAL (RP)</label>
                            <input type="number" class="form-control form-control-lg bg-light border-0" id="inputNominal" placeholder="0" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold">KATEGORI</label>
                            <select class="form-select form-select-lg bg-light border-0" id="inputKategori"></select>
                        </div>

                        <div class="mb-4">
                            <label class="form-label text-muted small fw-bold">CATATAN (OPSIONAL)</label>
                            <input type="text" class="form-control bg-light border-0" id="inputCatatan" placeholder="Keterangan singkat...">
                        </div>

                        <div class="d-grid"><button type="submit" class="btn btn-primary btn-input-besar shadow-sm">SIMPAN</button></div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalBudget" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-light">
                    <h5 class="modal-title fw-bold"><i class="fas fa-cog me-2 text-primary"></i>Atur Plafon Budget</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="small text-muted mb-3">Sistem ZenFund akan secara otomatis mengadaptasi nominal ini ke tampilan Mingguan/Bulanan/Tahunan Anda.</p>
                    <div class="mb-3">
                        <label class="form-label fw-bold small">Nominal Maksimal (Rp)</label>
                        <input type="number" class="form-control form-control-lg bg-light border-0" id="inputBudgetNominal" placeholder="Contoh: 3000000">
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-bold small">Periode Budget</label>
                        <select class="form-select form-select-lg bg-light border-0" id="inputBudgetPeriode">
                            <option value="mingguan">Per Minggu</option>
                            <option value="bulanan">Per Bulan</option>
                            <option value="tahunan">Per Tahun</option>
                        </select>
                    </div>
                    <div class="d-grid"><button type="button" class="btn btn-primary fw-bold py-3" onclick="simpanBudget()">Simpan Plafon</button></div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalDetail" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0">
                <div class="modal-header border-0">
                    <h5 class="modal-title fw-bold">Detail Transaksi</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <h1 id="detail-amount" class="fw-bold mb-0">Rp 0</h1>
                        <span id="detail-date" class="text-muted small"></span>
                    </div>

                    <div class="card bg-light border-0 p-3 mb-3">
                        <div class="d-flex justify-content-between mb-2 border-bottom pb-2">
                            <span class="text-muted">Kategori</span>
                            <span class="fw-bold" id="detail-category">-</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2 border-bottom pb-2">
                            <span class="text-muted">Tipe</span>
                            <span class="fw-bold" id="detail-type">-</span>
                        </div>
                        <div class="mb-0">
                            <span class="text-muted d-block mb-1">Catatan</span>
                            <p class="fw-bold mb-0" id="detail-note">-</p>
                        </div>
                    </div>

                    <div id="detail-image-container" style="display:none;">
                        <h6 class="text-muted small fw-bold">BUKTI FOTO / STRUK</h6>
                        <img id="detail-img" src="" alt="Bukti Transaksi">
                    </div>
                </div>
                <div class="modal-footer border-0 justify-content-center">
                    <button class="btn btn-outline-danger w-100" onclick="deleteCurrentTransaction()">
                        <i class="fas fa-trash-alt me-2"></i>Hapus Transaksi Ini
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalRencana" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
            <div class="modal-content border-0">
                <div class="modal-header bg-light">
                    <h5 class="modal-title fw-bold"><i class="fas fa-calendar-check me-2 text-primary"></i>Simulasi Target</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="form-rencana">
                        <div class="row g-2">
                            <div class="col-6"><input type="text" class="form-control" id="namaBarang" placeholder="Nama Target"></div>
                            <div class="col-6"><input type="number" class="form-control" id="hargaBarang" placeholder="Harga (Rp)"></div>
                        </div>
                        <div class="mt-3">
                            <div class="input-group">
                                <input type="number" class="form-control" id="uangSishan" placeholder="Nabung (Rp)">
                                <select class="form-select" id="periodeSisihan" style="max-width: 120px;">
                                    <option value="1">/ Hari</option>
                                    <option value="7">/ Minggu</option>
                                    <option value="30">/ Bulan</option>
                                </select>
                            </div>
                        </div>
                        <div class="d-grid mt-3"><button type="button" class="btn btn-primary" onclick="hitungRencana()">Hitung</button></div>

                        <div id="hasil-analisis" class="mt-4" style="display:none;">
                            <div class="text-center">
                                <small class="text-muted">Estimasi Tercapai</small>
                                <h4 class="fw-bold text-primary" id="res-tanggal-besar">-</h4>
                            </div>
                            <div class="calendar-wrapper">
                                <div class="cal-header" id="cal-month-name">JANUARI 2026</div>
                                <div class="cal-grid" id="cal-days-grid"></div>
                            </div>
                            <div class="ai-bubble">
                                <strong><i class="fas fa-robot me-1"></i> Analisis ZenFund:</strong><br>
                                <span id="ai-text">...</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalLaporan" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0">
                <div class="modal-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold mb-0">Statistik Kategori</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <p class="small text-muted" id="chart-period-label">Minggu Ini</p>

                    <div style="position: relative; height: 250px; margin-bottom: 20px;">
                        <canvas id="chartMingguan"></canvas>
                    </div>

                    <div id="chart-legend" class="mt-4 px-2">
                        </div>
                </div>
            </div>
        </div>
    </div>

    <div class="bottom-nav d-flex justify-content-between align-items-center">
        <button class="nav-btn" onclick="new bootstrap.Modal(document.getElementById('modalLaporan')).show(); renderChart()">
            <i class="fas fa-chart-pie"></i> Laporan
        </button>
        <button class="nav-btn" onclick="new bootstrap.Modal(document.getElementById('modalRencana')).show()">
            <i class="fas fa-calendar-alt"></i> Rencana
        </button>
        <button class="nav-btn text-danger" onclick="resetData()">
            <i class="fas fa-trash-alt"></i> Reset
        </button>
    </div>
`;
