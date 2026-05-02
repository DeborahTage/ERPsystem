import React, { useEffect, useState } from 'react';
import { Button, Card, Nav, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { vetApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils';
import { toast } from 'react-toastify';

const VeterinaryPage = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [diseaseCases, setDiseaseCases] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([vetApi.getVaccinations(), vetApi.getDiseaseCases(), vetApi.getTreatments(), vetApi.getPrescriptions()])
      .then(([v, d, t, p]) => {
        setVaccinations(v.data.data || []);
        setDiseaseCases(d.data.data || []);
        setTreatments(t.data.data || []);
        setPrescriptions(p.data.data || []);
      }).finally(() => setLoading(false));
  }, []);

  const completeVaccination = async (id) => {
    await vetApi.completeVaccination(id);
    setVaccinations(v => v.map(x => x.id === id ? { ...x, status: 'COMPLETED' } : x));
    toast.success('Vaccination marked complete');
  };

  const dispense = async (id) => {
    await vetApi.dispensePrescription(id);
    setPrescriptions(p => p.map(x => x.id === id ? { ...x, status: 'DISPENSED' } : x));
    toast.success('Prescription dispensed');
  };

  const vaccinationCols = [
    { key: 'farmName', label: 'Farm' }, { key: 'batchCode', label: 'Batch' },
    { key: 'vaccineName', label: 'Vaccine' },
    { key: 'scheduledDate', label: 'Scheduled', render: r => formatDate(r.scheduledDate) },
    { key: 'actualDate', label: 'Actual', render: r => formatDate(r.actualDate) },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: r => r.status === 'SCHEDULED' && <Button size="sm" variant="outline-success" onClick={() => completeVaccination(r.id)}>Complete</Button> },
  ];

  const diseaseCols = [
    { key: 'farmName', label: 'Farm' }, { key: 'suspectedDisease', label: 'Disease' },
    { key: 'dateDetected', label: 'Detected', render: r => formatDate(r.dateDetected) },
    { key: 'severity', label: 'Severity', render: r => <StatusBadge status={r.severity} /> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'numberAffected', label: 'Affected' },
  ];

  const treatmentCols = [
    { key: 'farmName', label: 'Farm' }, { key: 'drugName', label: 'Drug' },
    { key: 'dosage', label: 'Dosage' }, { key: 'startDate', label: 'Start', render: r => formatDate(r.startDate) },
    { key: 'endDate', label: 'End', render: r => formatDate(r.endDate) },
    { key: 'vetOfficer', label: 'Vet Officer' }, { key: 'outcome', label: 'Outcome' },
  ];

  const prescriptionCols = [
    { key: 'prescriptionNumber', label: 'Rx No.' }, { key: 'drugName', label: 'Drug' },
    { key: 'quantity', label: 'Qty' }, { key: 'dosageInstruction', label: 'Instructions' },
    { key: 'createdByVet', label: 'Vet' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: r => r.status === 'PENDING' && <Button size="sm" variant="outline-success" onClick={() => dispense(r.id)}>Dispense</Button> },
  ];

  return (
    <div>
      <h5 className="fw-bold mb-3">Veterinary Records</h5>
      <Tab.Container defaultActiveKey="vaccinations">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item><Nav.Link eventKey="vaccinations">Vaccinations</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="disease">Disease Cases</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="treatments">Treatments</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="prescriptions">Prescriptions</Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="vaccinations">
            <div className="d-flex justify-content-end mb-2">
              <Button size="sm" variant="success" onClick={() => navigate('/veterinary/vaccinations/new')}>+ Schedule Vaccination</Button>
            </div>
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={vaccinationCols} data={vaccinations} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
          <Tab.Pane eventKey="disease">
            <div className="d-flex justify-content-end mb-2">
              <Button size="sm" variant="success" onClick={() => navigate('/veterinary/disease-cases/new')}>+ Record Disease Case</Button>
            </div>
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={diseaseCols} data={diseaseCases} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
          <Tab.Pane eventKey="treatments">
            <div className="d-flex justify-content-end mb-2">
              <Button size="sm" variant="success" onClick={() => navigate('/veterinary/treatments/new')}>+ Record Treatment</Button>
            </div>
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={treatmentCols} data={treatments} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
          <Tab.Pane eventKey="prescriptions">
            <div className="d-flex justify-content-end mb-2">
              <Button size="sm" variant="success" onClick={() => navigate('/veterinary/prescriptions/new')}>+ Create Prescription</Button>
            </div>
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={prescriptionCols} data={prescriptions} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default VeterinaryPage;
