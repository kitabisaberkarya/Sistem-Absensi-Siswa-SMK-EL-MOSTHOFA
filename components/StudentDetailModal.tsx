import React from 'react';
import { X, User, Hash, School, MapPin, Phone, GraduationCap } from 'lucide-react';
import { Student } from '../types';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEdit: () => void;
}

export const StudentDetailModal: React.FC<Props> = ({ isOpen, onClose, student, onEdit }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-cyan-400 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="px-8 pb-8">
            {/* Profile Avatar */}
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="p-1.5 bg-white rounded-full">
                    <div className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-md bg-gray-50 flex items-center justify-center overflow-hidden text-6xl select-none">
                         {student.gender === 'L' ? '👨‍🎓' : '👩‍🎓'}
                    </div>
                </div>
                <div className="mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Siswa Aktif
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                   <School className="w-4 h-4 text-brand-500" />
                   <p className="text-gray-500 font-medium">{student.className}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Nomor Induk Siswa (NIS)</p>
                            <p className="font-mono text-gray-700 font-medium tracking-wide">{student.nis}</p>
                        </div>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="flex items-center gap-3">
                         <User className="w-5 h-5 text-gray-400" />
                         <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Jenis Kelamin</p>
                            <p className="text-gray-700 font-medium">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                         </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                           <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Kontak Orang Tua / Wali</p>
                           <span className="text-gray-700 font-mono font-medium">{student.parentPhone || '-'}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                           <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Alamat Domisili</p>
                           <span className="text-gray-700 leading-relaxed">{student.address || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                <Button variant="outline" fullWidth onClick={onClose} className="hover:bg-gray-50">
                    Tutup
                </Button>
                <Button fullWidth onClick={() => { onClose(); onEdit(); }} className="bg-brand-600 hover:bg-brand-700">
                    Edit Data
                </Button>
            </div>

        </div>
      </div>
    </div>
  );
};