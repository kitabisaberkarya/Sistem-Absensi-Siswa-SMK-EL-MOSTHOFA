import React, { useState, useEffect } from 'react';
import { X, User, Hash, School, MapPin, Phone, CheckCircle2, GraduationCap } from 'lucide-react';
import { Button } from './Button';
import { ApiService } from '../services/api';
import { CreateStudentPayload, ClassRoom } from '../types';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [classList, setClassList] = useState<ClassRoom[]>([]);
  const [formData, setFormData] = useState<CreateStudentPayload>({
    name: '',
    nis: '',
    className: '',
    gender: 'L',
    parentPhone: '',
    address: ''
  });

  // Fetch classes when modal opens
  useEffect(() => {
    if (isOpen) {
        const fetchClasses = async () => {
            try {
                const classes = await ApiService.fetchClasses();
                setClassList(classes.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.error("Failed to fetch classes", error);
            }
        };
        fetchClasses();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ApiService.createStudent(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({
            name: '',
            nis: '',
            className: '',
            gender: 'L',
            parentPhone: '',
            address: ''
        });
      }, 2000);
    } catch (error: any) {
      alert(error.message || "Gagal menambahkan siswa.");
    } finally {
      setLoading(false);
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
                <h3 className="text-xl font-bold text-gray-900">Input Data Siswa</h3>
                <p className="text-sm text-gray-500">Master data siswa aktif tahun ajaran ini.</p>
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
                 <h3 className="text-2xl font-bold text-gray-900">Siswa Ditambahkan!</h3>
                 <p className="text-gray-500 mt-2 max-w-sm">
                    Data siswa <strong>{formData.name}</strong> telah masuk ke database kelas {formData.className}.
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
                            placeholder="2023xxxx"
                            value={formData.nis}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono text-sm"
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
                            placeholder="Nama sesuai akta kelahiran"
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
                            placeholder="08xxxxxxxxxx"
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
                            placeholder="Jalan, Desa, Kecamatan..."
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all min-h-[100px]"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={onClose}>Batal</Button>
                <Button type="submit" isLoading={loading} className="px-6">Simpan Siswa</Button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};