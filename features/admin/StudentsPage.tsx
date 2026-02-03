
import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { Student } from '../../types';
import { Button } from '../../components/Button';
import { AddStudentModal } from '../../components/AddStudentModal';
import { BulkStudentImportModal } from '../../components/BulkStudentImportModal';
import { Search, Plus, Filter, User, Upload } from 'lucide-react';
import { CLASSES } from '../../constants';

export const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await ApiService.fetchAllStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
    const matchesClass = filterClass ? s.className === filterClass : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Siswa</h2>
          <p className="text-gray-500 text-sm">Master data peserta didik aktif.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
               <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Siswa
            </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Cari Nama atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
         </div>
         <div className="relative">
            <select
               value={filterClass}
               onChange={(e) => setFilterClass(e.target.value)}
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm appearance-none bg-white"
            >
               <option value="">Semua Kelas</option>
               {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                 <tr>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4">NIS</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">L/P</th>
                    <th className="px-6 py-4">Alamat</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {loading ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Memuat data...</td></tr>
                 ) : filteredStudents.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Data tidak ditemukan.</td></tr>
                 ) : (
                    filteredStudents.map((student) => (
                       <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                <User className="w-4 h-4" />
                             </div>
                             {student.name}
                          </td>
                          <td className="px-6 py-3 font-mono text-gray-600">{student.nis}</td>
                          <td className="px-6 py-3">
                             <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs font-bold border border-brand-100">
                               {student.className}
                             </span>
                          </td>
                          <td className="px-6 py-3 text-gray-600">{student.gender}</td>
                          <td className="px-6 py-3 text-gray-500 truncate max-w-[200px]">{student.address || '-'}</td>
                          <td className="px-6 py-3 text-right">
                             <button className="text-brand-600 hover:text-brand-800 text-xs font-bold hover:underline">Edit</button>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>

      <AddStudentModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); fetchStudents(); }} />
      <BulkStudentImportModal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); fetchStudents(); }} />
    </div>
  );
};
