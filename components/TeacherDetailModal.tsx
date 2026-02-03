
import React from 'react';
import { X, Mail, Phone, BookOpen, CreditCard, Shield, Calendar, MapPin, CheckCircle2, User as UserIcon } from 'lucide-react';
import { User, Role } from '../types';
import clsx from 'clsx';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teacher: User | null;
  onEdit: () => void;
}

export const TeacherDetailModal: React.FC<Props> = ({ isOpen, onClose, teacher, onEdit }) => {
  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-brand-600 to-blue-500 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="px-8 pb-8">
            {/* Profile Avatar */}
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="p-1.5 bg-white rounded-full">
                    <img 
                        src={teacher.avatar} 
                        alt={teacher.name} 
                        className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-md bg-white object-cover" 
                    />
                </div>
                <div className="mb-2">
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1",
                        teacher.status === 'Active' 
                            ? "bg-green-100 text-green-700 border-green-200" 
                            : "bg-gray-100 text-gray-500 border-gray-200"
                    )}>
                        <div className={clsx("w-2 h-2 rounded-full", teacher.status === 'Active' ? 'bg-green-500' : 'bg-gray-400')} />
                        {teacher.status === 'Active' ? 'Active User' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{teacher.name}</h2>
                <p className="text-gray-500 font-medium">{teacher.role === Role.TEACHER ? 'Guru Mata Pelajaran' : teacher.role}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm">
                
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">NIP / NIY</p>
                            <p className="font-mono text-gray-700 font-medium">{teacher.nip || '-'}</p>
                        </div>
                    </div>
                    
                    <div className="h-px bg-gray-200" />
                    
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Bidang Studi</p>
                            <p className="text-gray-700 font-medium">{teacher.subject || '-'}</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div className="flex items-center gap-3">
                         <UserIcon className="w-5 h-5 text-gray-400" />
                         <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Gender</p>
                            <p className="text-gray-700 font-medium">{teacher.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                         </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-brand-600" />
                        <span className="text-gray-600 truncate">{teacher.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-600" />
                        <span className="text-gray-600 font-mono">{teacher.phone || '-'}</span>
                    </div>
                </div>

            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                <Button variant="outline" fullWidth onClick={onClose} className="border-gray-200 hover:bg-gray-50">
                    Tutup
                </Button>
                <Button fullWidth onClick={() => { onClose(); onEdit(); }}>
                    Edit Profil
                </Button>
            </div>

        </div>
      </div>
    </div>
  );
};
