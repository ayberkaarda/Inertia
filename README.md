# 🚀 Neural Link - AI-Powered Project & Talent Management System

Modern ekipler için geliştirilmiş; **Laravel, React, Inertia.js ve Python (FastAPI)** tabanlı, yapay zeka destekli yeni nesil proje, yetenek ve gerçek zamanlı iletişim yönetimi platformu. Fütüristik karanlık tema tasarımı (Dark Mode) ve gelişmiş yetenek eşleştirme algoritmalarıyla öne çıkar.

![Tech Stack](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Inertia.js](https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

## ✨ Öne Çıkan Özellikler

### 🧠 Yapay Zeka Destekli İçgörüler (AI Insights)
* **Akıllı Görev Eşleştirme:** Python/FastAPI motoru kullanılarak, projedeki (sprint) görevler ile kullanıcıların "Tech Stack" ve "Core Skills" verileri çaprazlanır. En yüksek başarı oranına sahip yetenekler otomatik önerilir.
* **Zaman Bekçisi (Time Keeper):** Zamanı geçen aktif sprintleri tespit edip otomatik olarak `Expired` durumuna çeken gelişmiş arka plan mimarisi.
* **Gelişim İndeksi (Growth Calculation):** Kullanıcıların son 30 ve 60 günlük efor/görev zorluğu (complexity) analiz edilerek büyüme ivmeleri hesaplanır.

### ⚡ Gelişmiş Sprint & Görev Panosu (Task Board)
* Takımların kullanacağı "Tech Stack" (Rozetler) ve "Core Skills" seçilebilen aktif sprint sistemi.
* Görevlere karmaşıklık derecesi (1-10★) atama yeteneği.
* Yöneticiler (Admins) için satır içi (inline) hızlı düzenleme, sprint durumlarını (Active, Completed, Expired) anında "Zombi Diriltme" yöntemiyle değiştirebilme yeteneği.

### 🔒 Sprint Vault (Şifreli Kasa / Dropbox)
* **Kural Tabanlı Erişim:** Sadece ilgili sprintteki bir göreve (task) katılmış kullanıcılar o sprintin şifreli kasasına erişebilir.
* **Akıllı Kilit:** Sprint süresi dolduğunda (`Expired`) kasa yeni dosya yüklemelerine karşı otomatik olarak "Locked" durumuna geçer; geçmiş arşiv sadece okunabilir (Read-only) olur.
* Anlık dosya yükleme, silme ve dinamik kapasite (Byte formatlama) gösterimleri.

### 💬 Gerçek Zamanlı Kripto İletişim (Reverb Chat)
* **Uçtan Uca Hissiyatlı UI:** Fütüristik "Encrypted" bağlantı arayüzü.
* **Akıllı Okundu Bilgisi (Read Receipts):** WhatsApp mantığında çalışan sistem; karşı taraf mesajı görmediğinde tek gri tik (`✓`), odaya girdiği anda WebSocket/Reverb üzerinden anlık olarak parlayan çift mor tike (`✓✓`) dönüşür.
* **Saat Dilimi Senkronizasyonu:** Kullanıcıların mesaj saatleri mutlak Türkiye saat dilimine (Europe/Istanbul) senkronize edilerek karışıklıklar önlenmiştir.

### 👥 Dinamik Yetenek Sistemi (Skill Decay)
* Kullanıcıların becerileri zamanla kullanılmadığında "Sessiz Paslanma" (Skill Decay) motoru sayesinde zayıflar ve tecrübe puanları düşer.

---
## 📂 Dizin Yapısı ve Önemli Konumlar

* app/Http/Controllers/Api/: Yapay zeka, dashboard ve dashboard verilerini hazırlayan API denetleyicileri.

* app/Events/: Gerçek zamanlı mesajlaşma ve okundu bilgisi olayları (MessageSent, MessagesRead).

* resources/js/Pages/: Inertia.js ve React ile oluşturulan fütüristik kullanıcı arayüzleri (Sprints/, Chat/, Dropbox/).

* ai-engine/: Kullanıcı/Görev eşleştirmesi yapan FastAPI tabanlı Python mikroservisi.
---

## 🛠️ Kurulum & Çalıştırma (Local Development)

Proje; Laravel (Backend), React (Frontend) ve Python (AI Engine) olmak üzere üç ana ayaktan oluşur.

### 1. Gereksinimler
* PHP 8.2+
* Composer
* Node.js & npm
* Python 3.10+
* MySQL veya PostgreSQL

### 2. Laravel & React Kurulumu

Projeyi klonlayın ve kök dizine gidin:
```bash
git clone <repo-url>
cd inertia

# 2. Bağımlılıkları yükle
composer install
npm install

# 3. Çevresel ayarları yap
cp .env.example .env
php artisan key:generate

# 4. Veritabanını hazırla
php artisan migrate --seed
php artisan storage:link

# 5. Sunucuları başlat (4 ayrı terminalde)
php artisan serve
npm run dev
php artisan reverb:start
php artisan queue:listen

# 6. Yapay Zeka Motoru (Python / FastAPI)
cd ai-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 5000

