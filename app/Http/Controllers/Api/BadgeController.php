<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BadgeController extends Controller
{
    public function store(Request $request)
    {
        // 1. Doğrulama (icon'un zorunlu olduğundan emin olalım)
    $request->validate([
        'name' => 'required|string|max:255',
        'icon' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048', 
    ]);

    // 2. Değişkeni başta tanımla veya doğrudan yüklemeden gelen değeri al
    $path = null;

    if ($request->hasFile('icon')) {
        $path = $request->file('icon')->store('badges', 'public');
    }

    // Eğer $path hala null ise (validation'dan kaçarsa diye bir güvenlik önlemi)
    if (!$path) {
        return back()->withErrors(['icon' => 'Image could not be uploaded.']);
    }

    // 3. Veritabanına Kaydet
    \App\Models\Badge::create([
        'name' => $request->name,
        'icon' => $path,
    ]);

    return back()->with('success', 'Badge created successfully!');
}
}