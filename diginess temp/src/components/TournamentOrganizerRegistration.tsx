import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllStatesAsync, getCitiesAndDistrictsForStateAsync } from '@/data/indiaLocationsLazy';
import {
    User,
    Trophy,
    CheckCircle2,
    Gift,
    MapPin,
    Award,
    Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// --- Types ---
interface TournamentOrganizerFormData {
    // Section 1: Organiser Info
    organisation_name: string;
    organiser_name: string;
    designation: string;
    mobile_primary: string;
    mobile_secondary: string;
    email: string;
    state: string;
    city_district: string;
    area_pincode: string;

    // Section 2: Tournament Details
    tournament_type: string;
    tournament_category: string[];
    category_other: string;
    tournament_format: string;
    format_other: string;
    expected_teams: string;
    start_date: string;
    end_date: string;
    venue_name: string;
    venue_address: string;
    expected_footfall: string;
    live_streaming: string;
    live_streaming_link: string;

    // Section 3: Delivery Details
    delivery_contact_name: string;
    delivery_contact_mobile: string;
    delivery_address: string;
}

const initialFormData: TournamentOrganizerFormData = {
    organisation_name: '',
    organiser_name: '',
    designation: '',
    mobile_primary: '',
    mobile_secondary: '',
    email: '',
    state: '',
    city_district: '',
    area_pincode: '',
    tournament_type: '',
    tournament_category: [],
    category_other: '',
    tournament_format: '',
    format_other: '',
    expected_teams: '',
    start_date: '',
    end_date: '',
    venue_name: '',
    venue_address: '',
    expected_footfall: '',
    live_streaming: '',
    live_streaming_link: '',
    delivery_contact_name: '',
    delivery_contact_mobile: '',
    delivery_address: '',
};

// --- Configuration ---


const steps = [
    { id: 1, title: 'Organiser Info', icon: User, color: 'from-blue-500 to-indigo-600' },
    { id: 2, title: 'Tournament Details', icon: Trophy, color: 'from-sport-orange to-green-500' },
    { id: 3, title: 'Delivery Details', icon: Gift, color: 'from-emerald-500 to-teal-600' },
];


// --- Main Component ---

const TournamentOrganizerRegistration: React.FC = () => {

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<TournamentOrganizerFormData>(initialFormData);
    const [availableStates, setAvailableStates] = useState<string[]>([]);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    // const [completedSteps, setCompletedSteps] = useState<number[]>([]); // Removed gamification
    const [errors, setErrors] = useState<Record<string, string>>({});
    // const [showBadge, setShowBadge] = useState<typeof badges[0] | null>(null); // Removed gamification
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
        if (['mobile_primary', 'mobile_secondary', 'delivery_contact_mobile'].includes(name)) {
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

    const handleCheckboxChange = (field: 'tournament_category', value: string) => {
        setFormData(prev => {
            const current = prev[field];
            return {
                ...prev,
                [field]: current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value]
            };
        });
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (step === 1) {
            if (!formData.organisation_name.trim()) newErrors.organisation_name = 'Required';
            if (!formData.organiser_name.trim()) newErrors.organiser_name = 'Required';
            if (!formData.mobile_primary.trim() || formData.mobile_primary.length !== 10) newErrors.mobile_primary = 'Valid 10-digit number required';
            if (!formData.state) newErrors.state = 'Required';
            if (!formData.city_district) newErrors.city_district = 'Required';
        }
        if (step === 2) {
            if (!formData.tournament_type) newErrors.tournament_type = 'Required';
            if (formData.tournament_category.length === 0) newErrors.tournament_category = 'Select at least one';
            if (!formData.tournament_format) newErrors.tournament_format = 'Required';
            if (!formData.start_date) newErrors.start_date = 'Required';
            if (!formData.venue_name.trim()) newErrors.venue_name = 'Required';
        }
        if (step === 3) {
            if (!formData.delivery_contact_name.trim()) newErrors.delivery_contact_name = 'Required';
            if (!formData.delivery_contact_mobile.trim() || formData.delivery_contact_mobile.length !== 10) newErrors.delivery_contact_mobile = 'Valid 10-digit number required';
            if (!formData.delivery_address.trim()) newErrors.delivery_address = 'Required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
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
            // Insert into Supabase
            const { error: insertError } = await supabase
                .from('tournament_organizers' as any)
                .insert({
                    organisation_name: formData.organisation_name,
                    organiser_name: formData.organiser_name,
                    designation: formData.designation,
                    mobile_primary: formData.mobile_primary,
                    mobile_secondary: formData.mobile_secondary,
                    email: formData.email,
                    state: formData.state,
                    city_district: formData.city_district,
                    area_pincode: formData.area_pincode,
                    tournament_type: formData.tournament_type,
                    tournament_category: formData.tournament_category,
                    category_other: formData.category_other,
                    tournament_format: formData.tournament_format,
                    format_other: formData.format_other,
                    expected_teams: formData.expected_teams,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null,
                    venue_name: formData.venue_name,
                    venue_address: formData.venue_address,
                    expected_footfall: formData.expected_footfall || null,
                    live_streaming: formData.live_streaming || null,
                    live_streaming_link: formData.live_streaming_link || null,
                    delivery_contact_name: formData.delivery_contact_name,
                    delivery_contact_mobile: formData.delivery_contact_mobile,
                    delivery_address: formData.delivery_address,

                    // Removed extra fields, setting them to null or empty arrays if DB requires them,
                    // but we will assume optional in DB or irrelevant based on user request to simplify.
                    // If DB has NOT NULL constraints on removed fields, we should provide defaults.
                    // Based on schema review, most were nullable.

                    branding_support: [], // Default empty
                    status: 'pending'
                });

            if (insertError) {
                console.error('Supabase Insert Error:', insertError);
                throw insertError;
            }

            // Simulate API delay for UX (optional, but keeping it smooth)
            await new Promise(resolve => setTimeout(resolve, 500));

            setIsSubmitting(false);
            setIsSubmitted(true);
        } catch (error: any) {
            console.error('Registration error:', error);
            // Log detailed Supabase error if available
            if (error.details || error.hint || error.code) {
                console.error('Error Details:', { code: error.code, details: error.details, hint: error.hint });
            }
            setIsSubmitting(false);
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: 'destructive'
            });
        }
    };


    // --- Renders ---

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg text-center animate-scale-up">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <Award className="w-14 h-14 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Registration Success! 🏆</h1>
                    <p className="text-gray-600 text-lg mb-8">Registration Complete. We will contact you soon!</p>
                    <div className="bg-green-50 rounded-xl p-6 border-l-4 border-sport-orange text-left shadow-sm">
                        <p className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Next Steps</p>
                        <p className="text-gray-900">Your free tennis balls will be dispatched before the tournament start date.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans">
            {/* Styles for animation */}
            <style>{`
                @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
                .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                input, select, textarea { pointer-events: auto !important; }
            `}</style>

            {/* Removed BadgeModal */}

            <div>
                <div className="animate-fade-in">
                    <h2
                        className="text-center text-3xl sm:text-4xl font-bold !text-[#006400] mb-3"
                        style={{ color: '#006400' }}
                    >
                        Tournament Organizers Registration
                    </h2>
                    <div className="flex justify-center mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sport-orange to-green-500 text-gray-900 font-bold text-sm sm:text-base rounded-full shadow-lg">
                            <Gift className="w-5 h-5" />
                            Free Tennis Ball Campaign
                        </span>
                    </div>

                    {/* Main Form Card */}
                        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
                        {/* Step Header - Compact */}
                        <div className={`bg-gradient-to-r ${steps[currentStep - 1].color} p-4 text-gray-900 relative overflow-hidden`}>
                            <div className="relative z-10 flex items-center gap-3">

                                <div className="p-2 bg-white/40 backdrop-blur-md rounded-xl shadow-inner">
                                    {React.createElement(steps[currentStep - 1].icon, { className: 'w-6 h-6 text-gray-900' })}
                                </div>
                                <div>
                                    <p className="text-gray-950 text-[10px] font-black mb-1 uppercase tracking-[0.2em]">Step {currentStep} of 3</p>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950">{steps[currentStep - 1].title}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Form Body - Compact */}
                        <div className="p-6">
                            {/* Step 1: Organiser Info */}
                            {currentStep === 1 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">Organisation Name *</label>
                                            <input
                                                type="text"
                                                name="organisation_name"
                                                value={formData.organisation_name}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black ${errors.organisation_name ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                                placeholder="Enter organisation name"
                                            />
                                                {errors.organisation_name && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.organisation_name}</p>}
                                        </div>
                                        <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">Organiser Name *</label>
                                            <input
                                                type="text"
                                                name="organiser_name"
                                                value={formData.organiser_name}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black ${errors.organiser_name ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                                placeholder="Enter full name"
                                            />
                                                {errors.organiser_name && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.organiser_name}</p>}
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">Primary Mobile *</label>
                                            <input
                                                type="tel"
                                                name="mobile_primary"
                                                value={formData.mobile_primary}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black ${errors.mobile_primary ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                                placeholder="9876543210"
                                                maxLength={10}
                                            />
                                                {errors.mobile_primary && <p className="text-red-600 text-[10px] mt-1 font-bold uppercase">{errors.mobile_primary}</p>}
                                        </div>
                                        <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">Email ID</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white border-2 border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black focus:border-transparent"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
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
                                </div>
                            )}

                            {/* Step 2: Tournament Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Tournament Type *</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['Tennis Ball', 'Leather Ball', 'Box Cricket'].map(type => (
                                                <label key={type} className={`cursor-pointer px-6 py-3 rounded-xl border-2 font-bold transition-all ${formData.tournament_type === type ? 'bg-green-50 border-sspl-tennis-ball-green text-green-700 shadow-md transform scale-105' : 'bg-slate-50 border-slate-200 text-gray-900 hover:border-green-200'}`}>
                                                    <input type="radio" name="tournament_type" value={type} checked={formData.tournament_type === type} onChange={handleInputChange} className="sr-only" />
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.tournament_type && <p className="text-red-500 text-xs mt-2 font-medium">{errors.tournament_type}</p>}
                                    </div>
                                    <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all text-black ${errors.start_date ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                        />
                                        {errors.start_date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.start_date}</p>}
                                    </div>
                                    <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Venue Name *</label>
                                        <input
                                            type="text"
                                            name="venue_name"
                                            value={formData.venue_name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all text-black ${errors.venue_name ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                            placeholder="Enter stadium/ground name"
                                        />
                                        {errors.venue_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.venue_name}</p>}
                                    </div>
                                    <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Categories (Multi-select)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Open', 'Corporate', 'School', 'U-16', 'U-19'].map(cat => (
                                                <label key={cat} className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-semibold transition-all ${formData.tournament_category.includes(cat) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-300 text-gray-900 hover:bg-slate-50'}`}>
                                                    <input type="checkbox" checked={formData.tournament_category.includes(cat)} onChange={() => handleCheckboxChange('tournament_category', cat)} className="sr-only" />
                                                    {cat}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.tournament_category && <p className="text-red-500 text-xs mt-2 font-medium">{errors.tournament_category}</p>}
                                    </div>
                                    <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Format *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['6 Overs', '8 Overs', '10 Overs', '12 Overs', '20 Overs'].map(fmt => (
                                                <label key={fmt} className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-semibold transition-all ${formData.tournament_format === fmt ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white border-slate-300 text-gray-900 hover:bg-slate-50'}`}>
                                                    <input type="radio" name="tournament_format" value={fmt} checked={formData.tournament_format === fmt} onChange={handleInputChange} className="sr-only" />
                                                    {fmt}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.tournament_format && <p className="text-red-500 text-xs mt-2 font-medium">{errors.tournament_format}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Delivery Details */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-white/10 flex items-center gap-3">
                                        <Gift className="w-6 h-6 text-[#006000]" />
                                        <p className="text-gray-900 font-bold text-sm">We need this to ship your FREE tennis balls!</p>
                                    </div>
                                    <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Receiver Name *</label>
                                        <input
                                            type="text"
                                            name="delivery_contact_name"
                                            value={formData.delivery_contact_name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all text-black ${errors.delivery_contact_name ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                        />
                                        {errors.delivery_contact_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.delivery_contact_name}</p>}
                                    </div>
                                    <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Receiver Mobile *</label>
                                        <input
                                            type="tel"
                                            name="delivery_contact_mobile"
                                            value={formData.delivery_contact_mobile}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all text-black ${errors.delivery_contact_mobile ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                            maxLength={10}
                                        />
                                        {errors.delivery_contact_mobile && <p className="text-red-500 text-xs mt-1 font-medium">{errors.delivery_contact_mobile}</p>}
                                    </div>
                                    <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Address *</label>
                                        <textarea
                                            name="delivery_address"
                                            value={formData.delivery_address}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all text-black ${errors.delivery_address ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                                        />
                                        {errors.delivery_address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.delivery_address}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Steps 4, 5, 6 - Removed */}

                        </div>

                        {/* Footer / Controls - Compact */}
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
                                    Next Step <CustomChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-8 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Finish & Register'} <CheckCircle2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
// Helper Icon
const CustomChevronRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

export default TournamentOrganizerRegistration;
