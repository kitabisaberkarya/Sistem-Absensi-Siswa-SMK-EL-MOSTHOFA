
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Phone, BookOpen, User, CreditCard, CheckCircle2, Lock, Shield, Save } from 'lucide-react';
import { Button } from './Button';
import { ApiService } from '../services/api';
import { UpdateTeacherPayload, Role, User as UserType } from '../types';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teacher: UserType | null;
}

export const EditTeacherModal: React.FC<Props> = ({ isOpen, onClose, teacher }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<UpdateTeacherPayload>({
    id: '',
    fullName: '',
    nip: '',
    email: '',
    password: '',
    phone: '',
    subject: '',
    role: Role.TEACHER,
    gender: 'L',
    status: 'Active'
  });

  useEffect(() => {
    if (teacher && isOpen) {
      setFormData({
        id: teacher.id,
        fullName: teacher.name,
        nip: teacher.nip || '',
        email: teacher.email,
        password: '', // Leave blank to keep existing
        phone: teacher.phone || '',
        subject: teacher.subject || '',
        role: teacher.role,
        gender: teacher.gender || 'L',
        status: (teacher.status as 'Active' | 'Inactive') || 'Active'
      });
    }
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-adjust subject if role changes
    if (name === 'role') {
        setFormData(prev => ({ 
            ...prev, 
            [name]: value as Role,
            subject: (value === Role.PRINCIPAL || value === Role.COUNSELOR) ? '-' : prev.subject
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value } as UpdateTeacherPayload));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ApiService.updateTeacher(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      alert("Gagal memperbarui data guru. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-600 rounded-lg text-white shadow-lg shadow-brand-200">
                <UserPlus className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Data Pengguna</h3>
                <p className="text-sm text-gray-500">Perbarui informasi tenaga pengajar/staff.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        {success ? (
             <div className="p-12 flex flex-col items-center justify-center text-center animate-in zoom-in">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                     <CheckCircle2 className="w-10 h-10 text-green-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">Update Berhasil!</h3>
                 <p className="text-gray-500 mt-2 max-w-sm">
                    Perubahan data untuk <strong>{formData.fullName}</strong> telah disimpan.
                 </p>
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap & Gelar</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Role Selector */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jabatan / Role</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white font-medium text-gray-800"
                        >
                            <option value={Role.TEACHER}>Guru Mapel</option>
                            <option value={Role.COUNSELOR}>Guru BK</option>
                            <option value={Role.PRINCIPAL}>Kepala Sekolah</option>
                            <option value={Role.ADMIN}>Administrator</option>
                        </select>
                    </div>
                </div>

                {/* NIP */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NIP / NIY</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            name="nip"
                            required
                            value={formData.nip}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white font-mono text-sm"
                        />
                    </div>
                </div>

                {/* Subject */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                         {formData.role === Role.TEACHER ? (
                            <select
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white appearance-none"
                            >
                                <option value="">-- Pilih Mapel --</option>
                                <option value="Matematika">Matematika</option>
                                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                                <option value="Bahasa Inggris">Bahasa Inggris</option>
                                <option value="IPA">IPA (Fisika/Kimia/Bio)</option>
                                <option value="IPS">IPS (Sejarah/Geo/Eko)</option>
                                <option value="PAI">Pendidikan Agama</option>
                                <option value="BK">Bimbingan Konseling</option>
                            </select>
                        ) : (
                            <input 
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500"
                            />
                        )}
                    </div>
                </div>

                {/* Email (Read Only recommended, but editable per request) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Sekolah</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Password Field (Optional on Edit) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reset Password <span className="text-gray-400 font-normal">(Kosongkan jika tetap)</span>
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            name="password"
                            placeholder="Isi untuk ganti password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. WhatsApp</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="tel" 
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
                    <div className="flex gap-4">
                        <label className={clsx(
                            "flex-1 border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all",
                            formData.gender === 'L' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                        )}>
                            <input type="radio" name="gender" value="L" checked={formData.gender === 'L'} onChange={handleChange} className="hidden" />
                            <span className="font-medium">Laki-laki</span>
                        </label>
                        <label className={clsx(
                            "flex-1 border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all",
                            formData.gender === 'P' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'border-gray-200 hover:bg-gray-50'
                        )}>
                            <input type="radio" name="gender" value="P" checked={formData.gender === 'P'} onChange={handleChange} className="hidden" />
                            <span className="font-medium">Perempuan</span>
                        </label>
                    </div>
                </div>
                
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status Kepegawaian</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={clsx(
                            "w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 focus:bg-white font-bold",
                            formData.status === 'Active' ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-500 border-gray-200'
                        )}
                    >
                        <option value="Active">Aktif Mengajar</option>
                        <option value="Inactive">Cuti / Non-Aktif</option>
                    </select>
                </div>

            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={onClose}>Batal</Button>
                <Button type="submit" isLoading={loading} className="px-6 bg-brand-600 hover:bg-brand-700">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                </Button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};
