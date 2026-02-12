
import React, { useState, useEffect, useMemo } from 'react';
import type { TeachingAssignment } from '../types';
import { BackArrowIcon } from './icons/BackArrowIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface DataManagementViewProps {
  assignments: TeachingAssignment[];
  onAssignmentsChange: (assignments: TeachingAssignment[]) => void;
  onBack: () => void;
  schoolFilterType?: 'MTs' | 'MA'; // New prop
}

const DataManagementView: React.FC<DataManagementViewProps> = ({ assignments, onAssignmentsChange, onBack, schoolFilterType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeachingAssignment | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Filter assignments based on schoolFilterType
  const filteredAssignments = useMemo(() => {
    if (!schoolFilterType) {
      return assignments;
    }
    return assignments.filter(assignment => 
      schoolFilterType === 'MTs' ? assignment.teachesInMts : assignment.teachesInMa
    );
  }, [assignments, schoolFilterType]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage('');
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const openModal = (item: TeachingAssignment | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data penugasan ini?')) {
      onAssignmentsChange(assignments.filter(a => a.id !== id));
      setNotificationMessage('Data penugasan berhasil dihapus.');
      setShowNotification(true);
    }
  };
  
  const handleSave = (itemData: Omit<TeachingAssignment, 'id'>) => {
    // If adding a new item and a school filter is active, ensure the corresponding flag is true
    if (!editingItem && schoolFilterType) {
      if (schoolFilterType === 'MTs') itemData.teachesInMts = true;
      if (schoolFilterType === 'MA') itemData.teachesInMa = true;
    }

    if (editingItem) { // Edit
        onAssignmentsChange(assignments.map(a => a.id === editingItem.id ? { ...editingItem, ...itemData } : a));
    } else { // Add
        const newAssignment: TeachingAssignment = { id: self.crypto.randomUUID(), ...itemData };
        onAssignmentsChange([...assignments, newAssignment].sort((a,b) => a.teacherCode.localeCompare(b.teacherCode, undefined, {numeric: true}) || a.subjectName.localeCompare(b.subjectName)));
    }
    closeModal();
    setNotificationMessage(`Data penugasan berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}.`);
    setShowNotification(true);
  };
  
  const handleCheckboxChange = (id: string, field: 'teachesInMts' | 'teachesInMa', value: boolean) => {
    onAssignmentsChange(assignments.map(a => a.id === id ? { ...a, [field]: value } : a));
    setNotificationMessage('Penugasan jenjang berhasil diperbarui.');
    setShowNotification(true);
  };

  const viewTitle = schoolFilterType ? `Kelola Data Penugasan ${schoolFilterType}` : 'Kelola Data Penugasan';

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full animate-fade-in">
      {showNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 ease-in-out opacity-100">
          {notificationMessage}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors duration-200">
          <BackArrowIcon className="h-5 w-5 mr-2" />
          Kembali ke Menu
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-right text-slate-800">{viewTitle}</h2>
      </div>
      
      <div className="flex justify-end mb-4">
          <button onClick={() => openModal()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Tambah Data Baru
          </button>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm max-h-[70vh]">
          <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                  <tr>
                      <th scope="col" className="px-6 py-3">Kode Guru</th>
                      <th scope="col" className="px-6 py-3">Nama Guru</th>
                      <th scope="col" className="px-6 py-3">Mata Pelajaran</th>
                      <th scope="col" className="px-3 py-3 text-center">MTs</th>
                      <th scope="col" className="px-3 py-3 text-center">MA</th>
                      <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                  </tr>
              </thead>
              <tbody>
                  {filteredAssignments.map((item, index) => (
                      <tr key={item.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="px-6 py-4 font-medium text-gray-900">{item.teacherCode}</td>
                          <td className="px-6 py-4">{item.teacherName}</td>
                          <td className="px-6 py-4">{item.subjectName}</td>
                          <td className="px-3 py-4 text-center">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={item.teachesInMts} onChange={(e) => handleCheckboxChange(item.id, 'teachesInMts', e.target.checked)} />
                          </td>
                          <td className="px-3 py-4 text-center">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={item.teachesInMa} onChange={(e) => handleCheckboxChange(item.id, 'teachesInMa', e.target.checked)} />
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                              <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800"><EditIcon className="h-5 w-5" /></button>
                              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:red-800"><TrashIcon className="h-5 w-5" /></button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
       
      {isModalOpen && <AddEditModal item={editingItem} onSave={handleSave} onClose={closeModal} schoolFilterType={schoolFilterType} />}

      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

interface AddEditModalProps {
  item: TeachingAssignment | null;
  onSave: (data: Omit<TeachingAssignment, 'id'>) => void;
  onClose: () => void;
  schoolFilterType?: 'MTs' | 'MA'; // Prop for modal
}

const AddEditModal = ({ item, onSave, onClose, schoolFilterType }: AddEditModalProps) => {
    const [formData, setFormData] = useState({
        teacherCode: item?.teacherCode || '',
        teacherName: item?.teacherName || '',
        subjectName: item?.subjectName || '',
        teachesInMts: item?.teachesInMts || (schoolFilterType === 'MTs' ? true : false), // Default for new items
        teachesInMa: item?.teachesInMa || (schoolFilterType === 'MA' ? true : false),     // Default for new items
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const modalTitle = item 
      ? `Edit Data Penugasan`
      : `Tambah Data Penugasan ${schoolFilterType ? schoolFilterType : ''}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {modalTitle}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="teacherCode" className="block text-sm font-medium text-gray-700">Kode Guru</label>
                            <input type="text" name="teacherCode" id="teacherCode" value={formData.teacherCode} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-black" />
                        </div>
                        <div>
                            <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700">Nama Guru</label>
                            <input type="text" name="teacherName" id="teacherName" value={formData.teacherName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-black" />
                        </div>
                        <div>
                            <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700">Nama Mata Pelajaran</label>
                            <input type="text" name="subjectName" id="subjectName" value={formData.subjectName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-black" />
                        </div>
                        <fieldset className="border-t border-gray-200 pt-4">
                            <legend className="text-sm font-medium text-gray-900">Penugasan Jenjang</legend>
                            <div className="mt-2 space-y-2">
                                <div className="relative flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input 
                                          id="teachesInMts" 
                                          name="teachesInMts" 
                                          type="checkbox" 
                                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                                          checked={formData.teachesInMts} 
                                          onChange={handleChange} 
                                          disabled={schoolFilterType === 'MTs' && !item} // Disable if adding new in MTs view
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="teachesInMts" className="font-medium text-gray-700">MTs (Madrasah Tsanawiyah)</label>
                                    </div>
                                </div>
                                <div className="relative flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input 
                                          id="teachesInMa" 
                                          name="teachesInMa" 
                                          type="checkbox" 
                                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                                          checked={formData.teachesInMa} 
                                          onChange={handleChange} 
                                          disabled={schoolFilterType === 'MA' && !item} // Disable if adding new in MA view
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="teachesInMa" className="font-medium text-gray-700">MA (Madrasah Aliyah)</label>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
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

export default DataManagementView;