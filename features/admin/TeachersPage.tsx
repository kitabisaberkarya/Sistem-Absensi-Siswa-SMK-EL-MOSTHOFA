
import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { User } from '../../types';
import { Button } from '../../components/Button';
import { AddTeacherModal } from '../../components/AddTeacherModal';
import { BulkImportModal } from '../../components/BulkImportModal';
import { Search, Plus, Upload, MoreHorizontal, Mail, Phone, BookOpen } from 'lucide-react';
import clsx from 'clsx';

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.fetchTeachers();
      setTeachers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Guru</h2>
          <p className="text-gray-500 text-sm">Manajemen tenaga pengajar dan staf.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="bg-white border border-gray-200 text-gray-700">
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Guru
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-bold text-gray-900">{filteredTeachers.length}</span> Guru terdaftar
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse h-48"></div>
          ))
        ) : filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
             <div className="absolute top-4 right-4">
                <button className="text-gray-400 hover:text-brand-600">
                   <MoreHorizontal className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex items-center gap-4 mb-4">
                <img src={teacher.avatar} alt={teacher.name} className="w-14 h-14 rounded-full border-2 border-gray-100" />
                <div>
                   <h3 className="font-bold text-gray-900 line-clamp-1">{teacher.name}</h3>
                   <div className="flex items-center gap-1.5 mt-1">
                     <span className={clsx("w-2 h-2 rounded-full", teacher.status === 'Inactive' ? 'bg-gray-400' : 'bg-green-500')}></span>
                     <span className="text-xs text-gray-500 font-medium">{teacher.role === 'TEACHER' ? 'Guru Mapel' : teacher.role}</span>
                   </div>
                </div>
             </div>

             <div className="space-y-2 text-sm text-gray-600 mb-4">
               <div className="flex items-center gap-3">
                 <Mail className="w-4 h-4 text-gray-400" />
                 <span className="truncate">{teacher.email}</span>
               </div>
               <div className="flex items-center gap-3">
                 <Phone className="w-4 h-4 text-gray-400" />
                 <span>{teacher.phone || '-'}</span>
               </div>
               <div className="flex items-center gap-3">
                 <BookOpen className="w-4 h-4 text-gray-400" />
                 <span className="font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{teacher.subject || 'Umum'}</span>
               </div>
             </div>

             <div className="pt-4 border-t border-gray-100 flex gap-2">
               <button className="flex-1 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded border border-gray-200">
                 Detail
               </button>
               <button className="flex-1 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded border border-brand-200">
                 Edit
               </button>
             </div>
          </div>
        ))}
      </div>

      {!loading && filteredTeachers.length === 0 && (
         <div className="text-center py-12 text-gray-500">
           Tidak ada data guru ditemukan.
         </div>
      )}

      {/* Modals */}
      <AddTeacherModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); fetchTeachers(); }} />
      <BulkImportModal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); fetchTeachers(); }} />
    </div>
  );
};