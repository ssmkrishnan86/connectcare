import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Upload } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PatientStatsBar } from '../components/PatientStatsBar';
import { PatientFilters } from '../components/PatientFilters';
import { PatientTable } from '../components/PatientTable';
import { Pagination } from '@/components/common/Pagination';
import { PatientCreateModal } from '../components/PatientCreateModal';
import { api } from '@/lib/api';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = () => {
    api.getPatients(searchTerm, statusFilter, unitFilter)
      .then((data) => {
        setPatients(data || []);
      })
      .catch((err) => console.error('Error fetching patients:', err));
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, statusFilter, unitFilter]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const pName = p.name || '';
      const pId = p.patientIdCode || p.id || '';
      const pPhone = p.phone || '';
      const pEmail = p.email || '';
      const pRisk = p.riskLevel || 'Medium';

      const matchesSearch =
        pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pPhone.includes(searchTerm) ||
        pEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk = riskFilter === 'All' || pRisk === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [patients, searchTerm, riskFilter]);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const handleAddPatient = async (newPatientData: any) => {
    try {
      await api.createPatient(newPatientData);
      fetchPatients();
    } catch (err) {
      console.error('Failed to create patient', err);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Patients - Patient List"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Patients', href: '/patients' },
          { label: 'Patient List' },
        ]}
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors">
              <Upload className="h-4 w-4" /> Import Patients
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add New Patient
            </button>
          </>
        }
      />

      <PatientStatsBar />

      <PatientFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        unitFilter={unitFilter}
        onUnitChange={setUnitFilter}
        riskFilter={riskFilter}
        onRiskChange={setRiskFilter}
      />

      <PatientTable patients={paginatedPatients} />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredPatients.length / pageSize) || 1}
        totalResults={filteredPatients.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="patients"
      />

      <PatientCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPatient={handleAddPatient}
      />
    </div>
  );
};

export default PatientsPage;
