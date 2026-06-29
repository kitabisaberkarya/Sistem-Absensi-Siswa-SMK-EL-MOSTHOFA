
import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { Major, Subject, ClassRoom } from '../../types';
import { Button } from '../../components/Button';
import { ConfirmModal } from '../../components/ConfirmModal';
import { AddMajorModal } from '../../components/AddMajorModal';
import { AddSubjectModal } from '../../components/AddSubjectModal';
import { BulkSubjectImportModal } from '../../components/BulkSubjectImportModal';
import { AddClassModal } from '../../components/AddClassModal';
import { useToast } from '../../context/ToastContext';
import { Search, Plus, Upload, Trash2, Pencil, Check, X } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'majors' | 'subjects' | 'classes';

interface EditState {
  id: string;
  fields: Record<string, string>;
}

export const AcademicsPage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('majors');
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal States
  const [isAddMajorOpen, setIsAddMajorOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isImportSubjectOpen, setIsImportSubjectOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  // Confirm Delete
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Inline Edit
  const [editState, setEditState] = useState<EditState | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try { setSubjects(await ApiService.fetchSubjects()); }
    catch { showToast('error', 'Gagal memuat mata pelajaran'); }
    finally { setLoading(false); }
  };

  const fetchMajors = async () => {
    setLoading(true);
    try { setMajors(await ApiService.fetchMajors()); }
    catch { showToast('error', 'Gagal memuat jurusan'); }
    finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try { setClasses(await ApiService.fetchClasses()); }
    catch { showToast('error', 'Gagal memuat kelas'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setEditState(null);
    setSearchTerm('');
    if (activeTab === 'majors') fetchMajors();
    else if (activeTab === 'subjects') fetchSubjects();
    else fetchClasses();
  }, [activeTab]);

  // --- DELETE ---
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      if (activeTab === 'majors') await ApiService.deleteMajor(confirmDelete.id);
      else if (activeTab === 'subjects') await ApiService.deleteSubject(confirmDelete.id);
      else await ApiService.deleteClass(confirmDelete.id);
      showToast('success', 'Berhasil dihapus', `"${confirmDelete.name}" telah dihapus.`);
      if (activeTab === 'majors') fetchMajors();
      else if (activeTab === 'subjects') fetchSubjects();
      else fetchClasses();
    } catch {
      showToast('error', 'Gagal menghapus', 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // --- EDIT ---
  const startEdit = (id: string, fields: Record<string, string>) => {
    setEditState({ id, fields });
  };

  const cancelEdit = () => setEditState(null);

  const saveEdit = async () => {
    if (!editState) return;
    setSaving(true);
    try {
      if (activeTab === 'majors') {
        await ApiService.updateMajor({ id: editState.id, code: editState.fields.code, name: editState.fields.name });
        fetchMajors();
      } else if (activeTab === 'subjects') {
        await ApiService.updateSubject({ id: editState.id, code: editState.fields.code, name: editState.fields.name, category: editState.fields.category });
        fetchSubjects();
      } else {
        await ApiService.updateClass({ id: editState.id, name: editState.fields.name, level: editState.fields.level, major: editState.fields.major });
        fetchClasses();
      }
      showToast('success', 'Berhasil disimpan');
      setEditState(null);
    } catch {
      showToast('error', 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setEditState(prev => prev ? { ...prev, fields: { ...prev.fields, [key]: value } } : null);
  };

  const inlineInput = (key: string, className = '') => (
    <input
      className={clsx('border border-brand-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white', className)}
      value={editState?.fields[key] || ''}
      onChange={e => updateField(key, e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
      autoFocus
    />
  );

  const EditActions = ({ id }: { id: string }) => (
    editState?.id === id ? (
      <div className="flex gap-1 justify-end">
        <button onClick={saveEdit} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={cancelEdit} disabled={saving} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            if (activeTab === 'majors') {
              const m = majors.find(x => x.id === id)!;
              startEdit(id, { code: m.code, name: m.name });
            } else if (activeTab === 'subjects') {
              const s = subjects.find(x => x.id === id)!;
              startEdit(id, { code: s.code, name: s.name, category: s.category });
            } else {
              const c = classes.find(x => x.id === id)!;
              startEdit(id, { name: c.name, level: c.level, major: c.major });
            }
          }}
          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const label = activeTab === 'majors'
              ? (majors.find(x => x.id === id)?.name || id)
              : activeTab === 'subjects'
                ? (subjects.find(x => x.id === id)?.name || id)
                : (classes.find(x => x.id === id)?.name || id);
            setConfirmDelete({ id, name: label });
          }}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )
  );

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
          {(['majors', 'classes', 'subjects'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={clsx(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === tab ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
            )}>
              {tab === 'majors' ? 'Jurusan' : tab === 'classes' ? 'Kelas' : 'Mata Pelajaran'}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
          <div className="relative max-w-sm w-full">
            <input type="text" placeholder="Cari data..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm bg-white" />
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

        {/* Subjects Table */}
        {activeTab === 'subjects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-bold">
                <tr><th className="px-6 py-3">Kode</th><th className="px-6 py-3">Nama Mata Pelajaran</th><th className="px-6 py-3">Kategori</th><th className="px-6 py-3 w-24"></th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">Memuat...</td></tr>
                ) : subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-3 font-mono text-brand-600 font-bold">
                      {editState?.id === s.id ? inlineInput('code', 'w-20') : s.code}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {editState?.id === s.id ? inlineInput('name', 'w-full') : s.name}
                    </td>
                    <td className="px-6 py-3">
                      {editState?.id === s.id
                        ? inlineInput('category', 'w-32')
                        : <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{s.category}</span>}
                    </td>
                    <td className="px-6 py-3"><EditActions id={s.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Majors Table */}
        {activeTab === 'majors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-bold">
                <tr><th className="px-6 py-3">Kode</th><th className="px-6 py-3">Nama Jurusan</th><th className="px-6 py-3 w-24"></th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-400">Memuat...</td></tr>
                ) : majors.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-3 font-mono font-bold">
                      {editState?.id === m.id ? inlineInput('code', 'w-20') : m.code}
                    </td>
                    <td className="px-6 py-3">
                      {editState?.id === m.id ? inlineInput('name', 'w-full') : m.name}
                    </td>
                    <td className="px-6 py-3"><EditActions id={m.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Classes Table */}
        {activeTab === 'classes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-bold">
                <tr><th className="px-6 py-3">Nama Kelas</th><th className="px-6 py-3">Tingkat</th><th className="px-6 py-3">Jurusan</th><th className="px-6 py-3 w-24"></th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">Memuat...</td></tr>
                ) : classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-3 font-bold">
                      {editState?.id === c.id ? inlineInput('name', 'w-32') : c.name}
                    </td>
                    <td className="px-6 py-3">
                      {editState?.id === c.id ? inlineInput('level', 'w-16') : c.level}
                    </td>
                    <td className="px-6 py-3">
                      {editState?.id === c.id ? inlineInput('major', 'w-24') : c.major}
                    </td>
                    <td className="px-6 py-3"><EditActions id={c.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddMajorModal isOpen={isAddMajorOpen} onClose={() => { setIsAddMajorOpen(false); fetchMajors(); }} />
      <AddSubjectModal isOpen={isAddSubjectOpen} onClose={() => { setIsAddSubjectOpen(false); fetchSubjects(); }} />
      <BulkSubjectImportModal isOpen={isImportSubjectOpen} onClose={() => { setIsImportSubjectOpen(false); fetchSubjects(); }} />
      <AddClassModal isOpen={isAddClassOpen} onClose={() => { setIsAddClassOpen(false); fetchClasses(); }} majors={majors} />

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleting}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus "${confirmDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
};
