import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllStatesAsync, getCitiesAndDistrictsForStateAsync } from '@/data/indiaLocationsLazy';
import {
    User,
    Calendar,
    MapPin,
    Building2,
    Phone,
    Mail,
    FileText,
    Award,
    Check,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { googleAnalytics } from '@/utils/googleAnalytics';
import './SelectorRegistrationForm.css';

// --- Types ---
interface SelectorFormData {
    full_name: string;
    dob: string;
    state: string;
    city_district: string;
    contact_number: string;
    email: string;
    years_of_experience: string;
    highest_level_played: string;
    previously_worked_as_selector: string;
    availability: string[];
    preferred_region: string;
    declaration_accepted: boolean;
    document_file: File | null;
}

const initialFormData: SelectorFormData = {
    full_name: '',
    dob: '',
    state: '',
    city_district: '',
    contact_number: '',
    email: '',
    years_of_experience: '',
    highest_level_played: '',
    previously_worked_as_selector: '',
    availability: [],
    preferred_region: '',
    declaration_accepted: false,
    document_file: null,
};


const steps = [
    { id: 1, title: 'Personal Info', subtitle: "Let's get to know you." },
    { id: 2, title: 'Professional Experience', subtitle: 'Tell us about your cricket background.' },
    { id: 3, title: 'Availability & Docs', subtitle: 'Almost there. Availability and documents.' },
];

// The shared destructive toast has no background colour defined (`--destructive` is missing), so it is
// invisible on a white page; give this form's error toasts an explicit one.
const TOAST_ERROR_CLASS = 'border-transparent bg-[#c62828] text-white';

// Labelled field with an optional leading icon; children is the actual control (input / select)
interface FieldProps {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    error?: string;
    hasChevron?: boolean;
    children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ id, label, icon: Icon, error, hasChevron, children }) => (
    <div className="selform-field">
        <label htmlFor={id} className="selform-label">{label}</label>
        <div className={`selform-control${error ? ' selform-control--error' : ''}`}>
            {Icon && <Icon className="selform-control__icon" aria-hidden="true" />}
            {children}
            {hasChevron && <ChevronDown className="selform-control__chevron" aria-hidden="true" />}
        </div>
        {error && <p id={`${id}-error`} role="alert" className="selform-error">{error}</p>}
    </div>
);

const SelectorRegistrationForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<SelectorFormData>(initialFormData);
    const [availableStates, setAvailableStates] = useState<string[]>([]);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { toast } = useToast();

    // Data Loading
    useEffect(() => {
        getAllStatesAsync().then(setAvailableStates).catch(() => setAvailableStates([]));
    }, []);

    useEffect(() => {
        if (formData.state) {
            getCitiesAndDistrictsForStateAsync(formData.state)
                .then(setAvailableCities)
                .catch(() => setAvailableCities([]));
        } else {
            setAvailableCities([]);
        }
    }, [formData.state]);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'contact_number') {
            const cleaned = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleaned }));
            return;
        }
        if (name === 'state') {
            setFormData(prev => ({ ...prev, state: value, city_district: '' }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCheckboxChange = (value: string) => {
        setFormData(prev => {
            const current = prev.availability;
            return {
                ...prev,
                availability: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
            };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, document_file: files[0] }));
            if (errors.document_file) setErrors(prev => ({ ...prev, document_file: '' }));
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (step === 1) {
            if (!formData.full_name.trim()) newErrors.full_name = 'Required';
            if (!formData.dob.trim()) newErrors.dob = 'Required';
            if (!formData.state) newErrors.state = 'Required';
            if (!formData.city_district) newErrors.city_district = 'Required';
            if (!formData.contact_number.trim() || formData.contact_number.length !== 10) newErrors.contact_number = 'Valid 10-digit number required';
            if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
        }
        if (step === 2) {
            if (!formData.years_of_experience) newErrors.years_of_experience = 'Required';
            if (!formData.highest_level_played) newErrors.highest_level_played = 'Required';
            if (!formData.previously_worked_as_selector) newErrors.previously_worked_as_selector = 'Required';
        }
        if (step === 3) {
            if (!formData.preferred_region.trim()) newErrors.preferred_region = 'Required';
            if (!formData.declaration_accepted) newErrors.declaration_accepted = 'You must accept the declaration';
            if (!formData.document_file) newErrors.document_file = 'Document upload required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps(prev => [...prev, currentStep]);
            }
            setCurrentStep(prev => Math.min(prev + 1, 3));
        } else {
            toast({
                title: "Validation Error",
                description: "Please fill all required fields correctly.",
                variant: 'destructive',
                className: TOAST_ERROR_CLASS
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;
        setIsSubmitting(true);
        try {
            let documentUrl = null;

            if (formData.document_file) {
                const fileExt = formData.document_file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('selector-documents')
                    .upload(filePath, formData.document_file);

                if (uploadError) throw new Error(`Document upload failed: ${uploadError.message}`);

                const { data: { publicUrl } } = supabase.storage
                    .from('selector-documents')
                    .getPublicUrl(filePath);

                documentUrl = publicUrl;
            }

            // Calculate age from dob for DB compatibility
            const calculateAge = (birthDate: string) => {
                const today = new Date();
                const birth = new Date(birthDate);
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                return age;
            };

            const { error: insertError } = await supabase
                .from('selectors' as any)
                .insert({
                    full_name: formData.full_name,
                    age: calculateAge(formData.dob),
                    city_state: `${formData.city_district}, ${formData.state}`,
                    contact_number: formData.contact_number,
                    email: formData.email,
                    years_of_experience: formData.years_of_experience,
                    highest_level_played: formData.highest_level_played,
                    previously_worked_as_selector: formData.previously_worked_as_selector,
                    availability: formData.availability,
                    preferred_region: formData.preferred_region,
                    declaration_accepted: formData.declaration_accepted,
                    document_url: documentUrl,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            googleAnalytics.trackUserAction('selector_registration', 'registration', { event_label: 'selector_form_submission' });
            setIsSubmitting(false);
            setIsSubmitted(true);
        } catch (error: any) {
            console.error('Registration error:', error);
            setIsSubmitting(false);
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: 'destructive',
                className: TOAST_ERROR_CLASS
            });
        }
    };



    if (isSubmitted) {
        return (
            <div className="selform selform--success" role="status">
                <div className="selform-success__badge">
                    <Award aria-hidden="true" />
                </div>
                <h2 className="selform-title">Registration Successful</h2>
                <p className="selform-subtitle">Thank you for applying. Our team will review your credentials and get back to you soon.</p>
                <div className="selform-note">
                    <p className="selform-note__label">Next Steps</p>
                    <p>Keep an eye on your email for further instructions regarding the selection process.</p>
                </div>
            </div>
        );
    }

    const step = steps[currentStep - 1];

    return (
        <div className="selform">
            {/* Step tracker */}
            <div className="selform-progress">
                <span className="selform-progress__label">Step {currentStep} of 3</span>
                <ol className="selform-dots" aria-hidden="true">
                    {steps.map(s => (
                        <li
                            key={s.id}
                            className={`selform-dot${s.id <= currentStep ? ' selform-dot--reached' : ''}${s.id === currentStep ? ' selform-dot--current' : ''}`}
                        />
                    ))}
                </ol>
            </div>

            <h2 className="selform-title">{step.title}</h2>
            <p className="selform-subtitle">{step.subtitle}</p>

            <div className="selform-body">
                {currentStep === 1 && (
                    <div className="selform-grid selform-step">
                        <Field id="full_name" label="Full Name *" icon={User} error={errors.full_name}>
                            <input
                                id="full_name"
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                className="selform-input"
                                placeholder="Enter your full name"
                                aria-invalid={!!errors.full_name}
                                autoComplete="name"
                            />
                        </Field>
                        <Field id="dob" label="Date of Birth *" icon={Calendar} error={errors.dob} hasChevron>
                            <input
                                id="dob"
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className="selform-input"
                                aria-invalid={!!errors.dob}
                                autoComplete="bday"
                            />
                        </Field>
                        <Field id="state" label="State *" icon={MapPin} error={errors.state} hasChevron>
                            <select
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="selform-input"
                                aria-invalid={!!errors.state}
                            >
                                <option value="">Select State</option>
                                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </Field>
                        <Field id="city_district" label="City / District *" icon={Building2} error={errors.city_district} hasChevron>
                            <select
                                id="city_district"
                                name="city_district"
                                value={formData.city_district}
                                onChange={handleInputChange}
                                disabled={!formData.state}
                                className="selform-input"
                                aria-invalid={!!errors.city_district}
                            >
                                <option value="">Select City</option>
                                {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                        <Field id="contact_number" label="Contact Number *" icon={Phone} error={errors.contact_number}>
                            <input
                                id="contact_number"
                                type="tel"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleInputChange}
                                className="selform-input"
                                placeholder="10-digit phone number"
                                maxLength={10}
                                inputMode="numeric"
                                aria-invalid={!!errors.contact_number}
                                autoComplete="tel-national"
                            />
                        </Field>
                        <Field id="email" label="Email *" icon={Mail} error={errors.email}>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="selform-input"
                                placeholder="email@example.com"
                                aria-invalid={!!errors.email}
                                autoComplete="email"
                            />
                        </Field>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="selform-stack selform-step">
                        <div className="selform-field">
                            <p id="exp-label" className="selform-label">Years of Experience *</p>
                            <div className="selform-chips" role="radiogroup" aria-labelledby="exp-label">
                                {['0-2', '3-5', '6-10', '11-15', '15+'].map(exp => (
                                    <label key={exp} className={`selform-chip${formData.years_of_experience === exp ? ' selform-chip--on' : ''}`}>
                                        <input type="radio" name="years_of_experience" value={exp} checked={formData.years_of_experience === exp} onChange={handleInputChange} className="selform-chip__input" />
                                        {exp} years
                                    </label>
                                ))}
                            </div>
                            {errors.years_of_experience && <p role="alert" className="selform-error">{errors.years_of_experience}</p>}
                        </div>
                        <div className="selform-field">
                            <p id="level-label" className="selform-label">Highest Level Played *</p>
                            <div className="selform-chips" role="radiogroup" aria-labelledby="level-label">
                                {['club', 'district', 'national', 'international', 'other'].map(level => (
                                    <label key={level} className={`selform-chip selform-chip--cap${formData.highest_level_played === level ? ' selform-chip--on' : ''}`}>
                                        <input type="radio" name="highest_level_played" value={level} checked={formData.highest_level_played === level} onChange={handleInputChange} className="selform-chip__input" />
                                        {level}
                                    </label>
                                ))}
                            </div>
                            {errors.highest_level_played && <p role="alert" className="selform-error">{errors.highest_level_played}</p>}
                        </div>
                        <div className="selform-field">
                            <p id="selector-label" className="selform-label">Previously worked as Selector/Coach? *</p>
                            <div className="selform-chips" role="radiogroup" aria-labelledby="selector-label">
                                {['yes', 'no'].map(opt => (
                                    <label key={opt} className={`selform-chip selform-chip--cap${formData.previously_worked_as_selector === opt ? ' selform-chip--on' : ''}`}>
                                        <input type="radio" name="previously_worked_as_selector" value={opt} checked={formData.previously_worked_as_selector === opt} onChange={handleInputChange} className="selform-chip__input" />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                            {errors.previously_worked_as_selector && <p role="alert" className="selform-error">{errors.previously_worked_as_selector}</p>}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="selform-stack selform-step">
                        <div className="selform-field">
                            <p id="avail-label" className="selform-label">Availability for Matches</p>
                            <div className="selform-chips" role="group" aria-labelledby="avail-label">
                                {['weekdays', 'weekends'].map(day => (
                                    <label key={day} className={`selform-chip selform-chip--cap${formData.availability.includes(day) ? ' selform-chip--on' : ''}`}>
                                        <input type="checkbox" checked={formData.availability.includes(day)} onChange={() => handleCheckboxChange(day)} className="selform-chip__input" />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <Field id="preferred_region" label="Preferred Region/City *" icon={MapPin} error={errors.preferred_region}>
                            <input
                                id="preferred_region"
                                type="text"
                                name="preferred_region"
                                value={formData.preferred_region}
                                onChange={handleInputChange}
                                className="selform-input"
                                placeholder="Enter preferred region"
                                aria-invalid={!!errors.preferred_region}
                            />
                        </Field>
                        <div className="selform-field">
                            <label htmlFor="document_file" className="selform-label">Upload ID/Document *</label>
                            <div className={`selform-upload${formData.document_file ? ' selform-upload--done' : ''}${errors.document_file ? ' selform-upload--error' : ''}`}>
                                <input
                                    id="document_file"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="selform-upload__input"
                                    aria-invalid={!!errors.document_file}
                                />
                                <FileText className="selform-upload__icon" aria-hidden="true" />
                                <p className="selform-upload__name">{formData.document_file ? formData.document_file.name : 'Click or Drag to Upload ID'}</p>
                                <p className="selform-upload__hint">PDF, JPG, PNG (Max 5MB)</p>
                            </div>
                            {errors.document_file && <p role="alert" className="selform-error">{errors.document_file}</p>}
                        </div>
                        <div>
                            <label htmlFor="declaration_accepted" className={`selform-declare${errors.declaration_accepted ? ' selform-declare--error' : ''}`}>
                                <input
                                    type="checkbox"
                                    id="declaration_accepted"
                                    checked={formData.declaration_accepted}
                                    onChange={e => setFormData(prev => ({ ...prev, declaration_accepted: e.target.checked }))}
                                    className="selform-declare__input"
                                />
                                <span className="selform-declare__box" aria-hidden="true"><Check /></span>
                                <span>I hereby declare that all the information provided is true and accurate to the best of my knowledge.</span>
                            </label>
                            {errors.declaration_accepted && <p role="alert" className="selform-error">{errors.declaration_accepted}</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer controls */}
            <div className="selform-footer">
                <button
                    type="button"
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="selform-back"
                >
                    <ArrowLeft aria-hidden="true" /> Back
                </button>

                {currentStep < 3 ? (
                    <button type="button" onClick={handleNext} className="brand-btn brand-btn--primary selform-next">
                        Next Step <ArrowRight aria-hidden="true" />
                    </button>
                ) : (
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="brand-btn brand-btn--primary selform-next">
                        {isSubmitting ? (<><Loader2 className="selform-spin" aria-hidden="true" /> Submitting...</>) : (<>Finish Selection Registration <CheckCircle2 aria-hidden="true" /></>)}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SelectorRegistrationForm;
