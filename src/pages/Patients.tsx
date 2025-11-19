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
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { Patient } from '../types';
import { patientService } from '../services/patientService';
import PatientForm from '../components/forms/PatientForm';
import { useAuth } from '../contexts/AuthContext';

const Patients: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        loadPatients();
    }, []);

    useEffect(() => {
        const filtered = patients.filter(patient =>
            patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm) ||
            patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPatients(filtered);
    }, [searchTerm, patients]);

    const loadPatients = async () => {
        try {
            const data = await patientService.getPatients();
            setPatients(data);
            setFilteredPatients(data);
        } catch (error) {
            console.error('Failed to load patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            await patientService.createPatient(patientData);
            await loadPatients();
            setFormOpen(false);
        } catch (error) {
            console.error('Failed to create patient:', error);
        }
    };

    const handleUpdatePatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
        if (!selectedPatient) return;

        try {
            await patientService.updatePatient(selectedPatient.id, patientData);
            await loadPatients();
            setFormOpen(false);
            setSelectedPatient(null);
        } catch (error) {
            console.error('Failed to update patient:', error);
        }
    };

    const handleDeletePatient = async () => {
        if (!patientToDelete) return;

        try {
            await patientService.deletePatient(patientToDelete.id);
            await loadPatients();
            setDeleteDialogOpen(false);
            setPatientToDelete(null);
        } catch (error) {
            console.error('Failed to delete patient:', error);
        }
    };

    const openEditForm = (patient: Patient) => {
        setSelectedPatient(patient);
        setFormOpen(true);
    };

    const openDeleteDialog = (patient: Patient) => {
        setPatientToDelete(patient);
        setDeleteDialogOpen(true);
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setSelectedPatient(null);
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
        return <Typography>Loading patients...</Typography>;
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Patients
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setFormOpen(true)}
                >
                    Add Patient
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Patients
                            </Typography>
                            <Typography variant="h4">
                                {patients.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                This Month
                            </Typography>
                            <Typography variant="h4">
                                {patients.filter(p => {
                                    const created = new Date(p.created_at);
                                    const now = new Date();
                                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                                }).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search Bar */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search patients by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                />
            </Paper>

            {/* Patients Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Emergency Contact</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPatients.map((patient) => (
                            <TableRow key={patient.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2">
                                        {patient.first_name} {patient.last_name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {calculateAge(patient.date_of_birth)} years
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={patient.gender}
                                        size="small"
                                        color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'secondary' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>{patient.phone}</TableCell>
                                <TableCell>{patient.email || '-'}</TableCell>
                                <TableCell>{patient.emergency_contact || '-'}</TableCell>
                                <TableCell>
                                    {new Date(patient.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        onClick={() => openEditForm(patient)}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => openDeleteDialog(patient)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredPatients.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="textSecondary">
                            {patients.length === 0 ? 'No patients found. Add your first patient!' : 'No patients match your search.'}
                        </Typography>
                    </Box>
                )}
            </TableContainer>

            {/* Patient Form Dialog */}
            <PatientForm
                open={formOpen}
                patient={selectedPatient}
                onClose={handleFormClose}
                onSubmit={selectedPatient ? handleUpdatePatient : handleCreatePatient}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete patient {patientToDelete?.first_name} {patientToDelete?.last_name}?
                        This action cannot be undone and all associated visits will also be deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeletePatient} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Patients;