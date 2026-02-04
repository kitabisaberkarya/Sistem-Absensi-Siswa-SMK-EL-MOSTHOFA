import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { Major, Subject } from '../../types';
import { Button } from '../../components/Button';
import { AddMajorModal } from '../../components/AddMajorModal';
import { AddSubjectModal } from '../../components/AddSubjectModal';
import { 
  BookMarked, 
  BookOpen, 
  Library, 
  Plus, 
  Trash2, 
  Search,
  School,
  Tag
} from 'lucide-react';
import clsx from 'clsx';

type Tab = 'majors' | 'subjects';

export const AcademicsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('majors');
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [isAddMajorOpen, setIsAddMajorOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMajors = async () => {
    setLoading(true);
    try {
      const data = await ApiService.fetchMajors();
      setMajors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await ApiService.fetchSubjects();
      setSubjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'majors') fetchMajors();
    else fetchSubjects();
  }, [activeTab]);

  const handleDeleteMajor = async (id: string, name: string) => {
    if(window.confirm(`Yakin hapus jurusan ${name}?`)) {
        await ApiService.deleteMajor(id);
        fetchMajors();
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if(window.confirm(`Yakin hapus mapel ${name}?`)) {
        await ApiService.deleteSubject(id);
        fetchSubjects();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Akademik</h2>
          <p className="text-gray-500 text-sm">Manajemen program studi dan mata pelajaran sekolah.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
                onClick={() => { setActiveTab('majors'); setSearchTerm(''); }}
                className={clsx(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                    activeTab === 'majors'
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
            >
                <School className="w-4 h-4" />
                Daftar Jurusan
            </button>
            <button
                onClick={() => { setActiveTab('subjects'); setSearchTerm(''); }}
                className={clsx(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                    activeTab === 'subjects'
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
            >
                <Library className="w-4 h-4" />
                Mata Pelajaran
            </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
            <div className="relative max-w-sm w-full">
                <input
                    type="text"
                    placeholder={`Cari ${activeTab === 'majors' ? 'jurusan' : 'mapel'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            <Button onClick={() => activeTab === 'majors' ? setIsAddMajorOpen(true) : setIsAddSubjectOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah {activeTab === 'majors' ? 'Jurusan' : 'Mapel'}
            </Button>
        </div>

        {/* LIST JURUSAN */}
        {activeTab === 'majors' && (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-20">Kode</th>
                            <th className="px-6 py-4">Nama Program Studi</th>
                            <th className="px-6 py-4 text-right w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {majors.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-8 text-gray-500">Data jurusan kosong.</td></tr>
                        ) : (
                            majors.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((major) => (
                                <tr key={major.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono font-bold text-brand-600">{major.code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{major.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteMajor(major.id, major.name)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {/* LIST MAPEL */}
        {activeTab === 'subjects' && (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-24">Kode</th>
                            <th className="px-6 py-4">Nama Mata Pelajaran</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4 text-right w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                         {subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-500">Data mapel kosong.</td></tr>
                        ) : (
                            subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((subject) => (
                                <tr key={subject.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-500">{subject.code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-3 h-3 text-gray-400" />
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">
                                                {subject.category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteSubject(subject.id, subject.name)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}

      </div>

      <AddMajorModal isOpen={isAddMajorOpen} onClose={() => { setIsAddMajorOpen(false); fetchMajors(); }} />
      <AddSubjectModal isOpen={isAddSubjectOpen} onClose={() => { setIsAddSubjectOpen(false); fetchSubjects(); }} />

    </div>
  );
};