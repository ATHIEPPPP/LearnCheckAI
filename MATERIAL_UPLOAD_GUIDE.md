# 📚 Panduan Upload Materi & Integrasi AI

## Fitur Baru yang Ditambahkan

### 1. **Upload Materi Pembelajaran**

Guru dapat mengupload materi dalam format PDF atau PowerPoint yang akan:

- Disimpan ke database
- Ditampilkan ke siswa yang memiliki mata pelajaran tersebut
- Diproses oleh AI untuk pembelajaran dan generate soal

### 2. **AI Membaca & Mempelajari Materi**

Setiap materi yang diupload akan:

- Diekstrak teksnya secara otomatis (PDF/PPT → teks)
- Dianalisis oleh Google Gemini AI
- Digunakan untuk generate 10-15 soal baru berkualitas
- Ditambahkan ke bank soal mata pelajaran

### 3. **Tampilan Materi di Dashboard Siswa**

Siswa dapat:

- Melihat semua materi yang tersedia untuk mata pelajaran mereka
- Download/view materi yang diupload guru
- Akses materi kapan saja dari SubjectDetail page

## Instalasi Dependencies

### Backend

```bash
cd backend
pip install PyPDF2 python-pptx
# atau
pip install -r requirement.txt
```

### Frontend

Tidak ada dependencies tambahan yang diperlukan (sudah menggunakan library yang ada).

## Cara Menggunakan

### A. Upload Materi (Guru)

1. Login sebagai guru
2. Buka menu "Upload Materi"
3. Pilih mata pelajaran (misal: Biologi)
4. Isi judul materi (misal: "Sistem Pencernaan Manusia")
5. Isi deskripsi (opsional)
6. Upload file PDF atau PPT (max 10MB)
7. Klik "Upload Materi"
8. AI akan memproses materi dan menambahkan soal ke bank

### B. Lihat Materi (Siswa)

1. Login sebagai siswa
2. Klik mata pelajaran Anda di dashboard
3. Pilih tab "Materi Belajar"
4. Klik "Lihat" untuk membuka materi

## Struktur Database

### Tabel `materials`

```sql
- id: Integer (Primary Key)
- title: String (Judul materi)
- description: Text (Deskripsi)
- file_url: Text (Path ke file)
- file_type: String (pdf/ppt/pptx)
- mapel: String (Mata pelajaran)
- uploaded_by: Integer (Foreign Key ke users.id)
- created_at: DateTime (Waktu upload)
```

## API Endpoints Baru

### 1. Upload Materi

```
POST /materials/upload
Content-Type: multipart/form-data

Parameters:
- file: File (PDF/PPT)
- title: String
- description: String (optional)
- subject: String (mata pelajaran)

Response:
{
  "success": true,
  "material_id": 1,
  "title": "Sistem Pencernaan",
  "mapel": "Biologi",
  "questions_generated": 12,
  "ai_result": {...}
}
```

### 2. List Materi

```
GET /materials?mapel=biologi

Response:
[
  {
    "id": 1,
    "title": "Sistem Pencernaan",
    "description": "Materi lengkap tentang...",
    "file_url": "/uploads/biologi_20251207.pdf",
    "file_type": "pdf",
    "mapel": "biologi",
    "uploaded_by": 1,
    "created_at": "2025-12-07T10:00:00"
  }
]
```

### 3. Get Single Material

```
GET /materials/{material_id}

Response:
{
  "id": 1,
  "title": "Sistem Pencernaan",
  ...
}
```

## Alur Kerja AI

1. **Ekstraksi Teks**
   - PDF → PyPDF2.PdfReader
   - PPT → python-pptx Presentation
2. **Proses dengan Gemini AI**

   ```python
   prompt = f"""
   Peran: Guru ahli pembuat soal untuk {mapel}
   Tugas: Baca materi dan buat 10-15 soal berkualitas
   Materi: {material_text}
   Output: JSON array of questions
   """
   ```

