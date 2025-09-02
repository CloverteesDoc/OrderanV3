let orderItemCount = 0;
// Warna berdasarkan jenis pakaian
const colorOptions = {
    kaos: ["BLACK", "WHITE", "SOFT PINK", "NEON PINK", "RED", "MAROON", "LILAC", "SKY BLUE", "ROYAL BLUE", "NAVY BLUE", "NEON YELLOW", "TOSCA", "GREEN", "FOREST GREEN", "YELLOW", "ORANGE", "MUSTARD"],
    dress: ["BLACK", "WHITE", "RED", "YELLOW"],
    kaos_panjang: ["BLACK", "WHITE", "SOFT PINK", "RED", "MAROON", "SKY BLUE", "ROYAL BLUE", "NAVY BLUE", "NEON YELLOW", "TOSCA", "GREEN", "FOREST GREEN", "YELLOW", "MUSTARD"]
};
// Mapping warna ke kode hex
const colorHexMap = {
    "BLACK": "#000000",
    "WHITE": "#ffffff",
    "SOFT PINK": "#f8c6d0",
    "NEON PINK": "#ff69b4",
    "RED": "#dc143c",
    "MAROON": "#800000",
    "LILAC": "#c8a2c8",
    "SKY BLUE": "#87ceeb",
    "ROYAL BLUE": "#154df5",
    "NAVY BLUE": "#130152",
    "NEON YELLOW": "#bbff00",
    "TOSCA": "#40e0d0",
    "GREEN": "#008000",
    "FOREST GREEN": "#053a05",
    "YELLOW": "#ffff00",
    "ORANGE": "#ffa500",
    "MUSTARD": "#ffd027"
};
// Ukuran berdasarkan jenis pakaian
const sizeOptions = {
    kaos: {
        dewasa: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
        anak: ["XS", "S", "M", "L", "XL"]
    },
    dress: {
        dewasa: ["S", "M", "L", "XL"],
        anak: ["S", "M", "L"]
    },
    kaos_panjang: {
        dewasa: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
        anak: ["XS", "S", "M", "L", "XL"]
    }
};
// Nama jenis pakaian
const jenisNames = {
    kaos: "Kaos",
    dress: "Dress",
    kaos_panjang: "Kaos Lengan Panjang"
};

// --- INTEGRASI GOOGLE SHEETS ---
// GANTI DENGAN URL WEB APP ANDA DARI GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4OdhrFcHarRDnprQCgKOMSJkjuTRvaLHIN2aNXwA-n9oT-_nS8FtbjzGMcy58tUdJ/exec"; // <<== GANTI INI
// --- AKHIR INTEGRASI ---

