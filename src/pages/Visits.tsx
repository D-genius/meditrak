import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Chip,
    Grid,
    Card,
    CardContent,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Visit, Patient } from '../types';
import { patientService } from '../services/patientService';
import VisitForm from '../components/forms/VisitForm';

const Visits: React.FC = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);

    // Filters
    const [patientFilter, setPatientFilter] = useState('');
    const [visitTypeFilter, setVisitTypeFilter] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterVisits();
    }, [visits, patientFilter, visitTypeFilter, startDate, endDate]);

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

    const filterVisits = () => {
        let filtered = visits;

        if (patientFilter) {
            filtered = filtered.filter(visit =>
                visit.patient_id === patientFilter
            );
        }

        if (visitTypeFilter) {
            filtered = filtered.filter(visit =>
                visit.visit_type === visitTypeFilter
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

    const handleCreateVisit = async (visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            await patientService.createVisit(visitData);
            await loadData();
            setFormOpen(false);
        } catch (error) {
            console.error('Failed to create visit:', error);
        }
    };

    const handleUpdateVisit = async (visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at'>) => {
        if (!selectedVisit) return;

        try {
            await patientService.updateVisit(selectedVisit.id, visitData);
            await loadData();
            setFormOpen(false);
            setSelectedVisit(null);
        } catch (error) {
            console.error('Failed to update visit:', error);
        }
    };

    const handleDeleteVisit = async () => {
        if (!visitToDelete) return;

        try {
            await patientService.deleteVisit(visitToDelete.id);
            await loadData();
            setDeleteDialogOpen(false);
            setVisitToDelete(null);
        } catch (error) {
            console.error('Failed to delete visit:', error);
        }
    };

    const openEditForm = (visit: Visit) => {
        setSelectedVisit(visit);
        setFormOpen(true);
    };

    const openDeleteDialog = (visit: Visit) => {
        setVisitToDelete(visit);
        setDeleteDialogOpen(true);
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setSelectedVisit(null);
    };

    const clearFilters = () => {
        setPatientFilter('');
        setVisitTypeFilter('');
        setStartDate(null);
        setEndDate(null);
    };

    const getPatientName = (patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
    };

    if (loading) {
        return <Typography>Loading visits...</Typography>;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">
                        Clinical Visits
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setFormOpen(true)}
                    >
                        Record Visit
                    </Button>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Visits
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
                                    OPD Visits
                                </Typography>
                                <Typography variant="h4" color="primary">
                                    {visits.filter(v => v.visit_type === 'OPD').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    IPD Visits
                                </Typography>
                                <Typography variant="h4" color="secondary">
                                    {visits.filter(v => v.visit_type === 'IPD').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Today's Visits
                                </Typography>
                                <Typography variant="h4">
                                    {visits.filter(v => {
                                        const visitDate = new Date(v.visit_date).toDateString();
                                        const today = new Date().toDateString();
                                        return visitDate === today;
                                    }).length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Patient</InputLabel>
                                <Select
                                    value={patientFilter}
                                    label="Patient"
                                    onChange={(e) => setPatientFilter(e.target.value)}
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
                                <InputLabel>Visit Type</InputLabel>
                                <Select
                                    value={visitTypeFilter}
                                    label="Visit Type"
                                    onChange={(e) => setVisitTypeFilter(e.target.value)}
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    <MenuItem value="OPD">OPD</MenuItem>
                                    <MenuItem value="IPD">IPD</MenuItem>
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Button onClick={clearFilters} variant="outlined" fullWidth>
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Visits Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Visit Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Diagnosis</TableCell>
                                <TableCell>Medications</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredVisits.map((visit) => (
                                <TableRow key={visit.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {getPatientName(visit.patient_id)}
                                        </Typography>
                                    </TableCell>
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
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                            {visit.diagnosis}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                            {visit.prescription.length} medications
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                            {visit.notes || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => openEditForm(visit)}
                                            size="small"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => openDeleteDialog(visit)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredVisits.length === 0 && (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="textSecondary">
                                {visits.length === 0 ? 'No visits recorded. Record your first visit!' : 'No visits match your filters.'}
                            </Typography>
                        </Box>
                    )}
                </TableContainer>

                {/* Visit Form Dialog */}
                <VisitForm
                    open={formOpen}
                    visit={selectedVisit}
                    patients={patients}
                    onClose={handleFormClose}
                    onSubmit={selectedVisit ? handleUpdateVisit : handleCreateVisit}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this visit record? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDeleteVisit} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default Visits;