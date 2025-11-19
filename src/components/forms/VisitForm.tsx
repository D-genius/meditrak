import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box,
    Typography,
    IconButton,
    Chip,
    Divider,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Visit, Patient, Medication } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface VisitFormProps {
    open: boolean;
    visit?: Visit | null;
    patients: Patient[];
    onClose: () => void;
    onSubmit: (data: Omit<Visit, 'id' | 'created_at' | 'updated_at'>) => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ open, visit, patients, onClose, onSubmit }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        patientId: '',
        visitDate: new Date(),
        visitType: 'OPD' as 'OPD' | 'IPD' | 'Emergency',
        diagnosis: '',
        notes: '',
    });
    const [medications, setMedications] = useState<Medication[]>([
        { id: '1', name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (visit) {
            setFormData({
                patientId: visit.patient_id,
                visitDate: new Date(visit.visit_date),
                visitType: visit.visit_type,
                diagnosis: visit.diagnosis,
                notes: visit.notes || '',
            });
            setMedications(visit.prescription.length > 0
                ? visit.prescription
                : [{ id: '1', name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
            );
        } else {
            setFormData({
                patientId: '',
                visitDate: new Date(),
                visitType: 'OPD',
                diagnosis: '',
                notes: '',
            });
            setMedications([{ id: '1', name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
        }
        setErrors({});
    }, [visit, open]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.patientId) {
            newErrors.patientId = 'Patient is required';
        }
        if (!formData.diagnosis.trim()) {
            newErrors.diagnosis = 'Diagnosis is required';
        }
        if (!formData.visitDate) {
            newErrors.visitDate = 'Visit date is required';
        }

        // Validate medications
        medications.forEach((med, index) => {
            if (med.name && (!med.dosage || !med.frequency || !med.duration)) {
                newErrors[`medication_${index}`] = 'Complete all medication fields or remove empty ones';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Filter out empty medications
        const validMedications = medications.filter(med =>
            med.name && med.dosage && med.frequency && med.duration
        );

        // Convert camelCase to snake_case for backend
        const submitData = {
            patient_id: formData.patientId,
            visit_date: formData.visitDate.toISOString(),
            visit_type: formData.visitType,
            diagnosis: formData.diagnosis,
            prescription: validMedications,
            created_by: user?.id || '',
            notes: formData.notes || '',
        };

        onSubmit(submitData as any);
    };

    const handleFormChange = (field: string) => (value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const addMedication = () => {
        setMedications(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: ''
            }
        ]);
    };

    const removeMedication = (index: number) => {
        if (medications.length > 1) {
            setMedications(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        setMedications(prev =>
            prev.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        );
    };

    const frequencyOptions = [
        'Once daily',
        'Twice daily',
        'Three times daily',
        'Four times daily',
        'Every 6 hours',
        'Every 8 hours',
        'Every 12 hours',
        'As needed',
        'Before meals',
        'After meals',
        'At bedtime'
    ];

    const durationOptions = [
        '1 day',
        '3 days',
        '5 days',
        '7 days',
        '10 days',
        '14 days',
        '21 days',
        '30 days',
        'Until finished',
        'As needed'
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {visit ? 'Edit Visit Record' : 'Record New Visit'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Patient Selection */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth error={!!errors.patientId}>
                                    <InputLabel>Patient *</InputLabel>
                                    <Select
                                        value={formData.patientId}
                                        label="Patient *"
                                        onChange={(e) => handleFormChange('patientId')(e.target.value)}
                                    >
                                        {patients.map(patient => (
                                            <MenuItem key={patient.id} value={patient.id}>
                                                {patient.first_name} {patient.last_name}
                                                {patient.date_of_birth && ` (${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}y)`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.patientId && (
                                        <Typography variant="caption" color="error">
                                            {errors.patientId}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            {/* Visit Date */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <DatePicker
                                    label="Visit Date *"
                                    value={formData.visitDate}
                                    onChange={handleFormChange('visitDate')}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!errors.visitDate,
                                            helperText: errors.visitDate
                                        }
                                    }}
                                />
                            </Grid>

                            {/* Visit Type */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Visit Type</InputLabel>
                                    <Select
                                        value={formData.visitType}
                                        label="Visit Type"
                                        onChange={(e) => handleFormChange('visitType')(e.target.value)}
                                    >
                                        <MenuItem value="OPD">OPD (Outpatient)</MenuItem>
                                        <MenuItem value="IPD">IPD (Inpatient)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Diagnosis */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    required
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Diagnosis *"
                                    value={formData.diagnosis}
                                    onChange={handleTextChange('diagnosis')}
                                    error={!!errors.diagnosis}
                                    helperText={errors.diagnosis || "Enter the primary diagnosis and any secondary diagnoses"}
                                />
                            </Grid>

                            {/* Medications Section */}
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Prescribed Medications
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Add medications prescribed during this visit
                                    </Typography>
                                </Box>

                                {medications.map((medication, index) => (
                                    <Box key={medication.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">
                                                Medication {index + 1}
                                            </Typography>
                                            {medications.length > 1 && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => removeMedication(index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Medication Name"
                                                    value={medication.name}
                                                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                    placeholder="e.g., Amoxicillin, Paracetamol"
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Dosage"
                                                    value={medication.dosage}
                                                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                    placeholder="e.g., 500mg, 10ml"
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Frequency</InputLabel>
                                                    <Select
                                                        value={medication.frequency}
                                                        label="Frequency"
                                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                    >
                                                        {frequencyOptions.map(option => (
                                                            <MenuItem key={option} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Duration</InputLabel>
                                                    <Select
                                                        value={medication.duration}
                                                        label="Duration"
                                                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                    >
                                                        {durationOptions.map(option => (
                                                            <MenuItem key={option} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    label="Special Instructions"
                                                    value={medication.instructions}
                                                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                    placeholder="e.g., Take with food, Avoid alcohol, etc."
                                                />
                                            </Grid>
                                        </Grid>

                                        {errors[`medication_${index}`] && (
                                            <Alert severity="error" sx={{ mt: 1 }}>
                                                {errors[`medication_${index}`]}
                                            </Alert>
                                        )}
                                    </Box>
                                ))}

                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={addMedication}
                                    variant="outlined"
                                    size="small"
                                >
                                    Add Another Medication
                                </Button>
                            </Grid>

                            {/* Notes */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Clinical Notes"
                                    value={formData.notes}
                                    onChange={handleTextChange('notes')}
                                    placeholder="Additional observations, treatment plan, follow-up instructions, etc."
                                />
                            </Grid>

                            {/* Preview of Selected Patient */}
                            {formData.patientId && (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Selected Patient:
                                        </Typography>
                                        {(() => {
                                            const patient = patients.find(p => p.id === formData.patientId);
                                            if (!patient) return null;

                                            const age = patient.date_of_birth
                                                ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
                                                : 'Unknown';

                                            return (
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip label={`${patient.first_name} ${patient.last_name}`} />
                                                    <Chip label={`${age} years`} variant="outlined" />
                                                    <Chip label={patient.gender} variant="outlined" />
                                                    {patient.phone && <Chip label={patient.phone} variant="outlined" />}
                                                </Box>
                                            );
                                        })()}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {visit ? 'Update Visit' : 'Record Visit'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    );
};

export default VisitForm;