3. **Generate Soal**

   - AI menganalisis materi
   - Membuat soal dengan berbagai tingkat kesulitan
   - Format: pilihan ganda dengan penjelasan

4. **Simpan ke Bank Soal**

   - Soal disimpan ke file JSON di `training/soal/{mapel}.json`
   - Auto-increment ID
   - Index di-reload otomatis

5. **Update Materi Text**
   - Teks materi ditambahkan ke `training/materi/{mapel}.txt`
   - Digunakan untuk remedial dan rekomendasi

## Testing

### 1. Test Upload Materi

```bash
# Pastikan backend running
cd backend
python main.py

# Test dengan curl
curl -X POST http://127.0.0.1:8000/materials/upload \
  -F "file=@test.pdf" \
  -F "title=Test Material" \
  -F "subject=biologi" \
  -F "description=Test description"
```

### 2. Test List Materi

```bash
curl http://127.0.0.1:8000/materials?mapel=biologi
```

### 3. Test dari Frontend

1. Jalankan frontend: `npm run dev`
2. Login sebagai guru
3. Upload materi di menu Upload Materi
4. Login sebagai siswa yang memiliki mata pelajaran tersebut
5. Cek apakah materi muncul di SubjectDetail

## Troubleshooting

### Problem: Upload gagal

**Solution:**

- Pastikan file size < 10MB
- Pastikan format PDF atau PPT
- Cek logs backend untuk error detail

### Problem: AI tidak generate soal

**Solution:**

- Pastikan GOOGLE_GEMINI_API_KEY sudah di-set di `.env`
- Cek quota API Gemini
- Lihat logs untuk error dari AI

### Problem: Materi tidak muncul untuk siswa

**Solution:**

- Pastikan siswa memiliki class_id yang sesuai
- Pastikan mapel di database sama persis (case-sensitive)
- Cek dengan `GET /materials?mapel={mapel}`

### Problem: File tidak bisa dibuka

**Solution:**

- Pastikan folder `uploads/` ada dan writable
- Cek path di database (`file_url`)
- Untuk production, gunakan cloud storage (S3, etc)

## Best Practices

1. **File Size**: Batasi upload max 10MB untuk performa
2. **File Format**: Hanya terima PDF/PPT untuk konsistensi
3. **Storage**: Untuk production, gunakan cloud storage (AWS S3, Google Cloud Storage)
4. **AI Processing**: Async processing untuk materi besar (celery/background tasks)
5. **Error Handling**: Berikan feedback jelas ke user saat upload gagal

## Fitur Future Enhancement

- [ ] Preview materi sebelum upload
- [ ] Edit/delete materi
- [ ] Download materi
- [ ] Statistik penggunaan materi
- [ ] Rating materi oleh siswa
- [ ] Auto-categorize materi berdasarkan topik
- [ ] Batch upload multiple files
- [ ] Video support (mp4)
- [ ] Materi interaktif (H5P)

## File Changes Summary

### Backend

- `backend/main.py`:
  - Added imports: UploadFile, File, shutil
  - Added functions: extract_text_from_pdf, extract_text_from_ppt, process_material_with_ai, save_questions_to_bank
  - Added endpoints: POST /materials/upload, GET /materials, GET /materials/{id}
- `backend/requirement.txt`:

  - Added: PyPDF2, python-pptx

- `backend/app/models.py`:
  - Model Material sudah ada

### Frontend

- `learncheck-frontend/src/components/MaterialUpload.jsx`:

  - Updated handleUpload untuk call API backend
  - Added success message dengan info soal yang di-generate

- `learncheck-frontend/src/components/MaterialList.jsx`:

  - Updated untuk fetch dari API backend
  - Added loading state
  - Support file_url dari backend

- `learncheck-frontend/src/components/SubjectDetail.jsx`:
  - Added import MaterialList
  - Replaced mock materials dengan MaterialList component

## Support

Jika ada masalah atau pertanyaan:

1. Check logs backend: `python main.py`
2. Check browser console untuk error frontend
3. Test API dengan Postman/curl
4. Review code di file yang diubah

Happy Learning! 🎓
