import { z } from 'zod';

// Login Validation Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Password validation helper function
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('At least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('special character');
  }
  
  return errors;
};

// Format password errors as a single message
export const formatPasswordErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  
  const lengthError = errors.find(e => e.includes('6 characters'));
  const otherErrors = errors.filter(e => !e.includes('6 characters'));
  
  let message = '';
  
  if (lengthError) {
    message = lengthError;
    if (otherErrors.length > 0) {
      message += '. Password must contain at least one ' + otherErrors.join(', ');
    }
  } else if (otherErrors.length > 0) {
    message = 'Password must contain at least one ' + otherErrors.join(', ');
  }
  
  return message;
};

// Signup Validation Schema
export const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .refine((password) => {
      const errors = validatePassword(password);
      return errors.length === 0;
    }, {
      message: 'Password validation failed',
    }),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

// Onboarding Step 1 - Location Details
export const onboardingStep1Schema = z.object({
  country: z
    .string()
    .min(1, 'Country is required'),
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  state: z
    .string()
    .min(1, 'State is required'),
  pincode: z
    .string()
    .min(1, 'Pincode is required')
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  city: z
    .string()
    .min(1, 'City is required'),
  address: z
    .string()
    .optional(),
});

export type OnboardingStep1Data = z.infer<typeof onboardingStep1Schema>;

// Onboarding Step 2 - Description
export const onboardingStep2Schema = z.object({
  influencerDescription: z
    .string()
    .min(1, 'Description is required')
    .min(50, 'Description must be at least 50 characters'),
});

export type OnboardingStep2Data = z.infer<typeof onboardingStep2Schema>;

// Onboarding Step 3 - Tags
export const onboardingStep3Schema = z.object({
  tags: z
    .array(z.string())
    .min(1, 'Please add at least one tag'),
});

export type OnboardingStep3Data = z.infer<typeof onboardingStep3Schema>;

// Onboarding Step 4 - Social Media
const usernameRegex = /^[a-zA-Z0-9._]+$/;

export const onboardingStep4Schema = z.object({
  instagram: z
    .string()
    .refine((val) => val === '' || usernameRegex.test(val), {
      message: 'Username can only contain letters, numbers, dots, and underscores',
    })
    .optional(),
  facebook: z
    .string()
    .refine((val) => val === '' || usernameRegex.test(val), {
      message: 'Username can only contain letters, numbers, dots, and underscores',
    })
    .optional(),
  tiktok: z
    .string()
    .refine((val) => val === '' || usernameRegex.test(val), {
      message: 'Username can only contain letters, numbers, dots, and underscores',
    })
    .optional(),
  x: z
    .string()
    .refine((val) => val === '' || usernameRegex.test(val), {
      message: 'Username can only contain letters, numbers, dots, and underscores',
    })
    .optional(),
  youtube: z
    .string()
    .refine((val) => val === '' || usernameRegex.test(val), {
      message: 'Username can only contain letters, numbers, dots, and underscores',
    })
    .optional(),
});

export type OnboardingStep4Data = z.infer<typeof onboardingStep4Schema>;

// Onboarding Step 5 - Profile Picture
export const onboardingStep5Schema = z.object({
  profilePic: z
    .any()
    .refine((file) => {
      if (!file) return true; // Optional
      return file instanceof File;
    }, 'Invalid file')
    .refine((file) => {
      if (!file) return true; // Optional
      return file.size <= 10 * 1024 * 1024; // 10MB
    }, 'File size must be less than 10MB')
    .optional(),
});

export type OnboardingStep5Data = z.infer<typeof onboardingStep5Schema>;

// PostCampaign Step 1 - Campaign Details
export const postCampaignStep1Schema = z.object({
  campaignName: z
    .string()
    .min(1, 'Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters'),
  campaignDescription: z
    .string()
    .min(1, 'Campaign description is required')
    .min(20, 'Campaign description must be at least 20 characters'),
  selectedPlatforms: z
    .array(z.string())
    .min(1, 'Please select at least one platform'),
  tags: z
    .array(z.string())
    .optional(),
});

export type PostCampaignStep1Data = z.infer<typeof postCampaignStep1Schema>;

// PostCampaign Step 2 - Budget
export const postCampaignStep2Schema = z.object({
  campaignBudget: z
    .string()
    .min(1, 'Campaign budget is required')
    .refine((val) => !isNaN(Number(val)), 'Budget must be a valid number')
    .refine((val) => Number(val) >= 0, 'Budget must be a positive number')
    .refine((val) => Number(val) <= 1000000000, 'Budget must be less than 1,000,000,000'),
});

export type PostCampaignStep2Data = z.infer<typeof postCampaignStep2Schema>;

// Combined PostCampaign Schema (for final validation)
export const postCampaignSchema = z.object({
  campaignName: z
    .string()
    .min(1, 'Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters'),
  campaignDescription: z
    .string()
    .min(1, 'Campaign description is required')
    .min(20, 'Campaign description must be at least 20 characters'),
  selectedPlatforms: z
    .array(z.string())
    .min(1, 'Please select at least one platform'),
  tags: z
    .array(z.string())
    .optional(),
  campaignBudget: z
    .string()
    .min(1, 'Campaign budget is required')
    .refine((val) => !isNaN(Number(val)), 'Budget must be a valid number')
    .refine((val) => Number(val) >= 0, 'Budget must be a positive number')
    .refine((val) => Number(val) <= 1000000000, 'Budget must be less than 1,000,000,000'),
});

export type PostCampaignFormData = z.infer<typeof postCampaignSchema>;