// Template untuk item pesanan
function getOrderItemTemplate(index) {
    return `
        <div class="order-item" data-index="${index}">
            <button type="button" class="remove-item" onclick="removeOrderItem(${index})">×</button>
            <div class="item-header">
                <h3>Item Pesanan #${index + 1}</h3>
            </div>
            <!-- Jenis Pakaian -->
            <div class="form-group">
                <label>Jenis Pakaian *</label>
                <div class="clothing-type">
                    <div class="type-option" data-type="kaos" data-index="${index}">
                        <div>👕</div>
                        <div>Kaos</div>
                    </div>
                    <div class="type-option" data-type="dress" data-index="${index}">
                        <div>👗</div>
                        <div>Dress</div>
                    </div>
                    <div class="type-option" data-type="kaos_panjang" data-index="${index}">
                        <div>👚</div>
                        <div>Kaos Lengan Panjang</div>
                    </div>
                </div>
                <input type="hidden" name="item_${index}_jenis" required>
            </div>
            <!-- Warna -->
            <div class="form-group">
                <label for="item_${index}_warna">Warna *</label>
                <div class="custom-select">
                    <div class="select-trigger">
                        <span>Pilih Warna</span>
                    </div>
                    <div class="select-options" id="color_options_${index}">
                        <!-- Options will be dynamically added here -->
                    </div>
                </div>
                <input type="hidden" name="item_${index}_warna" required>
            </div>
            <!-- Ukuran -->
            <div class="item-details">
                <div class="size-section">
                    <h3>Ukuran Dewasa</h3>
                    <div class="size-grid" id="dewasa_sizes_${index}">
                        <!-- Ukuran dewasa akan diisi oleh JavaScript -->
                    </div>
                </div>
                <div class="size-section">
                    <h3>Ukuran Anak-anak</h3>
                    <div class="size-grid" id="anak_sizes_${index}">
                        <!-- Ukuran anak-anak akan diisi oleh JavaScript -->
                    </div>
                </div>
            </div>
            <!-- Rincian Desain -->
            <div class="design-section">
                <div class="design-box">
                    <h4>Desain Depan</h4>
                    <textarea name="item_${index}_desain_depan" rows="3" placeholder="Deskripsikan desain depan..."></textarea>
                    <div class="design-files" id="files_depan_${index}">
                        <div class="file-upload-section">
                            <h4>File Desain Depan</h4>
                            <div id="file_inputs_depan_${index}">
                                <div class="file-input-container">
                                    <input type="file" name="item_${index}_file_depan_0" accept=".jpg,.jpeg,.png,.pdf,.ai,.psd">
                                    <button type="button" class="remove-file" onclick="removeFileInput('depan', ${index}, 0)">Hapus</button>
                                </div>
                            </div>
                            <button type="button" class="add-file-btn" onclick="addFileInput('depan', ${index})">+ Tambah File</button>
                        </div>
                    </div>
                </div>
                <div class="design-box">
                    <h4>Desain Belakang</h4>
                    <textarea name="item_${index}_desain_belakang" rows="3" placeholder="Deskripsikan desain belakang..."></textarea>
                    <div class="design-files" id="files_belakang_${index}">
                        <div class="file-upload-section">
                            <h4>File Desain Belakang</h4>
                            <div id="file_inputs_belakang_${index}">
                                <div class="file-input-container">
                                    <input type="file" name="item_${index}_file_belakang_0" accept=".jpg,.jpeg,.png,.pdf,.ai,.psd">
                                    <button type="button" class="remove-file" onclick="removeFileInput('belakang', ${index}, 0)">Hapus</button>
                                </div>
                            </div>
                            <button type="button" class="add-file-btn" onclick="addFileInput('belakang', ${index})">+ Tambah File</button>
                        </div>
                    </div>
                </div>
                <div class="design-box">
                    <h4>Desain Lengan</h4>
                    <textarea name="item_${index}_desain_lengan" rows="3" placeholder="Deskripsikan desain lengan..."></textarea>
                    <div class="design-files" id="files_lengan_${index}">
                        <div class="file-upload-section">
                            <h4>File Desain Lengan</h4>
                            <div id="file_inputs_lengan_${index}">
                                <div class="file-input-container">
                                    <input type="file" name="item_${index}_file_lengan_0" accept=".jpg,.jpeg,.png,.pdf,.ai,.psd">
                                    <button type="button" class="remove-file" onclick="removeFileInput('lengan', ${index}, 0)">Hapus</button>
                                </div>
                            </div>
                            <button type="button" class="add-file-btn" onclick="addFileInput('lengan', ${index})">+ Tambah File</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
// Tambah file input
function addFileInput(type, itemIndex) {
    const container = document.getElementById(`file_inputs_${type}_${itemIndex}`);
    const fileCount = container.querySelectorAll('input[type="file"]').length;
    const fileInputContainer = document.createElement('div');
    fileInputContainer.className = 'file-input-container';
    fileInputContainer.innerHTML = `
        <input type="file" name="item_${itemIndex}_file_${type}_${fileCount}" accept=".jpg,.jpeg,.png,.pdf,.ai,.psd">
        <button type="button" class="remove-file" onclick="removeFileInput('${type}', ${itemIndex}, ${fileCount})">Hapus</button>
    `;
    container.appendChild(fileInputContainer);
}
// Hapus file input
function removeFileInput(type, itemIndex, fileIndex) {
    const container = document.getElementById(`file_inputs_${type}_${itemIndex}`);
    const fileInputs = container.querySelectorAll('.file-input-container');
    // Jangan hapus jika hanya ada satu file input
    if (fileInputs.length <= 1) {
        // alert('Minimal harus ada satu file input');
        // return; // Kita biarkan hapus terakhir juga untuk fleksibilitas
    }
    // Hapus file input yang dipilih
    const fileInputToRemove = container.querySelector(`input[name="item_${itemIndex}_file_${type}_${fileIndex}"]`).parentElement;
    if (fileInputToRemove) {
        fileInputToRemove.remove();
    }
    // Reindex file inputs
    const remainingInputs = container.querySelectorAll('.file-input-container');
    remainingInputs.forEach((inputContainer, newIndex) => {
        const fileInput = inputContainer.querySelector('input[type="file"]');
        const removeButton = inputContainer.querySelector('.remove-file');
        if (fileInput) {
            fileInput.name = `item_${itemIndex}_file_${type}_${newIndex}`;
        }
        if (removeButton) {
            removeButton.onclick = () => removeFileInput(type, itemIndex, newIndex);
        }
    });
}
// Update warna berdasarkan jenis pakaian
function updateColorOptions(index, jenis) {
    const optionsContainer = document.getElementById(`color_options_${index}`);
    if (!optionsContainer) return;
    // Clear existing options
    optionsContainer.innerHTML = '';
    // Add new options based on jenis
    if (colorOptions[jenis]) {
        colorOptions[jenis].forEach(color => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.innerHTML = `
                <div class="color-swatch" style="background-color: ${colorHexMap[color]};"></div>
                <span>${color}</span>
            `;
            option.addEventListener('click', function() {
                const trigger = document.querySelector(`#orderItems .order-item[data-index="${index}"] .select-trigger`);
                trigger.querySelector('span').textContent = color;
                document.querySelector(`input[name="item_${index}_warna"]`).value = color;
                optionsContainer.style.display = 'none';
                updateSummary();
            });
            optionsContainer.appendChild(option);
        });
    }
}
// Update ukuran berdasarkan jenis pakaian
function updateSizeOptions(index, jenis) {
    const dewasaContainer = document.querySelector(`#dewasa_sizes_${index}`);
    const anakContainer = document.querySelector(`#anak_sizes_${index}`);
    if (!dewasaContainer || !anakContainer) return;
    // Clear existing sizes
    dewasaContainer.innerHTML = '';
    anakContainer.innerHTML = '';
    // Add dewasa sizes
    if (sizeOptions[jenis] && sizeOptions[jenis].dewasa) {
        sizeOptions[jenis].dewasa.forEach(size => {
            const sizeItem = document.createElement('div');
            sizeItem.className = 'size-item';
            sizeItem.innerHTML = `
                <label>${size}</label>
                <input type="number" name="item_${index}_dewasa_${size.toLowerCase()}" min="0" value="0">
            `;
            dewasaContainer.appendChild(sizeItem);
        });
    }
    // Add anak sizes
    if (sizeOptions[jenis] && sizeOptions[jenis].anak) {
        sizeOptions[jenis].anak.forEach(size => {
            const sizeItem = document.createElement('div');
            sizeItem.className = 'size-item';
            sizeItem.innerHTML = `
                <label>${size}</label>
                <input type="number" name="item_${index}_anak_${size.toLowerCase()}" min="0" value="0">
            `;
            anakContainer.appendChild(sizeItem);
        });
    }
}
// Tambah item pesanan
document.getElementById('addOrderItem').addEventListener('click', function() {
    const orderItemsContainer = document.getElementById('orderItems');
    const newItem = document.createElement('div');
    newItem.innerHTML = getOrderItemTemplate(orderItemCount);
    orderItemsContainer.appendChild(newItem);
    // Tambahkan event listener untuk type options di item baru
    const newTypeOptions = newItem.querySelectorAll('.type-option');
    newTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const index = this.dataset.index;
            const jenis = this.dataset.type;
            // Hapus kelas selected dari semua options di item ini
            document.querySelectorAll(`.type-option[data-index="${index}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });
            // Tambahkan kelas selected ke option yang diklik
            this.classList.add('selected');
            // Update hidden input
            document.querySelector(`input[name="item_${index}_jenis"]`).value = jenis;
            // Update warna dan ukuran berdasarkan jenis
            updateColorOptions(index, jenis);
            updateSizeOptions(index, jenis);
            // Update ringkasan
            updateSummary();
        });
    });
    // Tambahkan event listener untuk warna select
    const colorSelect = newItem.querySelector(`.custom-select`);
    if (colorSelect) {
        const trigger = colorSelect.querySelector('.select-trigger');
        const optionsContainer = colorSelect.querySelector('.select-options');
        trigger.addEventListener('click', function() {
            optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
        });
        window.addEventListener('click', function(e) {
            if (!colorSelect.contains(e.target)) {
                optionsContainer.style.display = 'none';
            }
        });
    }
    orderItemCount++;
    updateSummary();
});
// Hapus item pesanan
function removeOrderItem(index) {
    const item = document.querySelector(`.order-item[data-index="${index}"]`);
    if (item) {
        item.remove();
        updateSummary();
    }
}
// Format ukuran untuk ringkasan
function formatSizeSummary(sizes, prefix) {
    const summary = [];
    for (const [size, qty] of Object.entries(sizes)) {
        if (qty > 0) {
            summary.push(`${size.toUpperCase()} ${qty}`);
        }
    }
    return summary.length > 0 ? `${prefix} : ${summary.join(', ')}` : `${prefix} : -`;
}
// Update ringkasan pesanan
function updateSummary() {
    let totalItems = 0;
    let totalPcs = 0;
    const summaryContainer = document.getElementById('orderSummary');
    // Hitung total PCS dari semua item
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        totalPcs += parseInt(input.value) || 0;
    });
    // Ambil data untuk ringkasan
    const orderItems = document.querySelectorAll('.order-item');
    totalItems = orderItems.length;
    // Buat ringkasan detail
    let summaryHTML = '';
    orderItems.forEach((item, index) => {
        const itemIndex = item.dataset.index;
        const jenisInput = document.querySelector(`input[name="item_${itemIndex}_jenis"]`);
        const warnaInput = document.querySelector(`input[name="item_${itemIndex}_warna"]`);
        if (jenisInput && jenisInput.value && warnaInput && warnaInput.value) {
            const jenis = jenisInput.value;
            const warna = warnaInput.value;
            // Kumpulkan ukuran dewasa
            const dewasaSizes = {};
            sizeOptions[jenis].dewasa.forEach(size => {
                const input = document.querySelector(`input[name="item_${itemIndex}_dewasa_${size.toLowerCase()}"`);
                if (input) {
                    const qty = parseInt(input.value) || 0;
                    if (qty > 0) {
                        dewasaSizes[size] = qty;
                    }
                }
            });
            // Kumpulkan ukuran anak-anak
            const anakSizes = {};
            sizeOptions[jenis].anak.forEach(size => {
                const input = document.querySelector(`input[name="item_${itemIndex}_anak_${size.toLowerCase()}"`);
                if (input) {
                    const qty = parseInt(input.value) || 0;
                    if (qty > 0) {
                        anakSizes[size] = qty;
                    }
                }
            });
            // Buat ringkasan untuk item ini
            summaryHTML += `
                <div class="order-summary-item">
                    <h4>${jenisNames[jenis]}</h4>
                    <div class="order-summary-details">
                        <p>${warna}</p>
                        <p>${formatSizeSummary(dewasaSizes, 'Dewasa')}</p>
                        <p>${formatSizeSummary(anakSizes, 'Anak-anak')}</p>
                    </div>
                </div>
            `;
        }
    });
    // Update tampilan
    summaryContainer.innerHTML = summaryHTML || '<p class="no-data">Belum ada item pesanan</p>';
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalPcs').textContent = totalPcs;
}
// Tambahkan event listener untuk input number
document.addEventListener('input', function(e) {
    if (e.target.type === 'number') {
        updateSummary();
    }
});

// --- FUNGSI PENGIRIMAN KE GOOGLE SHEETS ---
// Fungsi untuk mengirim data form ke Google Apps Script
async function submitFormToGoogleSheets(formDataObject) {
    const submitButton = document.querySelector('.submit-btn');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Mengirim...';

    try {
        // Kirim data menggunakan fetch
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formDataObject).toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Coba parse respon JSON
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.warn("Respon bukan JSON yang valid:", await response.text());
            // Anggap sukses jika status 200 OK
            result = { result: "success", message: "Data mungkin berhasil dikirim (respon tidak dalam format JSON)" };
        }

        if (result.result === "success") {
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('errorMessage').style.display = 'none';
            console.log("Sukses:", result.message);
            return true;
        } else {
            throw new Error(result.message || "Terjadi kesalahan tidak dikenal dari server.");
        }
    } catch (error) {
        console.error("Error saat mengirim ", error);
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = `Gagal mengirim pesanan: ${error.message}`;
        document.getElementById('successMessage').style.display = 'none';
        return false;
    } finally {
        // Reset tombol submit
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}
// --- AKHIR FUNGSI PENGIRIMAN ---

// Form submission
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Mencegah submit default

    // Validasi form
    const requiredFields = ['nama', 'whatsapp', 'alamat'];
    let isValid = true;

    // Validasi informasi pemesan
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
        }
    });

    // Validasi setiap item pesanan
    const orderItems = document.querySelectorAll('.order-item');
    if (orderItems.length === 0) {
        isValid = false;
        alert('Minimal harus ada satu item pesanan');
        return;
    }

    orderItems.forEach(item => {
        const index = item.dataset.index;
        const jenisInput = document.querySelector(`input[name="item_${index}_jenis"]`);
        const warnaInput = document.querySelector(`input[name="item_${index}_warna"]`);

        if (!jenisInput || !jenisInput.value) {
            isValid = false;
            alert(`Silakan pilih jenis pakaian untuk Item Pesanan #${parseInt(index) + 1}`);
        }

        if (!warnaInput || !warnaInput.value) {
            const trigger = item.querySelector('.select-trigger');
            if (trigger) trigger.style.borderColor = 'red';
            isValid = false;
        } else {
            const trigger = item.querySelector('.select-trigger');
            if (trigger) trigger.style.borderColor = '#ddd';
        }
    });

    if (!isValid) {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = 'Harap lengkapi semua field yang wajib diisi.';
        document.getElementById('successMessage').style.display = 'none';
        return;
    }

    // Siapkan data untuk dikirim
    const formData = new FormData(this);
    const formDataObject = {};
    for (let [key, value] of formData.entries()) {
         // Untuk file, kita hanya bisa mengirim nama filenya jika perlu dicatat di Sheets
         // Google Apps Script tidak bisa menerima file via form-urlencoded ini.
         // Jika Anda benar-benar perlu menyimpan file, Anda memerlukan layanan cloud storage terpisah (seperti Google Drive API).
         if (value instanceof File) {
             // Kita bisa mengirim nama file jika diperlukan
             formDataObject[key] = value.name || "(Tidak ada file dipilih)";
         } else {
             formDataObject[key] = value;
         }
    }

    // Kirim data ke Google Sheets
    const isSubmitted = await submitFormToGoogleSheets(formDataObject);

    if (isSubmitted) {
        // Reset form hanya jika pengiriman sukses
        setTimeout(() => {
            this.reset(); // Reset form utama
            document.getElementById('orderItems').innerHTML = '';
            orderItemCount = 0;
            updateSummary();
            document.getElementById('successMessage').style.display = 'none';
            // Hapus kelas selected dari semua type options (jika ada sisa)
            document.querySelectorAll('.type-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            // Reset warna select triggers
            document.querySelectorAll('.select-trigger span').forEach(span => {
                 span.textContent = 'Pilih Warna';
            });
            document.querySelectorAll('input[name*="_warna"]').forEach(input => {
                 input.value = ''; // Reset hidden inputs
            });
        }, 5000);
    }
    // Jika gagal, pesan error sudah ditampilkan, jangan reset form
});

// Inisialisasi dengan satu item pesanan
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addOrderItem').click();
});