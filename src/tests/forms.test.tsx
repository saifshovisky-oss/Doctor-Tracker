import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const createDoctor = vi.fn();
const createPatient = vi.fn();

vi.mock('@/lib/hooks/use-data', () => ({
  useCreateDoctor: () => ({ mutateAsync: createDoctor, isPending: false }),
  useUpdateDoctor: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreatePatient: () => ({ mutateAsync: createPatient, isPending: false }),
  useUpdatePatient: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDoctors: () => ({
    data: { data: [{ id: 'doc-1', name: 'Dr. Who', specialization: 'Cardiology' }], totalItems: 1 },
    isPending: false,
    isError: false,
  }),
}));

import { DoctorForm } from '@/components/doctors/doctor-form';
import { PatientForm } from '@/components/patients/patient-form';

describe('CRUD forms', () => {
  beforeEach(() => {
    createDoctor.mockReset().mockResolvedValue({ id: '1' });
    createPatient.mockReset().mockResolvedValue({ id: '1' });
  });

  it('blocks an invalid doctor form and submits a valid one', async () => {
    render(<DoctorForm />);
    fireEvent.click(screen.getByRole('button', { name: /add doctor/i }));
    await waitFor(() => expect(screen.getAllByText(/is required/i).length).toBeGreaterThan(0));
    expect(createDoctor).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Dr. Jane' } });
    fireEvent.change(screen.getByLabelText('Specialization'), { target: { value: 'Cardiology' } });
    fireEvent.change(screen.getByLabelText('Hospital'), { target: { value: 'General' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@clinic.com' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '555' } });
    fireEvent.click(screen.getByRole('button', { name: /add doctor/i }));
    await waitFor(() =>
      expect(createDoctor).toHaveBeenCalledWith({
        name: 'Dr. Jane',
        specialization: 'Cardiology',
        hospital: 'General',
        email: 'jane@clinic.com',
        phone: '555',
      }),
    );
  });

  it('requires a patient name, condition and doctor', async () => {
    render(<PatientForm />);
    fireEvent.click(screen.getByRole('button', { name: /add patient/i }));
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Condition is required')).toBeInTheDocument();
      expect(screen.getAllByText('Select a doctor').length).toBeGreaterThan(0);
    });
    expect(createPatient).not.toHaveBeenCalled();
  });

  it('renders the doctor selector options', () => {
    render(<PatientForm />);
    expect(screen.getByLabelText('Assigned doctor')).toBeInTheDocument();
    expect(screen.getByText('Select a doctor')).toBeInTheDocument();
  });
});
