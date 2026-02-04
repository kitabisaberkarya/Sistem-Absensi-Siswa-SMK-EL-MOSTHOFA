import React, { useState } from 'react';
import { X, Library, CheckCircle2, Hash, Tag } from 'lucide-react';
import { Button } from './Button';
import { ApiService } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSubjectModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '', category: 'Umum' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ApiService.createSubject(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ code: '', name: '', category: 'Umum' });
        onClose();
      }, 1500);
    } catch (error) {
      alert("Gagal menambahkan mapel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-600 rounded-lg text-white shadow-lg shadow-brand-200">
                <Library className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Tambah Mapel</h3>
                <p className="text-sm text-gray-500">Input mata pelajaran baru.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
             <div className="p-12 flex flex-col items-center justify-center text-center animate-in zoom-in">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                     <CheckCircle2 className="w-10 h-10 text-green-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">Berhasil!</h3>
                 <p className="text-gray-500 mt-2">Mata pelajaran telah ditambahkan.</p>
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Mapel</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            required
                            placeholder="Contoh: MAT"
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 transition-all font-mono"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Mata Pelajaran</label>
                    <input 
                        type="text" 
                        required
                        placeholder="Contoh: Matematika"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                            <option value="Umum">Muatan Umum</option>
                            <option value="Peminatan">Muatan Peminatan</option>
                            <option value="Kejuruan">Produktif / Kejuruan</option>
                            <option value="Mulok">Muatan Lokal</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button variant="ghost" type="button" onClick={onClose}>Batal</Button>
                    <Button type="submit" isLoading={loading}>Simpan</Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};