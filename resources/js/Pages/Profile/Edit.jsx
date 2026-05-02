import SidebarHeaderLayout from '@/Layouts/SidebarHeaderLayout';
import { router } from '@inertiajs/react';
import { Head, usePage } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    // usePage üzerinden güncel kullanıcı verisini alıyoruz
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);

    // Avatar yolunu belirleyen yardımcı fonksiyon
    const getAvatarPath = (currentUser) => {
        if (currentUser.avatar) {
            return currentUser.avatar.startsWith('http') ? currentUser.avatar : `/storage/${currentUser.avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=8b5cf6&color=fff&bold=true`;
    };

    const [avatarPreview, setAvatarPreview] = useState(getAvatarPath(user));
    const [uploadStatus, setUploadStatus] = useState('');

    // KRİTİK: Backend'den gelen user verisi değiştiğinde (router.reload sonrası) önizlemeyi tazele
    useEffect(() => {
        setAvatarPreview(getAvatarPath(user));
    }, [user.avatar, user.name]);

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Dosya Türü Kontrolü
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setUploadStatus('Only JPG, PNG or WEBP format can be uploaded! ❌');
            return;
        }

        // Dosya Boyutu Kontrolü (Max 2MB)
        if (file.size > 2 * 1024 * 1024) { 
            setUploadStatus('File size exceeds 2MB limit! ❌');
            return;
        }

        // Seçildiği anda geçici önizleme oluştur
        setAvatarPreview(URL.createObjectURL(file));
        setUploadStatus('loading... ⏳');

        const formData = new FormData();
        formData.append('avatar', file);

        axios.post('/user/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
            setUploadStatus('Avatar successfully updated! ✅');
            
            // Inertia'yı sayfadaki 'auth' verisini (kullanıcıyı) güncellemesi için zorla
            router.reload({ only: ['auth'] }); 
            
            setTimeout(() => setUploadStatus(''), 3000);
        })
        .catch(error => {
            console.error("Upload error:", error);
            const errorMsg = error.response?.data?.message || 'Upload failed! ❌';
            setUploadStatus(errorMsg);
            // Hata durumunda önizlemeyi eski haline getir
            setAvatarPreview(getAvatarPath(user));
        });
    };
    return (
        <SidebarHeaderLayout auth={auth} pageTitle="Profile Settings">
            <Head title="Profile" />

            <div className="flex flex-col gap-6 pb-10 max-w-5xl mx-auto">
                
                {/* 📌 AVATAR YÜKLEME KARTI */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 shadow-2xl rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
                    {/* Arka plan parlama efekti */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

                    {/* Tıklanabilir Yuvarlak Fotoğraf Alanı */}
                    <div 
                        className="relative w-32 h-32 rounded-full cursor-pointer group overflow-hidden border-4 border-[#2a1354] hover:border-purple-500 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)] flex-shrink-0 z-10"
                        onClick={handleImageClick}
                    >
                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                        
                        {/* Hover efekti ile çıkan kamera simgesi */}
                        <div className={`absolute inset-0 bg-[#0f0822]/70 flex items-center justify-center transition-opacity backdrop-blur-sm ${uploadStatus.includes('loading') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <span className="text-purple-300 text-sm font-bold tracking-widest uppercase text-center px-2">
            {uploadStatus.includes('loading') ? 'Neural Link...' : '📷 Change'}
        </span>
    </div>
                    </div>

                    {/* Gerçek dosya seçici (Ekranda görünmez) */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/jpeg, image/png, image/webp" 
                    />

                    {/* Bilgi ve Durum Mesajları */}
                    <div className="text-center sm:text-left z-10 flex-1">
                        <h3 className="text-2xl font-black text-white tracking-wide">Avatar Upload</h3>
                        <p className="mt-2 text-sm text-slate-400 font-medium">
                            Click on the image to update your neural avatar. <br/>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">(Max 2MB - JPG, PNG, WEBP)</span>
                        </p>
                        
                        {/* Başarı/Hata Bildirimi */}
                        <div className="h-6 mt-3">
                            {uploadStatus && (
                                <p className={`text-sm font-bold tracking-wide transition-all ${uploadStatus.includes('failed') || uploadStatus.includes('❌') ? 'text-red-400' : uploadStatus.includes('Uploading') ? 'text-blue-400' : 'text-emerald-400'}`}>
                                    {uploadStatus}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 📌 PROFILE INFORMATION KARTI */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                {/* 📌 UPDATE PASSWORD KARTI */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-purple-500/20 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                {/* 📌 DELETE ACCOUNT KARTI */}
                <div className="bg-[#160d33]/90 backdrop-blur-xl border border-red-500/20 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] rounded-full pointer-events-none"></div>
                    <DeleteUserForm className="max-w-xl relative z-10" />
                </div>
                
            </div>
        </SidebarHeaderLayout>
    );
}