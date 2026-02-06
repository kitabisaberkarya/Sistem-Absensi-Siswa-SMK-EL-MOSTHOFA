import React, { useState, useEffect } from 'react';
import { X, User, Hash, School, MapPin, Phone, CheckCircle2, GraduationCap, Trash2, Save } from 'lucide-react';
import { Button } from './Button';
import { ApiService } from '../services/api';
import { UpdateStudentPayload, Student, ClassRoom } from '../types';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const EditStudentModal: React.FC<Props> = ({ isOpen, onClose, student }) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [classList, setClassList] = useState<ClassRoom[]>([]);
  const [formData, setFormData] = useState<UpdateStudentPayload>({
    id: '',
    name: '',
    nis: '',
    className: '',
    gender: 'L',
    parentPhone: '',
    address: ''
  });

  // Fetch classes & sync data
  useEffect(() => {
    if (isOpen) {
        // Fetch classes
        const fetchClasses = async () => {
            try {
                const classes = await ApiService.fetchClasses();
                setClassList(classes.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.error("Failed to fetch classes", error);
            }
        };
        fetchClasses();

        // Sync Student Data
        if (student) {
            setFormData({
                id: student.id,
                name: student.name,
                nis: student.nis,
                className: student.className,
                gender: student.gender,
                parentPhone: student.parentPhone || '',
                address: student.address || ''
            });
        }
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ApiService.updateStudent(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error: any) {
      alert(error.message || "Gagal memperbarui data siswa.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus siswa ${formData.name}? Data absensi terkait mungkin akan terpengaruh.`)) {
        setDeleteLoading(true);
        try {
            await ApiService.deleteStudent(formData.id);
            onClose();
        } catch (error: any) {
            alert(error.message || "Gagal menghapus siswa.");
        } finally {
            setDeleteLoading(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-600 rounded-lg text-white shadow-lg shadow-brand-200">
                <GraduationCap className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Data Siswa</h3>
                <p className="text-sm text-gray-500">Perbarui informasi peserta didik.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {success ? (
             <div className="p-12 flex flex-col items-center justify-center text-center animate-in zoom-in">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                     <CheckCircle2 className="w-10 h-10 text-green-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">Data Diperbarui!</h3>
                 <p className="text-gray-500 mt-2 max-w-sm">
                    Informasi siswa <strong>{formData.name}</strong> berhasil disimpan.
                 </p>
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* NIS */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NIS (Nomor Induk)</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            name="nis"
                            required
                            value={formData.nis}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono text-sm bg-gray-50"
                            readOnly
                            title="NIS tidak dapat diubah (Primary Key)"
                        />
                    </div>
                </div>

                {/* Class */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                    <div className="relative">
                        <School className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                            name="className"
                            required
                            value={formData.className}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all appearance-none bg-white"
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Name */}
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                        />
                    </div>
                </div>

                {/* Gender */}
                <div className="col-span-2">
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

                {/* Parent Phone */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. HP Orang Tua</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="tel" 
                            name="parentPhone"
                            required
                            value={formData.parentPhone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Domisili</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <textarea 
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all min-h-[100px]"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between gap-3">
                <Button 
                    type="button" 
                    variant="danger" 
                    onClick={handleDelete} 
                    isLoading={deleteLoading}
                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus Siswa
                </Button>
                <div className="flex gap-3">
                    <Button variant="ghost" type="button" onClick={onClose}>Batal</Button>
                    <Button type="submit" isLoading={loading} className="px-6">
                        <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                    </Button>
                </div>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};