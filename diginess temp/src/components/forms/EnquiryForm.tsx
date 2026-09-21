import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box,
    Button,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Alert,
    Stack,
    InputAdornment,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { Phone, Mail, User, MessageSquare, Briefcase, Send } from 'lucide-react';

// --- Validation Schema ---
const enquirySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    email: z.string().email('Please enter a valid email address'),
    interestType: z.enum(['sponsor', 'franchise', 'other']),
    message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message is too long'),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;

interface EnquiryFormProps {
    onSubmitSuccess?: () => void;
}

export const EnquiryForm = ({ onSubmitSuccess }: EnquiryFormProps) => {
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<EnquiryFormData>({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            interestType: 'sponsor',
            message: ''
        }
    });

    const activeTab = watch('interestType');

    const onSubmit = async (data: EnquiryFormData) => {
        try {
            setSubmitStatus('idle');
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Form Submitted:', data);

            setSubmitStatus('success');
            reset();
            if (onSubmitSuccess) onSubmitSuccess();

        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus('error');
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                '& .MuiInputBase-input': { color: '#000000 !important' },
                '& .MuiInputLabel-root': { color: '#4b5563 !important' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db !important' },
                '& .MuiInputAdornment-root svg': { color: '#64748b !important' },
                '& .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiToggleButton-root': { color: '#4b5563 !important', borderColor: '#d1d5db !important' },
                '& .MuiToggleButton-root.Mui-selected': { color: '#ffffff !important' }
            }}
        >
            {submitStatus === 'success' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Thank you! Your enquiry has been sent successfully. We will contact you shortly.
                </Alert>
            )}

            {submitStatus === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Something went wrong. Please try again later.
                </Alert>
            )}

            {/* Interest Type Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Controller
                    name="interestType"
                    control={control}
                    render={({ field }) => (
                        <ToggleButtonGroup
                            {...field}
                            exclusive
                            onChange={(_, value) => value && field.onChange(value)}
                            aria-label="Interest Type"
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                '& .MuiToggleButton-root': {
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    textTransform: 'uppercase',
                                    '&.Mui-selected': {
                                        bgcolor: 'brand.primary.main',
                                        color: 'common.white',
                                        '&:hover': { bgcolor: 'brand.primary.dark' }
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="sponsor">Sponsor</ToggleButton>
                            <ToggleButton value="franchise">Franchise</ToggleButton>
                        </ToggleButtonGroup>
                    )}
                />
            </Box>

            {/* Name */}
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Full Name"
                        placeholder="Enter your full name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <User size={20} color="gray" />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Phone */}
                <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Phone Number"
                            placeholder="9876543210"
                            fullWidth
                            type="tel"
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Typography color="text.secondary" fontWeight="bold" variant="body2" sx={{ color: '#4b5563 !important' }}>+91</Typography>
                                    </InputAdornment>
                                ),
                            }}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                field.onChange(val);
                            }}
                        />
                    )}
                />

                {/* Email */}
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Email Address"
                            placeholder="you@example.com"
                            fullWidth
                            type="email"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Mail size={20} color="gray" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                />
            </Stack>

            {/* Message */}
            <Controller
                name="message"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Message"
                        placeholder={`Why are you interested in this ${activeTab}ship?`}
                        multiline
                        rows={5}
                        fullWidth
                        error={!!errors.message}
                        helperText={errors.message?.message}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                    <MessageSquare size={20} color="gray" />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            />

            {/* Submit Button */}
            <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
                sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    boxShadow: 4
                }}
            >
                {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
            </Button>

            <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 1, color: '#4b5563 !important', display: 'block' }}>
                All the queries will be answered within 24 hours. <br />
                We respect your privacy. Your information is safe with us.
            </Typography>
        </Box>
    );
};
