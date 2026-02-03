
import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, BookOpen, User, CreditCard, CheckCircle2, Lock } from 'lucide-react';
import { Button } from './Button';
import { ApiService } from '../services/api';
import { CreateTeacherPayload } from '../types';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTeacherModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CreateTeacherPayload>({
    fullName: '',
    nip: '',
    email: '',
    password: '',
    phone: '',
    subject: '',
    gender: 'L',
    status: 'Active'
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ApiService.createTeacher(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({
            fullName: '',
            nip: '',
            email: '',
            password: '',
            phone: '',
            subject: '',
            gender: 'L',
            status: 'Active'
        });
      }, 2000);
    } catch (error) {
      alert("Gagal menambahkan guru. Silakan coba lagi.");
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
                <h3 className="text-xl font-bold text-gray-900">Registrasi Guru Baru</h3>
                <p className="text-sm text-gray-500">Input data lengkap tenaga pengajar ke database.</p>
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
                 <h3 className="text-2xl font-bold text-gray-900">Registrasi Berhasil!</h3>
                 <p className="text-gray-500 mt-2 max-w-sm">
                    Data guru <strong>{formData.fullName}</strong> telah tersimpan. Kredensial login akan dikirimkan melalui email.
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
                            placeholder="Contoh: Budi Santoso, S.Pd., M.Si."
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* NIP */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NIP / NIY</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            name="nip"
                            required
                            placeholder="19850101 201001 1 001"
                            value={formData.nip}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white font-mono text-sm"
                        />
                    </div>
                </div>

                {/* Subject */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran Utama</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
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
                        </select>
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Sekolah</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="email" 
                            name="email"
                            required
                            placeholder="nama@sekolah.sch.id"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password Awal</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            name="password"
                            required
                            placeholder="Min. 6 karakter"
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
                            placeholder="0812-xxxx-xxxx"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Gender & Status */}
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
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status Kepegawaian</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                    >
                        <option value="Active">Aktif Mengajar</option>
                        <option value="Inactive">Cuti / Non-Aktif</option>
                    </select>
                </div>

            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={onClose}>Batal</Button>
                <Button type="submit" isLoading={loading} className="px-6">Simpan Data Guru</Button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};