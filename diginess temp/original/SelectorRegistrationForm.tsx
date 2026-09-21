import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllStatesAsync, getCitiesAndDistrictsForStateAsync } from '@/data/indiaLocationsLazy';
import {
    User,
    Calendar,
    MapPin,
    Phone,
    Mail,
    FileText,
    ShieldCheck,
    Award,
    CheckCircle2,
    ChevronRight,
    Loader2,
    Trophy,
    Gamepad2,
    History,
    Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { googleAnalytics } from '@/utils/googleAnalytics';

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
    { id: 1, title: 'Personal Info', icon: User, color: 'from-blue-500 to-indigo-600' },
    { id: 2, title: 'Professional Experience', icon: History, color: 'from-sport-orange to-green-600' },
    { id: 3, title: 'Availability & Docs', icon: Briefcase, color: 'from-green-500 to-emerald-600' },
];



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
                variant: 'destructive'
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
                variant: 'destructive'
            });
        }
    };


    if (isSubmitted) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-scale-up">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <Award className="w-14 h-14 text-white" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">Registration Success! 🏆</h1>
                <p className="text-gray-600 text-lg mb-8">Thank you for applying. Our team will review your credentials and get back to you soon.</p>
                <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500 text-left shadow-sm">
                    <p className="font-bold text-blue-800 text-sm uppercase tracking-wide mb-1">Next Steps</p>
                    <p className="text-blue-900">Keep an eye on your email for further instructions regarding the selection process.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full font-sans light-theme-forced">
            <style>{`
                @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
                .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
            `}</style>


            <div className="max-w-4xl mx-auto">
                <h2
                    className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-8"
                >
                    Selectors Registration
                </h2>

                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
                    {/* Step Header - Compact */}
                    <div className={`bg-gradient-to-r ${steps[currentStep - 1].color} p-4 text-white relative overflow-hidden`}>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                                {React.createElement(steps[currentStep - 1].icon, { className: 'w-6 h-6' })}
                            </div>
                            <div>
                                <p className="text-gray-950 text-[10px] font-black mb-1 uppercase tracking-[0.2em]">Step {currentStep} of 3</p>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950">{steps[currentStep - 1].title}</h2>
                            </div>
                        </div>

                    </div>

                    {/* Form Body - Compact */}
                    <div className="p-6">
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black ${errors.full_name ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.full_name && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.full_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Date of Birth *</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black ${errors.dob ? 'border-red-400' : 'border-slate-200 focus:border-transparent'}`}
                                        />
                                        {errors.dob && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.dob}</p>}
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">State *</label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black ${errors.state ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                        >
                                            <option value="">Select State</option>
                                            {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {errors.state && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.state}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">City / District *</label>
                                        <select
                                            name="city_district"
                                            value={formData.city_district}
                                            onChange={handleInputChange}
                                            disabled={!formData.state}
                                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 text-black ${errors.city_district ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                        >
                                            <option value="">Select City</option>
                                            {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {errors.city_district && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.city_district}</p>}
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Contact Number *</label>
                                        <input
                                            type="tel"
                                            name="contact_number"
                                            value={formData.contact_number}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black ${errors.contact_number ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                            placeholder="10-digit phone number"
                                            maxLength={10}
                                        />
                                        {errors.contact_number && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.contact_number}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black ${errors.email ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                            placeholder="email@example.com"
                                        />
                                        {errors.email && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Years of Experience *</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['0-2', '3-5', '6-10', '11-15', '15+'].map(exp => (
                                            <label key={exp} className={`cursor-pointer px-6 py-3 rounded-xl border-2 font-bold transition-all ${formData.years_of_experience === exp ? 'bg-green-50 border-sspl-tennis-ball-green text-green-900 shadow-md transform scale-105' : 'bg-slate-50 border-slate-200 text-gray-600 hover:border-green-200'}`}>
                                                <input type="radio" name="years_of_experience" value={exp} checked={formData.years_of_experience === exp} onChange={handleInputChange} className="sr-only" />
                                                {exp} years
                                            </label>
                                        ))}
                                    </div>
                                    {errors.years_of_experience && <p className="text-red-500 text-xs mt-2 font-medium">{errors.years_of_experience}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Highest Level Played *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['club', 'district', 'national', 'international', 'other'].map(level => (
                                            <label key={level} className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-semibold capitalize transition-all ${formData.highest_level_played === level ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-300 text-gray-600 hover:bg-slate-50'}`}>
                                                <input type="radio" name="highest_level_played" value={level} checked={formData.highest_level_played === level} onChange={handleInputChange} className="sr-only" />
                                                {level}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.highest_level_played && <p className="text-red-500 text-xs mt-2 font-medium">{errors.highest_level_played}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Previously worked as Selector/Coach? *</label>
                                    <div className="flex gap-4">
                                        {['yes', 'no'].map(opt => (
                                            <label key={opt} className={`cursor-pointer px-8 py-3 rounded-xl border-2 font-bold capitalize transition-all ${formData.previously_worked_as_selector === opt ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-md transform scale-105' : 'bg-slate-50 border-slate-200 text-gray-600 hover:border-purple-200'}`}>
                                                <input type="radio" name="previously_worked_as_selector" value={opt} checked={formData.previously_worked_as_selector === opt} onChange={handleInputChange} className="sr-only" />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.previously_worked_as_selector && <p className="text-red-500 text-xs mt-2 font-medium">{errors.previously_worked_as_selector}</p>}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Availability for Matches</label>
                                    <div className="flex gap-4">
                                        {['weekdays', 'weekends'].map(day => (
                                            <label key={day} className={`cursor-pointer px-6 py-3 rounded-xl border-2 font-bold capitalize transition-all ${formData.availability.includes(day) ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md transform scale-105' : 'bg-slate-50 border-slate-200 text-gray-600 hover:border-slate-300'}`}>
                                                <input type="checkbox" checked={formData.availability.includes(day)} onChange={() => handleCheckboxChange(day)} className="sr-only" />
                                                {day}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Region/City *</label>
                                    <input
                                        type="text"
                                        name="preferred_region"
                                        value={formData.preferred_region}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all text-black ${errors.preferred_region ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                        placeholder="Enter preferred region"
                                    />
                                    {errors.preferred_region && <p className="text-red-500 text-xs mt-1 font-medium">{errors.preferred_region}</p>}
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Upload ID/Document *</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-8 border-2 border-dashed rounded-xl text-center transition-all ${formData.document_file ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200 group-hover:border-blue-300'}`}>
                                            <FileText className={`w-10 h-10 mx-auto mb-2 ${formData.document_file ? 'text-green-500' : 'text-slate-400'}`} />
                                            <p className="font-bold text-slate-700">{formData.document_file ? formData.document_file.name : 'Click or Drag to Upload ID'}</p>
                                            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                        </div>
                                    </div>
                                    {errors.document_file && <p className="text-red-500 text-xs mt-2 font-medium">{errors.document_file}</p>}
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <input
                                        type="checkbox"
                                        id="declaration_accepted"
                                        checked={formData.declaration_accepted}
                                        onChange={e => setFormData(prev => ({ ...prev, declaration_accepted: e.target.checked }))}
                                        className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="declaration_accepted" className="text-sm font-medium text-gray-700 leading-relaxed cursor-pointer">
                                        I hereby declare that all the information provided is true and accurate to the best of my knowledge.
                                    </label>
                                </div>
                                {errors.declaration_accepted && <p className="text-red-500 text-xs mt-1 font-medium">{errors.declaration_accepted}</p>}
                            </div>
                        )}
                    </div>

                    {/* Footer Controls - Compact */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                            disabled={currentStep === 1}
                            className="px-6 py-2 text-gray-500 font-bold hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Back
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-8 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Next Step <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                            >
                                {isSubmitting ? (<><Loader2 className="w-5 h-4 animate-spin" /> Submitting...</>) : 'Finish Selection Registration'} <CheckCircle2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectorRegistrationForm;
