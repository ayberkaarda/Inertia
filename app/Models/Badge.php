<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $fillable = ['name', 'category', 'icon'];

    // React tarafında doğrudan kullanabilmen için bu alanı JSON'a otomatik ekliyoruz
    protected $appends = ['image_url'];

    // Resmin tam URL'ini üreten sihirli fonksiyon
    public function getImageUrlAttribute()
    {
        if ($this->icon) {
            // Eğer resim yüklendiyse public/storage klasöründen yolunu ver
            return asset('storage/' . $this->icon);
        }
        
        // Eğer resim yüklenmemişse varsayılan bir yıldız veya boş rozet resmi göster
        return asset('assets/images/default-badge.png'); 
    }
}