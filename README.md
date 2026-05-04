<div align="center">
  <img src="public/images/logo.png" alt="Inertia Portal Logo" width="200" />

  # 🚀 Inertia AI Destekli Gerçek Zamanlı Proje & Yetenek Yönetimi

  *Geleneksel proje yönetimini yapay zeka ve gerçek zamanlı hız ile yeniden tanımlayan, modern iş alanları için tasarlandı.*

  ![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Inertia.js](https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
</div>

---

## 🌌 Proje Vizyonu

Modern ekiplerin ihtiyaçlarına yönelik olarak geliştirilen bu portal, sadece görev atamakla kalmaz; **Yapay Zeka (AI) içgörüleri**[cite: 1] ile ekibin potansiyelini analiz eder, yetenek matrisleri oluşturur[cite: 1] ve **Laravel Reverb**[cite: 1] destekli WebSocket altyapısıyla[cite: 1] sayfayı yenilemeden anlık bir deneyim sunar. Karanlık teması (Dark Mode) ve modern kullanıcı arayüzü ile performans odaklı bir çalışma alanı sağlar.

## ✨ Öne Çıkan Özellikler

*   🤖 **AI Insights:** Proje gidişatını analiz eden ve darboğazları tahmin eden akıllı asistan[cite: 1].
*   🧬 **Dinamik Yetenek Matrisi:** Doğru projeye doğru yeteneği atamayı sağlayan görselleştirilmiş `Talent Matrix` sistemi[cite: 1].
*   ⚡ **Gerçek Zamanlı Akış:** Laravel Reverb[cite: 1] sayesinde görev (`Card`), Sprint ve Pano (`Board`) güncellemelerinde anında ekran senkronizasyonu[cite: 1].
*   🏢 **İzole Çalışma Alanları:** Her ekibin veya projenin kendine ait bağımsız `Workspace` panoları[cite: 1].
*   🏆 **Oyunlaştırma:** Çalışan motivasyonunu artırmak için başarımlara dayalı `Badge` (Rozet) sistemi[cite: 1].
*   🔒 **Güvenli Kimlik Doğrulama:** Laravel Sanctum[cite: 1] ile korunan güvenli oturum yönetimi ve şifre sıfırlama akışları[cite: 1].

## 🛠️ Mimari & Teknoloji Yığını

### Frontend
*   **Kütüphane:** React 18[cite: 1]
*   **Bağlantı Katmanı:** Inertia.js[cite: 1]
*   **Stil:** Tailwind CSS[cite: 1]
*   **Derleyici:** Vite[cite: 1]

### Backend
*   **Framework:** Laravel 11[cite: 1]
*   **Veritabanı:** MySQL / PostgreSQL[cite: 1]
*   **WebSocket:** Laravel Reverb[cite: 1]

---

## 🚀 Kurulum

```bash
# 1. Depoyu klonla
git clone [https://github.com/ayberkaarda/inertia.git](https://github.com/ayberkaarda/inertia.git)
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

# 5. Sunucuları başlat (3 ayrı terminalde)
php artisan serve
npm run dev
php artisan reverb:start