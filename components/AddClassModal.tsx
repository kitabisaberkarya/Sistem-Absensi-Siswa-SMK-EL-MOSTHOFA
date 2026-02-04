import React, { useState } from 'react';
import { X, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { ApiService } from '../services/api';
import { Major } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  majors: Major[];
}

export const AddClassModal: React.FC<Props> = ({ isOpen, onClose, majors }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ 
    level: '10', 
    majorCode: '', 
    suffix: '1',
    customName: '' 
  });
  const [useCustomName, setUseCustomName] = useState(false);

  if (!isOpen) return null;

  const getGeneratedName = () => {
    if (!formData.majorCode) return '...';
    return `${formData.level}-${formData.majorCode}-${formData.suffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Construct final payload
    const finalName = useCustomName ? formData.customName : getGeneratedName();
    
    if (!finalName || finalName === '...') {
        alert("Nama kelas tidak valid.");
        setLoading(false);
        return;
    }

    try {
      await ApiService.createClass({
        name: finalName,
        level: formData.level,
        major: formData.majorCode || 'UMUM'
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ level: '10', majorCode: '', suffix: '1', customName: '' });
        onClose();
      }, 1500);
    } catch (error) {
      alert("Gagal menambahkan kelas.");
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
                <LayoutGrid className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Tambah Kelas</h3>
                <p className="text-sm text-gray-500">Buat rombongan belajar baru.</p>
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
                 <p className="text-gray-500 mt-2">Kelas baru telah ditambahkan.</p>
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tingkat</label>
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                            <option value="10">Kelas 10</option>
                            <option value="11">Kelas 11</option>
                            <option value="12">Kelas 12</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jurusan</label>
                        <select
                            value={formData.majorCode}
                            onChange={(e) => setFormData({...formData, majorCode: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                            <option value="">Pilih...</option>
                            {majors.map(m => (
                                <option key={m.id} value={m.code}>{m.code}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {!useCustomName ? (
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Indeks Kelas</label>
                        <div className="flex items-center gap-3">
                             <input 
                                type="number" 
                                min="1" max="20"
                                value={formData.suffix}
                                onChange={(e) => setFormData({...formData, suffix: e.target.value})}
                                className="w-20 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 text-center font-bold"
                             />
                             <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-500">
                                 Preview: <span className="font-bold text-gray-900">{getGeneratedName()}</span>
                             </div>
                        </div>
                     </div>
                ) : (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Kelas (Custom)</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Contoh: X Unggulan"
                            value={formData.customName}
                            onChange={(e) => setFormData({...formData, customName: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="customName" 
                        checked={useCustomName} 
                        onChange={(e) => setUseCustomName(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="customName" className="text-sm text-gray-600">Gunakan nama custom manual</label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button variant="ghost" type="button" onClick={onClose}>Batal</Button>
                    <Button type="submit" isLoading={loading} disabled={!useCustomName && !formData.majorCode}>Simpan</Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};