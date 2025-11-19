import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Grid,
    Card,
    CardContent,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Button,
} from '@mui/material';
import {
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon,
    Visibility as ViewIcon,
    LocalHospital as MedicalIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Visit, Patient } from '../types';
import { patientService } from '../services/patientService';

const MedicalRecords: React.FC = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [expandedPatient, setExpandedPatient] = useState<string | false>(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterRecords();
    }, [visits, searchTerm, selectedPatient, selectedDiagnosis, startDate, endDate]);

    const loadData = async () => {
        try {
            const [visitsData, patientsData] = await Promise.all([
                patientService.getVisits(),
                patientService.getPatients()
            ]);
            setVisits(visitsData);
            setPatients(patientsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRecords = () => {
        let filtered = visits;

        if (searchTerm) {
            filtered = filtered.filter(visit => {
                const patient = patients.find(p => p.id === visit.patient_id);
                const patientName = patient ? `${patient.first_name} ${patient.last_name}`.toLowerCase() : '';
                return (
                    patientName.includes(searchTerm.toLowerCase()) ||
                    visit.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    visit.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    visit.prescription.some(med =>
                        med.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                );
            });
        }

        if (selectedPatient) {
            filtered = filtered.filter(visit => visit.patient_id === selectedPatient);
        }

        if (selectedDiagnosis) {
            filtered = filtered.filter(visit =>
                visit.diagnosis.toLowerCase().includes(selectedDiagnosis.toLowerCase())
            );
        }

        if (startDate) {
            filtered = filtered.filter(visit =>
                new Date(visit.visit_date) >= startDate
            );
        }

        if (endDate) {
            filtered = filtered.filter(visit =>
                new Date(visit.visit_date) <= endDate
            );
        }

        setFilteredVisits(filtered);
    };

    const getPatientVisits = (patientId: string) => {
        return filteredVisits.filter(visit => visit.patient_id === patientId)
            .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());
    };

    const getUniqueDiagnoses = () => {
        const diagnoses = visits.map(visit => visit.diagnosis);
        return Array.from(new Set(diagnoses)).slice(0, 10); // Top 10 unique diagnoses
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedPatient('');
        setSelectedDiagnosis('');
        setStartDate(null);
        setEndDate(null);
    };

    const handleAccordionChange = (patientId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedPatient(isExpanded ? patientId : false);
    };

    const getPatientName = (patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
    };

    const calculateAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    if (loading) {
        return <Typography>Loading medical records...</Typography>;
    }

    const uniquePatients = Array.from(new Set(filteredVisits.map(v => v.patient_id)));

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Medical Records
                </Typography>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Records
                                </Typography>
                                <Typography variant="h4">
                                    {visits.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Active Patients
                                </Typography>
                                <Typography variant="h4">
                                    {Array.from(new Set(visits.map(v => v.patient_id))).length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Unique Diagnoses
                                </Typography>
                                <Typography variant="h4">
                                    {Array.from(new Set(visits.map(v => v.diagnosis))).length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Filtered Records
                                </Typography>
                                <Typography variant="h4">
                                    {filteredVisits.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Search and Filters */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Patient</InputLabel>
                                <Select
                                    value={selectedPatient}
                                    label="Patient"
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                >
                                    <MenuItem value="">All Patients</MenuItem>
                                    {patients.map(patient => (
                                        <MenuItem key={patient.id} value={patient.id}>
                                            {patient.first_name} {patient.last_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Diagnosis</InputLabel>
                                <Select
                                    value={selectedDiagnosis}
                                    label="Diagnosis"
                                    onChange={(e) => setSelectedDiagnosis(e.target.value)}
                                >
                                    <MenuItem value="">All Diagnoses</MenuItem>
                                    {getUniqueDiagnoses().map(diagnosis => (
                                        <MenuItem key={diagnosis} value={diagnosis}>
                                            {diagnosis.length > 20 ? diagnosis.substring(0, 20) + '...' : diagnosis}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <DatePicker
                                label="From Date"
                                value={startDate}
                                onChange={setStartDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <DatePicker
                                label="To Date"
                                value={endDate}
                                onChange={setEndDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                            <Button onClick={clearFilters} variant="outlined" fullWidth>
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Patient Records Accordion */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Patient Records ({uniquePatients.length} patients)
                    </Typography>
                </Box>

                {uniquePatients.map(patientId => {
                    const patientVisits = getPatientVisits(patientId);
                    const patient = patients.find(p => p.id === patientId);

                    if (!patient) return null;

                    return (
                        <Accordion
                            key={patientId}
                            expanded={expandedPatient === patientId}
                            onChange={handleAccordionChange(patientId)}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <MedicalIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6">
                                            {patient.first_name} {patient.last_name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {calculateAge(patient.date_of_birth)} years • {patient.gender} • {patientVisits.length} visits
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={patientVisits.length > 0 ? 'Active' : 'No Visits'}
                                        color={patientVisits.length > 0 ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {patientVisits.length === 0 ? (
                                    <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                                        No visit records found for this patient with current filters.
                                    </Typography>
                                ) : (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Visit Date</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Diagnosis</TableCell>
                                                    <TableCell>Medications</TableCell>
                                                    <TableCell>Notes</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {patientVisits.map((visit) => (
                                                    <TableRow key={visit.id} hover>
                                                        <TableCell>
                                                            {new Date(visit.visit_date).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={visit.visit_type}
                                                                size="small"
                                                                color={visit.visit_type === 'OPD' ? 'primary' : 'secondary'}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {visit.diagnosis}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box>
                                                                {visit.prescription.map((med, index) => (
                                                                    <Chip
                                                                        key={index}
                                                                        label={med.name}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ mr: 0.5, mb: 0.5 }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                                                {visit.notes || '-'}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    );
                })}

                {uniquePatients.length === 0 && (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="textSecondary">
                            {visits.length === 0 ? 'No medical records found. Start by recording patient visits.' : 'No records match your search criteria.'}
                        </Typography>
                    </Paper>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default MedicalRecords;