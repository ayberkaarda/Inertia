<?php

namespace App\Http\Controllers;

use App\Models\Sprint;
use App\Models\SprintFile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class DropboxController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // 🌟 GÜVENLİK DUVARI: Sadece kullanıcının görev aldığı sprintleri getir
        $accessibleSprints = Sprint::with(['files.uploader'])
            ->whereHas('tasks.users', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            })
            ->latest()
            ->get();

        return Inertia::render('Dropbox/Index', [
            'sprints' => $accessibleSprints
        ]);
    }

    public function store(Request $request, Sprint $sprint)
    {
        // 🌟 YENİ KALKAN: Sprint süresi dolduysa işlemi tamamen reddet!
        if ($sprint->status !== 'active') {
            abort(403, 'This sprint has expired. You cannot upload new files to the vault.');
        }

        // 1. Kurşun geçirmez doğrulama (Maks 10MB)
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf,doc,docx,zip,txt|max:10240',
        ]);

        // 2. Çift Dikiş Güvenlik: Yükleme yapan adam o sprintte mi?
        $hasAccess = $sprint->tasks()->whereHas('users', function ($q) {
            $q->where('users.id', Auth::id());
        })->exists();

        if (!$hasAccess) {
            abort(403, 'Just the assigned users can upload files to this sprint.');
        }

        // 3. Dosyayı sunucuya kaydet
        $file = $request->file('file');
        $path = $file->store('dropbox/' . $sprint->id, 'public');

        // 4. Veritabanına işle
        $sprint->files()->create([
            'user_id' => Auth::id(),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->extension(),
            'file_size' => $file->getSize()
        ]);

        return back()->with('message', 'File uploaded successfully! 🚀');
    }

    public function destroy(SprintFile $file)
    {
        // 🌟 YENİ KALKAN: Sprint süresi dolduysa içeriden dosya sildirme!
        if ($file->sprint->status !== 'active') {
            abort(403, 'This sprint has expired. You cannot delete files from the vault.');
        }

        // Sadece dosyayı yükleyen silebilir
        if ($file->user_id !== Auth::id()) {
            abort(403, 'Just the uploader can delete this file.');
        }

        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }

        $file->delete();

        return back()->with('message', 'File deleted successfully.');
    }
}