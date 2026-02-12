
import React, { useState } from 'react';
import type { Teacher, Subject } from '../types';
import { BackArrowIcon } from './icons/BackArrowIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AdminViewProps {
  teachers: Teacher[];
  subjects: Subject[];
  onTeachersChange: (teachers: Teacher[]) => void;
  onSubjectsChange: (subjects: Subject[]) => void;
  onBack: () => void;
}

type ActiveTab = 'teachers' | 'subjects';

const AdminView: React.FC<AdminViewProps> = ({ teachers, subjects, onTeachersChange, onSubjectsChange, onBack }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('teachers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Teacher | Subject | null>(null);

  const openModal = (item: Teacher | Subject | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      if (activeTab === 'teachers') {
        onTeachersChange(teachers.filter(t => t.id !== id));
      } else {
        onSubjectsChange(subjects.filter(s => s.id !== id));
      }
    }
  };
  
  const handleSave = (item: Omit<Teacher, 'id'> | Omit<Subject, 'id'>) => {
    if (activeTab === 'teachers') {
        const teacherData = item as Omit<Teacher, 'id'>;
        if (editingItem) { // Edit
            onTeachersChange(teachers.map(t => t.id === editingItem.id ? { ...t, ...teacherData } : t));
        } else { // Add
            const newTeacher: Teacher = { id: self.crypto.randomUUID(), ...teacherData };
            onTeachersChange([...teachers, newTeacher].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })));
        }
    } else { // Subjects
        const subjectData = item as Omit<Subject, 'id'>;
        if (editingItem) { // Edit
            onSubjectsChange(subjects.map(s => s.id === editingItem.id ? { ...s, ...subjectData } : s));
        } else { // Add
            const newSubject: Subject = { id: self.crypto.randomUUID(), ...subjectData };
            onSubjectsChange([...subjects, newSubject].sort((a,b) => a.name.localeCompare(b.name)));
        }
    }
    closeModal();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors duration-200"
        >
          <BackArrowIcon className="h-5 w-5 mr-2" />
          Kembali ke Menu
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-right text-slate-800">Panel Admin</h2>
      </div>

      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`${activeTab === 'teachers' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Kelola Guru
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`${activeTab === 'subjects' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Kelola Mata Pelajaran
            </button>
          </nav>
        </div>
        
        <div className="mt-6">
            <div className="flex justify-end mb-4">
                <button onClick={() => openModal()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tambah {activeTab === 'teachers' ? 'Guru' : 'Mapel'} Baru
                </button>
            </div>
            {activeTab === 'teachers' ? (
                <DataTable title="Daftar Guru" columns={['Kode Guru', 'Nama Guru']} data={teachers} onEdit={openModal} onDelete={handleDelete} />
            ) : (
                <DataTable title="Daftar Mata Pelajaran" columns={['Nama Mata Pelajaran']} data={subjects} onEdit={openModal} onDelete={handleDelete} />
            )}
        </div>
      </div>
       
      {isModalOpen && <AddEditModal item={editingItem} tab={activeTab} onSave={handleSave} onClose={closeModal} />}

      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const DataTable = ({ title, columns, data, onEdit, onDelete }: any) => (
    <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm max-h-[60vh]">
        <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                <tr>
                    {columns.map((col: string) => <th key={col} scope="col" className="px-6 py-3">{col}</th>)}
                    <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item: any, index: number) => (
                    <tr key={item.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        {columns.map((col: string) => {
                            const key = col.toLowerCase().replace(' ', '');
                            return <td key={key} className="px-6 py-4">{item[key === 'kodeguru' ? 'code' : 'name']}</td>
                        })}
                        <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800"><EditIcon className="h-5 w-5" /></button>
                            <button onClick={() => onDelete(item.id)} className="text-red-600 hover:red-800"><TrashIcon className="h-5 w-5" /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const AddEditModal = ({ item, tab, onSave, onClose }: any) => {
    const [formData, setFormData] = useState(() => {
        if (tab === 'teachers') {
            return { code: item?.code || '', name: item?.name || '' };
        }
        return { name: item?.name || '' };
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {item ? 'Edit' : 'Tambah'} {tab === 'teachers' ? 'Guru' : 'Mata Pelajaran'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {tab === 'teachers' && (
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Kode Guru</label>
                                <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-black" />
                            </div>
                        )}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{tab === 'teachers' ? 'Nama Guru' : 'Nama Mata Pelajaran'}</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-black" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" className="rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminView;
