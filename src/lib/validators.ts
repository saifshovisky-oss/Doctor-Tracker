import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const doctorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  specialization: z
    .array(z.string().trim().min(1).max(120))
    .min(1, 'Add at least one specialization')
    .max(10, 'A doctor can have at most 10 specializations'),
  hospital: z.string().trim().min(1, 'Hospital is required').max(180),
  phone: z.string().trim().min(1, 'Phone is required').max(40),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});

export const patientSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  age: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce
      .number({ error: 'Enter a valid age' })
      .int('Age must be a whole number')
      .min(0, 'Age must be at least 0')
      .max(120, 'Age must be at most 120')
      .optional(),
  ),
  gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().trim().max(40).optional(),
  email: z.union([z.string().trim().email('Enter a valid email address'), z.literal('')]).optional(),
  condition: z.string().trim().min(1, 'Condition is required').max(150),
  doctorId: z.string().min(1, 'Select a doctor'),
  notes: z.string().trim().max(2000).optional(),
});

export const conditionSchema = z.object({
  name: z.string().trim().min(1, 'Condition is required').max(150, 'Condition is too long'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
