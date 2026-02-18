
import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { Major, Subject, ClassRoom } from '../../types';
import { Button } from '../../components/Button';
import { AddMajorModal } from '../../components/AddMajorModal';
import { AddSubjectModal } from '../../components/AddSubjectModal';
import { BulkSubjectImportModal } from '../../components/BulkSubjectImportModal';
import { AddClassModal } from '../../components/AddClassModal';
import { Search, Plus, Upload } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'majors' | 'subjects' | 'classes';

export const AcademicsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('majors');
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [isAddMajorOpen, setIsAddMajorOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isImportSubjectOpen, setIsImportSubjectOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubjects = async () => {
      setLoading(true);
      try {
          const data = await ApiService.fetchSubjects();
          setSubjects(data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'majors') {
        const load = async () => {
            setLoading(true);
            try { setMajors(await ApiService.fetchMajors()); } 
            catch(e){} finally { setLoading(false); }
        };
        load();
    }
    else if (activeTab === 'subjects') fetchSubjects();
    else {
        const load = async () => {
            setLoading(true);
            try { setClasses(await ApiService.fetchClasses()); } 
            catch(e){} finally { setLoading(false); }
        };
        load();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Akademik</h2>
          <p className="text-gray-500 text-sm">Manajemen program studi, kelas, dan mata pelajaran sekolah.</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('majors')} className={clsx("whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors", activeTab === 'majors' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500")}>Jurusan</button>
            <button onClick={() => setActiveTab('classes')} className={clsx("whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors", activeTab === 'classes' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500")}>Kelas</button>
            <button onClick={() => setActiveTab('subjects')} className={clsx("whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors", activeTab === 'subjects' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500")}>Mata Pelajaran</button>
        </nav>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
            <div className="relative max-w-sm w-full">
                <input type="text" placeholder={`Cari data...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm bg-white" />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            
            <div className="flex gap-2">
                {activeTab === 'subjects' && (
                    <Button variant="secondary" onClick={() => setIsImportSubjectOpen(true)} className="bg-white border border-gray-200 text-green-700 hover:bg-green-50">
                        <Upload className="w-4 h-4 mr-2" /> Import Excel
                    </Button>
                )}
                <Button onClick={() => activeTab === 'majors' ? setIsAddMajorOpen(true) : activeTab === 'subjects' ? setIsAddSubjectOpen(true) : setIsAddClassOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Tambah Data
                </Button>
            </div>
        </div>

        {activeTab === 'subjects' && (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-bold">
                        <tr><th className="px-6 py-3">Kode</th><th className="px-6 py-3">Nama Mata Pelajaran</th><th className="px-6 py-3">Kategori</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                         {subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
                             <tr key={s.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-3 font-mono text-brand-600 font-bold">{s.code}</td>
                                 <td className="px-6 py-3 font-medium text-gray-900">{s.name}</td>
                                 <td className="px-6 py-3">
                                     <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{s.category}</span>
                                 </td>
                             </tr>
                         ))}
                    </tbody>
                </table>
             </div>
        )}
        
        {activeTab === 'majors' && (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-bold"><tr><th className="px-6 py-3">Kode</th><th className="px-6 py-3">Nama Jurusan</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                         {majors.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((m) => (
                             <tr key={m.id} className="hover:bg-gray-50"><td className="px-6 py-3 font-mono font-bold">{m.code}</td><td className="px-6 py-3">{m.name}</td></tr>
                         ))}
                    </tbody>
                </table>
             </div>
        )}

        {activeTab === 'classes' && (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-bold"><tr><th className="px-6 py-3">Nama Kelas</th><th className="px-6 py-3">Tingkat</th><th className="px-6 py-3">Jurusan</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                         {classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((c) => (
                             <tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-3 font-bold">{c.name}</td><td className="px-6 py-3">{c.level}</td><td className="px-6 py-3">{c.major}</td></tr>
                         ))}
                    </tbody>
                </table>
             </div>
        )}
      </div>

      <AddMajorModal isOpen={isAddMajorOpen} onClose={() => { setIsAddMajorOpen(false); /* refresh */ }} />
      <AddSubjectModal isOpen={isAddSubjectOpen} onClose={() => { setIsAddSubjectOpen(false); fetchSubjects(); }} />
      <BulkSubjectImportModal isOpen={isImportSubjectOpen} onClose={() => { setIsImportSubjectOpen(false); fetchSubjects(); }} />
      <AddClassModal isOpen={isAddClassOpen} onClose={() => { setIsAddClassOpen(false); /* refresh */ }} majors={majors} />
    </div>
  );
};
