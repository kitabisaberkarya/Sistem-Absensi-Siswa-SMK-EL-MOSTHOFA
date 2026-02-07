
import React, { useState, useEffect } from 'react';
import { Save, School, FileText, Image, Upload, Loader2, Eye, LayoutTemplate } from 'lucide-react';
import { Button } from '../../components/Button';
import { ApiService, SystemSettings } from '../../services/api';
import clsx from 'clsx';

export const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploading, setUploading] = useState<'foundation' | 'school' | null>(null);
  
  const [settings, setSettings] = useState<SystemSettings>({
    schoolName: 'SMK EL MOSTHOFA',
    schoolAddress: 'Jalan Raya Pamekasan - Sumenep KM. 15, Pamekasan, Jawa Timur',
    schoolPhone: '(0324) 123456',
    schoolEmail: 'admin@elmosthofa.sch.id',
    schoolWebsite: 'www.elmosthofa.sch.id',
    foundationName: 'YAYASAN PENDIDIKAN ISLAM AT-TOHIRI',
    schoolLogo: 'https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png',
    foundationLogo: 'https://res.cloudinary.com/dt1nrarpq/image/upload/v1770438319/logo_yayan_at_tohiri_gg8vkq.png'
  });

  useEffect(() => {
    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await ApiService.getSystemSettings();
            if (data) setSettings(prev => ({ ...prev, ...data }));
        } catch (e) {
            console.error("Failed to load settings", e);
        } finally {
            setLoading(false);
        }
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'foundation' | 'school') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
        const response = await ApiService.uploadFile(file);
        if (response.success) {
            setSettings(prev => ({
                ...prev,
                [type === 'foundation' ? 'foundationLogo' : 'schoolLogo']: response.url
            }));
        }
    } catch (error) {
        alert("Gagal mengupload gambar. Pastikan ukuran file < 5MB.");
    } finally {
        setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
        await ApiService.saveSystemSettings(settings);
        alert("Pengaturan berhasil disimpan!");
    } catch (e) {
        alert("Gagal menyimpan pengaturan.");
    } finally {
        setSaveLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-brand-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
       
       <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <School className="w-6 h-6 text-brand-600" /> 
                Pengaturan KOP Surat & Identitas
            </h2>
            <p className="text-gray-500 text-sm mt-1">Konfigurasi ini akan diterapkan pada seluruh cetakan PDF resmi.</p>
          </div>
          <Button onClick={handleSave} isLoading={saveLoading} className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200">
             <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
          </Button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT COLUMN: EDITOR FORM */}
          <div className="space-y-6">
             
             {/* 1. Identitas Yayasan */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-blue-50/50 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Header Atas (Yayasan)</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nama Yayasan</label>
                        <input 
                            type="text" 
                            name="foundationName"
                            value={settings.foundationName} 
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all text-sm font-medium" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Logo Yayasan (Kiri)</label>
                        <div className="flex gap-3 items-center">
                            <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                {uploading === 'foundation' ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                ) : (
                                    <img src={settings.foundationLogo} alt="Yayasan" className="w-full h-full object-contain p-1" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                    <Upload className="w-4 h-4" /> Upload Logo
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'foundation')} />
                                </label>
                                <p className="text-xs text-gray-400 mt-1">Format PNG/JPG. Max 2MB. Disimpan di Google Drive.</p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* 2. Identitas Sekolah */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-brand-50/50 flex items-center gap-2">
                    <School className="w-4 h-4 text-brand-600" />
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Identitas Utama Sekolah</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nama Sekolah</label>
                            <input 
                                type="text" 
                                name="schoolName"
                                value={settings.schoolName} 
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 transition-all text-lg font-bold text-gray-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Website</label>
                            <input 
                                type="text" 
                                name="schoolWebsite"
                                value={settings.schoolWebsite} 
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 transition-all text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                            <input 
                                type="text" 
                                name="schoolEmail"
                                value={settings.schoolEmail} 
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 transition-all text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">No. Telepon</label>
                            <input 
                                type="text" 
                                name="schoolPhone"
                                value={settings.schoolPhone} 
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 transition-all text-sm" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Alamat Lengkap</label>
                        <textarea 
                            name="schoolAddress"
                            value={settings.schoolAddress} 
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 transition-all text-sm min-h-[80px]" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Logo Sekolah (Kanan)</label>
                        <div className="flex gap-3 items-center">
                            <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                {uploading === 'school' ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                ) : (
                                    <img src={settings.schoolLogo} alt="Sekolah" className="w-full h-full object-contain p-1" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                    <Upload className="w-4 h-4" /> Upload Logo
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'school')} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW (STICKY) */}
          <div className="lg:sticky lg:top-24">
             <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-3 bg-gray-900 border-b border-gray-700 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider">Live Preview KOP Surat</span>
                    </div>
                    <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">A4 Document</span>
                </div>
                
                {/* A4 CANVAS SIMULATION */}
                <div className="bg-gray-500 p-6 flex justify-center overflow-auto max-h-[calc(100vh-200px)]">
                    <div className="w-[210mm] min-h-[120mm] bg-white shadow-xl relative p-[10mm] text-gray-900 origin-top transform scale-75 md:scale-90 lg:scale-100 transition-transform">
                        
                        {/* KOP AREA START */}
                        <div className="border-b-4 border-double border-gray-900 pb-4 mb-6 relative">
                            <div className="flex items-center justify-between px-2">
                                {/* Logo Yayasan */}
                                <div className="w-24 h-24 flex items-center justify-center">
                                    <img 
                                        src={settings.foundationLogo} 
                                        alt="Logo Yayasan" 
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                
                                {/* Text Content */}
                                <div className="flex-1 text-center px-4 font-serif">
                                    <h3 className="text-sm font-bold text-gray-800 tracking-wide leading-tight">
                                        {settings.foundationName}
                                    </h3>
                                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider my-2 leading-none scale-y-110">
                                        {settings.schoolName}
                                    </h1>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-600 italic">
                                            Bidang Keahlian: Teknologi Informasi & Komunikasi, Bisnis & Manajemen
                                        </p>
                                        <p className="text-xs text-gray-800 font-medium">
                                            {settings.schoolAddress}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            Telp: {settings.schoolPhone} | Email: {settings.schoolEmail} | Website: {settings.schoolWebsite}
                                        </p>
                                    </div>
                                </div>

                                {/* Logo Sekolah */}
                                <div className="w-24 h-24 flex items-center justify-center">
                                    <img 
                                        src={settings.schoolLogo} 
                                        alt="Logo Sekolah" 
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* KOP AREA END */}

                        {/* Dummy Letter Body */}
                        <div className="space-y-4 px-4 opacity-30 pointer-events-none select-none blur-[1px]">
                            <div className="text-right text-xs">Pamekasan, {new Date().toLocaleDateString('id-ID')}</div>
                            <div className="text-xs">
                                No: 421/001/SMK/2026<br/>
                                Hal: Undangan
                            </div>
                            <div className="h-4"></div>
                            <div className="h-2 bg-gray-200 w-full rounded"></div>
                            <div className="h-2 bg-gray-200 w-11/12 rounded"></div>
                            <div className="h-2 bg-gray-200 w-10/12 rounded"></div>
                            <div className="h-2 bg-gray-200 w-full rounded"></div>
                        </div>

                    </div>
                </div>
                
                <div className="bg-gray-900 p-3 text-center">
                    <p className="text-xs text-gray-400">
                        Pastikan rasio gambar logo proporsional (1:1 atau 3:4) agar tidak terdistorsi.
                    </p>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
};
