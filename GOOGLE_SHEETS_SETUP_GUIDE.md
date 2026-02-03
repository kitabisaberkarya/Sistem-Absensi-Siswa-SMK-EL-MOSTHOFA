
# Panduan Pengaturan Database (Google Sheets)

Ikuti langkah-langkah berikut untuk menghubungkan aplikasi dengan Google Sheets sebagai database backend.

## 1. Persiapan Spreadsheet
1.  Buka **Google Drive** dan buat **Google Sheet** baru.
2.  Beri nama file, misalnya: `Database Absensi Sekolah`.

## 2. Pembuatan Struktur Data (Tab/Sheet)
Buat 4 tab (sheet) di bagian bawah spreadsheet dan isi **Baris 1 (Header)** persis dengan nama kolom berikut (huruf besar/kecil berpengaruh):

### Tab 1: Ubah nama sheet menjadi `Users`
*   **Header (Sel A1 s.d. K1):**
    `id`, `name`, `email`, `password`, `role`, `nip`, `phone`, `subject`, `gender`, `status`, `avatar`
*   *Saran: Isi satu baris data dummy untuk akun Admin agar bisa login pertama kali.*
    *   id: `u_admin_01`
    *   name: `Administrator`
    *   email: `admin@sekolah.sch.id`
    *   password: `admin` (atau password lain yang diinginkan)
    *   role: `ADMIN`

### Tab 2: Ubah nama sheet menjadi `Students`
*   **Header (Sel A1 s.d. G1):**
    `id`, `name`, `nis`, `className`, `gender`, `parentPhone`, `address`

### Tab 3: Ubah nama sheet menjadi `Attendance_Log`
*   **Header (Sel A1 s.d. K1):**
    `log_id`, `date`, `classId`, `subject`, `teacherId`, `topic`, `studentId`, `studentName`, `status`, `note`, `timestamp`

### Tab 4: Ubah nama sheet menjadi `System_Logs`
*   **Header (Sel A1 s.d. E1):**
    `id`, `user`, `action`, `timestamp`, `status`

## 3. Pemasangan Script Backend (Modular)
Karena sistem ini menggunakan arsitektur modular, Anda perlu membuat beberapa file script terpisah agar kode rapi dan mudah dikelola.

1.  Di menu Google Sheet, klik **Extensions** (Ekstensi) > **Apps Script**.
2.  Hapus kode default `function myFunction() {...}`.
3.  Buat file-file berikut dengan mengklik tanda **+ (Plus)** > **Script** di sebelah kiri editor:

    **A. File: `Pengaturan.gs`**
    *   Copy isi dari `APP_SCRIPT/Pengaturan.md`
    *   *(File ini berisi konfigurasi database & fungsi helper global)*

    **B. File: `DataGuru.gs`**
    *   Copy isi dari `APP_SCRIPT/DataGuru.md`
    *   *(Logic login, register guru, import data)*

    **C. File: `DataSiswa.gs`**
    *   Copy isi dari `APP_SCRIPT/DataSiswa.md`
    *   *(Logic fetch siswa, create siswa)*

    **D. File: `Laporan.gs`**
    *   Copy isi dari `APP_SCRIPT/Laporan.md`
    *   *(Logic simpan absensi)*

    **E. File: `Dashboard.gs`**
    *   Copy isi dari `APP_SCRIPT/Dashboard.md`
    *   *(Logic analitik & statistik)*
    
    **F. File: `BackupRestore.gs`**
    *   Copy isi dari `APP_SCRIPT/BackupRestore.md`
    *   *(Logic backup data)*

    **G. File: `Code.gs`** (File default biasanya sudah ada, tinggal rename/timpa)
    *   Copy isi dari `APP_SCRIPT/Code.md`
    *   *(Ini adalah Router utama `doPost` dan `doGet`. Pastikan file ini ada)*

4.  Simpan semua file dengan menekan icon Save (Diskette) atau `Ctrl + S`.

## 4. Publikasi API (Deployment)
Langkah ini penting agar aplikasi bisa mengirim dan mengambil data.

1.  Klik tombol biru **Deploy** (Terapkan) di pojok kanan atas.
2.  Pilih **New deployment** (Deployment baru).
3.  Klik ikon roda gigi (Select type) di sebelah kiri, pilih **Web app**.
4.  Isi konfigurasi berikut:
    *   **Description**: `Versi 1`
    *   **Execute as**: `Me` (Saya / email anda)
    *   **Who has access**: `Anyone` (**Siapa saja**)
    *   *(Catatan: Pilihan 'Anyone' sangat penting agar aplikasi React bisa mengakses database tanpa login Google)*.
5.  Klik **Deploy**.
6.  Akan muncul jendela "Authorization required". Klik **Review permissions**.
7.  Pilih akun Google Anda.
8.  Jika muncul peringatan "Google hasn’t verified this app", klik **Advanced** > **Go to ... (unsafe)** > **Allow**.
9.  Salin **Web App URL** yang muncul (Link berawalan `https://script.google.com/macros/s/...`).

## 5. Koneksi ke Aplikasi
1.  Kembali ke kodingan aplikasi ini.
2.  Buka file `services/api.ts`.
3.  Cari variabel `GOOGLE_SCRIPT_URL` di bagian atas.
4.  Tempel URL yang sudah disalin tadi ke situ.OK

Selesai! Aplikasi sekarang sudah terhubung dengan database Google Sheets.
