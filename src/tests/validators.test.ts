import { describe, expect, it } from 'vitest';
import { doctorSchema, loginSchema, patientSchema } from '@/lib/validators';

describe('Form validation schemas', () => {
  it('requires a valid login email and password', () => {
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'admin@example.com', password: 'secret' }).success).toBe(true);
  });

  it('requires all doctor fields', () => {
    expect(doctorSchema.safeParse({ name: '', specialization: [], hospital: '', email: 'bad', phone: '' }).success).toBe(false);
    expect(
      doctorSchema.safeParse({
        name: 'Dr. Who',
        specialization: ['Cardiology', 'Internal Medicine'],
        hospital: 'General',
        email: 'who@clinic.com',
        phone: '555',
      }).success,
    ).toBe(true);
  });

  it('requires patient name, condition and doctor, but allows missing contact details', () => {
    const base = { name: 'Jane', condition: 'Flu', doctorId: '507f1f77bcf86cd799439011' };
    expect(patientSchema.safeParse(base).success).toBe(true);
    expect(patientSchema.safeParse({ ...base, email: 'bad' }).success).toBe(false);
    expect(patientSchema.safeParse({ ...base, age: 200 }).success).toBe(false);
    expect(patientSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });
});
