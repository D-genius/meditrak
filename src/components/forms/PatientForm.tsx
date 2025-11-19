import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from '@mui/material';
import { Patient } from '../../types';

interface PatientFormProps {
  open: boolean;
  patient?: Patient | null;
  onClose: () => void;
  onSubmit: (data: Omit<Patient, 'id' | 'created_at' | 'update_at'>) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ open, patient, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
    address: '',
    insuranceInfo: '',
    emergencyContact: '',
    medicalHistory: '',
  });

  React.useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.first_name,
        lastName: patient.last_name,
        dateOfBirth: patient.date_of_birth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email || '',
        address: patient.address || '',
        insuranceInfo: patient.insurance_info || '',
        emergencyContact: patient.emergency_contact || '',
        medicalHistory: patient.medical_history || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '' as 'male' | 'female' | 'other',
        phone: '',
        email: '',
        address: '',
        insuranceInfo: '',
        emergencyContact: '',
        medicalHistory: '',
      });
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert camelCase to snake_case for backend
    const submitData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      insurance_info: formData.insuranceInfo || undefined,
      emergency_contact: formData.emergencyContact || undefined,
      medical_history: formData.medicalHistory || undefined,
    };
    onSubmit(submitData as any);
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {patient ? 'Edit Patient' : 'Add New Patient'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                select
                label="Gender"
                value={formData.gender}
                onChange={handleChange('gender')}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Insurance Info"
                value={formData.insuranceInfo}
                onChange={handleChange('insuranceInfo')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={handleChange('emergencyContact')}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Medical History"
                value={formData.medicalHistory}
                onChange={handleChange('medicalHistory')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {patient ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PatientForm;