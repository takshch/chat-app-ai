import { z } from 'zod';

// User schema for validation
export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// User type inferred from schema
export type User = z.infer<typeof userSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Login type
export type LoginData = z.infer<typeof loginSchema>;

// JWT payload type
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

