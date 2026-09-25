import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import TermsAndConditions from './TermsAndConditions';
import { razorpayService, type RazorpayPaymentFailedError, type RazorpayPaymentSuccessResponse } from '@/integrations/razorpayService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentPreconnect } from '@/hooks/useResourceHints';
import { googleAnalytics } from '@/utils/googleAnalytics';
import { getUTMCampaign } from '@/utils/utm-tracking';
import { useUTMTracking } from '@/hooks/useUTMTracking';
import {
  User,
  Users,
  Building,
  MapPin,
  History,
  CreditCard,
  Loader2,
  Camera,
  X,
} from 'lucide-react';
import { checkPlayerPhoto, uploadPlayerPhoto } from '@/lib/playerPhoto';
import { getUTMData, storeUTMData } from '@/utils/utm';
import { visitorLeadService } from '@/services/visitorLeadService';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { getAllStatesAsync, getCitiesAndDistrictsForStateAsync } from '@/data/indiaLocationsLazy';

// Lazy load heavy components
const PaymentSuccessCelebration = lazy(() => import('./PaymentSuccessCelebration'));

interface PlayerDetails {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  state: string;
  cityDistrict: string;
  position: string;
  pincode: string;
}



const CustomChevronRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const PlayerRegistrationStepper = () => {
  const [searchParams] = useSearchParams();
  const initialTypeParam = (searchParams.get('type') || '').toLowerCase();
  const initialRegistrationType: 'individual' | 'team' | 'students' =
    initialTypeParam === 'team' ? 'team' :
    (initialTypeParam === 'students' || initialTypeParam === 'student') ? 'students' : 'individual';
  const [registrationType, setRegistrationType] = useState<'individual' | 'team' | 'students'>(initialRegistrationType);
  const [teamDetails, setTeamDetails] = useState<{
    teamName: string;
    playerCount: number;
    state: string;
    cityDistrict: string;
    players: PlayerDetails[];
  }>({
    teamName: '',
    playerCount: 0,
    state: '',
    cityDistrict: '',
    players: [],
  });

  // const [currentStep, setCurrentStep] = useState(1); // Merged into single page

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    state: '',
    cityDistrict: '',
    position: '',
    pincode: '',
    school_name: '',
    utm_campaign: getUTMCampaign(),
  });

  const [availableCitiesDistricts, setAvailableCitiesDistricts] = useState<string[]>([]);
  /* const [teamCities, setTeamCities] = useState<Record<number, string[]>>({}); */ // Removed per refactor
  const [teamAvailableCities, setTeamAvailableCities] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdRegistration, setCreatedRegistration] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [adminSettings, setAdminSettings] = useState<{ registration_fee: number; gst_percentage: number }>({ registration_fee: 699, gst_percentage: 18 });
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Release the preview's object URL when the photo changes or the form unmounts.
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again after removing it
    if (!file) return;
    const problem = checkPlayerPhoto(file);
    if (problem) {
      toast({ title: 'Photo not accepted', description: problem, variant: 'destructive' });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };



  const { toast } = useToast();
  const { user } = useAuth();
  const { isTrackingEnabled } = useUTMTracking();

  usePaymentPreconnect();

  const [config, setConfig] = useState<{ amount: number; amount_paise: number } | null>(null);
  useEffect(() => {
    razorpayService.getConfig().then(data => {
      if (data) setConfig(data);
    }).catch(console.error);
  }, []);

  // Use config amount if available for display.
  // Assuming config.amount_paise is the source of truth if strictly enforced by backend.
  // Fallback to env or defaults.
  const envFee = Number(import.meta.env.VITE_REGISTRATION_FEE ?? (import.meta.env.MODE === 'production' ? 699 : 699));

  const gstPercentage = adminSettings?.gst_percentage || 18;

  // Decide logic: if config exists, it is Total.
  const configTotal = config?.amount ?? (config?.amount_paise ? config.amount_paise / 100 : undefined);

  let finalBase: number;
  let finalGst: number;
  let finalTotal: number;

  if (configTotal) {
    // Back calculate Base
    finalTotal = configTotal;
    finalBase = Math.round((finalTotal * 100) / (100 + gstPercentage));
    finalGst = finalTotal - finalBase;
  } else {
    // Fallback: Prop/Env is Base
    const registrationFee = (Number.isFinite(envFee) && envFee > 0 ? Math.round(envFee) : (adminSettings?.registration_fee ?? 699));
    const trialsFee = 300;
    finalBase = registrationFee + trialsFee;
    finalGst = Math.round(finalBase * gstPercentage / 100);
    finalTotal = finalBase + finalGst;
  }

  // For Team and Students Registration, multiply by player count
  const multiplier = (registrationType === 'team' || registrationType === 'students')
    ? (teamDetails.playerCount > 0 ? teamDetails.playerCount : 0)
    : 1;

  const baseAmount = finalBase * multiplier;
  const gstAmount = finalGst * multiplier;
  const originalTotalAmount = finalTotal * multiplier;

  const discountAmount = 0;
  const totalAmount = originalTotalAmount - discountAmount;

  // Keep dates as pure calendar strings (YYYY-MM-DD) to avoid timezone drift
  const todayYMD = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  // Load states list on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await getAllStatesAsync();
        setAvailableStates(states);
      } catch (error) {
        setAvailableStates([]);
      }
    };
    loadStates();
  }, []);

  // Pre-fill form with user data if logged in OR from cookies (Only for individual or first player in team)
  useEffect(() => {
    // 1. Try logged in user first
    if (user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    } else {
      // 2. Try cookies (Visitor Lead Recovery)
      const utmData = getUTMData();
      if (utmData && !formData.email && !formData.phone) {
        setFormData(prev => ({
          ...prev,
          full_name: prev.full_name || utmData.name || '',
          email: prev.email || utmData.email || '',
          phone: prev.phone || utmData.phone || '',
        }));
      }
    }
  }, [user]);

  // Ensure form interactions work on desktop
  useEffect(() => {
    const ensureDesktopInteractions = () => {
      // Force enable pointer events for all form elements
      const formElements = document.querySelectorAll('input, select, textarea, button');
      formElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.cssText += 'pointer-events:auto;touch-action:manipulation;';
      });

      // Ensure glass-card doesn't block interactions
      const glassCards = document.querySelectorAll('.glass-card');
      glassCards.forEach((card: Element) => {
        const htmlCard = card as HTMLElement;
        htmlCard.style.cssText += 'pointer-events:auto;user-select:text;';
      });
    };

    // Run on mount and after any dynamic changes
    ensureDesktopInteractions();
    const timer = setTimeout(ensureDesktopInteractions, 100);
    return () => clearTimeout(timer);
  }, [registrationType, teamDetails.playerCount]); // Re-run when team size changes

  // Track registration start when component mounts
  useEffect(() => {
    googleAnalytics.trackRegistrationStart({
      player_email: formData.email || user?.email,
      registration_type: registrationType,
    });
  }, [registrationType]);

  // Load Razorpay script on mount
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
    } else {
      loadRazorpayScript();
    }
  }, []);

  // Lock body scroll when Razorpay modal is open
  useEffect(() => {
    if (razorpayModalOpen) {
      requestAnimationFrame(() => {
        document.body.style.overflow = 'hidden';
      });
    } else {
      requestAnimationFrame(() => {
        document.body.style.overflow = '';
      });
    }
  }, [razorpayModalOpen]);

  // Initialize team/students players array when count changes
  useEffect(() => {
    if (registrationType === 'team' || registrationType === 'students') {
      setTeamDetails(prev => {
        const currentLength = prev.players.length;
        if (currentLength === prev.playerCount) return prev;

        const newPlayers = [...prev.players];
        if (currentLength < prev.playerCount) {
          // Add new empty players
          for (let i = currentLength; i < prev.playerCount; i++) {
            newPlayers.push({
              full_name: '',
              email: '',
              phone: '',
              date_of_birth: '',
              state: '',
              cityDistrict: '',
              position: '',
              pincode: '',
            });
          }
        } else {
          // Trim array
          newPlayers.splice(prev.playerCount);
        }
        return { ...prev, players: newPlayers };
      });
    }
  }, [teamDetails.playerCount, registrationType]);

  const loadRazorpayScript = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    // Check if script is already in DOM
    if (document.querySelector('#razorpay-js')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      setScriptLoadError('Failed to load payment system');
    };
    document.body.appendChild(script);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, playerIndex?: number) => {
    const { name, value } = e.target;

    // Handle Team/Students Player Input
    if ((registrationType === 'team' || registrationType === 'students') && playerIndex !== undefined) {
      setTeamDetails(prev => {
        const newPlayers = [...prev.players];
        const updatedPlayer = { ...newPlayers[playerIndex], [name]: value };

        if (name === 'phone') {
          updatedPlayer.phone = value.replace(/\D/g, '').slice(0, 10);
        }

        newPlayers[playerIndex] = updatedPlayer;
        return { ...prev, players: newPlayers };
      });
      return;
    }

    // Handle Individual / Primary Contact Input
    setTouchedFields((prev: Record<string, boolean>) => ({ ...prev, [name]: true }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }

    if (name === 'phone') {
      const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
      return;
    }

    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, cityDistrict: '' }));
      try {
        const citiesDistricts = await getCitiesAndDistrictsForStateAsync(value);
        setAvailableCitiesDistricts(citiesDistricts);
      } catch (error) {
        setAvailableCitiesDistricts([]);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Visitor Lead Capture: Sync to Cookies & DB
    if (['full_name', 'email', 'phone'].includes(name)) {
      const updatedData = { ...formData, [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value };

      // 1. Update Cookies
      const currentUTM = getUTMData() || { utm_id: null, utm_source: null, utm_medium: null, utm_campaign: null };
      storeUTMData({
        ...currentUTM,
        name: updatedData.full_name,
        email: updatedData.email,
        phone: updatedData.phone,
      });

      // 2. Sync to DB (Debounced)
      visitorLeadService.syncVisitorLead({
        full_name: updatedData.full_name,
        email: updatedData.email,
        phone: updatedData.phone,
      });
    }
  };

  const handleTeamDetailsChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'playerCount') {
      setTeamDetails(prev => ({ ...prev, playerCount: parseInt(value) || 0 }));
    } else if (name === 'state') {
      // Reset city
      setTeamDetails(prev => ({ ...prev, state: value, cityDistrict: '' }));
      try {
        const cities = await getCitiesAndDistrictsForStateAsync(value);
        setTeamAvailableCities(cities);
      } catch {
        setTeamAvailableCities([]);
      }
    } else {
      setTeamDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const validatePlayer = (player: PlayerDetails): boolean => {
    // Basic validation similar to main form
    if (!player.full_name || !player.email || !player.phone || !player.position) return false;
    if (player.phone.length !== 10) return false;
    return true;
  };

  const validateForm = () => {
    const errors: { [key: string]: boolean } = {};
    let isValid = true;

    if (registrationType === 'individual') {
      if (!formData.full_name.trim()) { errors.full_name = true; isValid = false; }
      if (!formData.date_of_birth) { errors.date_of_birth = true; isValid = false; }
      if (!formData.email.trim() || !formData.email.includes('@')) { errors.email = true; isValid = false; }
      if (!formData.phone || formData.phone.length !== 10) { errors.phone = true; isValid = false; }
      if (!formData.state) { errors.state = true; isValid = false; }
      if (!formData.cityDistrict) { errors.cityDistrict = true; isValid = false; }
      if (!formData.pincode || formData.pincode.length !== 6) { errors.pincode = true; isValid = false; }
      if (!formData.position) { errors.position = true; isValid = false; }
      if (!formData.school_name.trim()) { errors.school_name = true; isValid = false; }
      if (!acceptTerms) {
        toast({ title: 'Notice', description: 'Please accept terms & conditions to proceed', variant: 'destructive' });
        isValid = false;
      }
    } else if (registrationType === 'team' || registrationType === 'students') {
      if (!teamDetails.teamName.trim()) { errors.teamName = true; isValid = false; }
      if (!teamDetails.playerCount || (registrationType === 'team' ? teamDetails.playerCount < 2 : teamDetails.playerCount < 1)) { errors.playerCount = true; isValid = false; }
      if (!teamDetails.state) { errors.state = true; isValid = false; }
      if (!teamDetails.cityDistrict) { errors.cityDistrict = true; isValid = false; }

      teamDetails.players.forEach((p, i) => {
        if (!p.full_name.trim() || !p.email.trim() || !p.email.includes('@') || !p.phone || p.phone.length !== 10 || !p.date_of_birth || !p.position) {
          isValid = false;
        }
      });
      if (!isValid && teamDetails.players.some(p => !p.full_name || !p.email || !p.phone || !p.date_of_birth || !p.position)) {
        toast({ title: 'Incomplete Team', description: 'Please fill all player names, emails, DOBs and details', variant: 'destructive' });
      } else if (!acceptTerms) {
        toast({ title: 'Notice', description: 'Please accept terms & conditions', variant: 'destructive' });
        isValid = false;
      }
    }

    setFieldErrors(errors);
    if (!isValid) {
      if (Object.keys(errors).length > 0) {
        toast({ title: 'Required Fields', description: 'Please correct the highlighted fields', variant: 'destructive' });
      }
    }
    return isValid;
  };

  const handleNext = () => {
    // No-op or just trigger validation
    validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Just set local state for Step 2 preview
      const simulatedRegistration = {
        ...formData,
        city: formData.cityDistrict,
        // No ID yet
        registrationType, // Pass to preview
        teamName: teamDetails.teamName,
        teamMembers: teamDetails.players,
        totalAmount,
      };
      setCreatedRegistration(simulatedRegistration);
      // Form submitted successfully
      // setCurrentStep(2); // Removed for single-page layout

      googleAnalytics.trackRegistrationComplete({
        player_name: formData.full_name,
        player_email: formData.email,
        player_position: formData.position,
        player_state: formData.state,
        player_city: formData.cityDistrict,
        registration_type: registrationType,
      });

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Registration failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);

      const utmData = getUTMData();
      const qrCodeId = typeof window !== 'undefined' ? localStorage.getItem('qr_code_id') : null;

      // 1. Create Order via Backend (Backend handles Registration + Order creation)
      // Backend validates amount. We only pass details.
      // 1. Create Registration in Supabase (Frontend)
      // We must create the row first so the backend can update it with payment details.

      let registrationId: string | null = null;
      let order: any = null; // To store the order object from razorpayService.createOrder
      let paymentPayload: any = {}; // Payload for the order creation

      // Simplified Payload: Validation ensures fields are present.
      if (registrationType === 'team' || registrationType === 'students') {
        const teamPayload = {
          team_name: teamDetails.teamName,
          state: teamDetails.state,
          city: teamDetails.cityDistrict,
          primary_contact_name: teamDetails.players[0].full_name,
          primary_contact_email: teamDetails.players[0].email,
          primary_contact_phone: teamDetails.players[0].phone,
          payment_amount: totalAmount,
          payment_status: 'pending', // Initial status
        };

        console.log('Inserting Team record...', teamPayload);
        const { data: newTeam, error: teamError } = await supabase
          .from('teams' as any)
          .insert(teamPayload)
          .select()
          .single();

        if (teamError) {
          throw new Error(`Failed to create team record: ${  teamError.message}`);
        }

        const teamId = (newTeam as any).id;
        console.log('Team created with ID:', teamId);

        // Prepare player payloads linked to this team
        const playersPayload = teamDetails.players.map(player => ({
          full_name: player.full_name,
          email: player.email,
          phone: player.phone,
          date_of_birth: player.date_of_birth,
          position: player.position,
          pincode: player.pincode || null,
          // Map frontend field 'cityDistrict' to DB 'city'
          city: teamDetails.cityDistrict,
          state: teamDetails.state,
          payment_amount: totalAmount / teamDetails.playerCount,
          payment_status: 'pending',
          registration_type: registrationType,
          team_id: teamId,
          team: teamDetails.teamName, // Explicitly capture team name as requested
          is_captain: player === teamDetails.players[0], // Assume first is captain/primary
          utm_source: utmData?.utm_source || null,
          utm_medium: utmData?.utm_medium || null,
          utm_campaign: utmData?.utm_campaign || null,
          utm_content: (utmData as any)?.utm_content || null,
          utm_term: (utmData as any)?.utm_term || null,
          qr_code_id: qrCodeId || null,
        }));

        console.log('Inserting linked players...', playersPayload);
        const { error: playersError } = await supabase
          .from('player_registrations')
          .insert(playersPayload);

        if (playersError) {
          throw new Error(`Failed to save team players: ${  playersError.message}`);
        }

        // Let's query the captain's ID we just inserted.
        const { data: captainReg } = await supabase
          .from('player_registrations')
          .select('id')
          .eq('team_id', teamId)
          .eq('is_captain', true)
          .single();

        if (!captainReg) throw new Error('Could not retrieve team captain record.');

        registrationId = captainReg.id;

        // Force recalculation using explicitly selected player count
        const multiplier = (teamDetails.playerCount && teamDetails.playerCount > 0) ? teamDetails.playerCount : 1;

        // Calculate Base and GST again to be safe
        const registrationFee = (Number.isFinite(envFee) && envFee > 0 ? Math.round(envFee) : (adminSettings?.registration_fee ?? 699));
        const trialsFee = 300;
        const baseFee = registrationFee + trialsFee;
        const gstVal = Math.round(baseFee * gstPercentage / 100);
        const singleTotal = baseFee + gstVal;

        const finalTeamAmountRupees = (singleTotal * multiplier) - discountAmount;
        const finalTeamAmountPaise = finalTeamAmountRupees * 100;

        console.log('Payment Calculation:');
        console.log(`Base: ${baseFee}, GST: ${gstVal}, Single: ${singleTotal}`);
        console.log(`Multiplier (Player Count): ${multiplier}`);
        console.log(`Final Amount: ₹${finalTeamAmountRupees} (${finalTeamAmountPaise} paise)`);

        // Context for order creation (Captain)
        paymentPayload = {
          full_name: playersPayload[0].full_name,
          email: playersPayload[0].email,
          phone: playersPayload[0].phone,
          date_of_birth: playersPayload[0].date_of_birth,
          state: playersPayload[0].state,
          city: playersPayload[0].city,
          pincode: playersPayload[0].pincode,
          position: playersPayload[0].position,
        };

        const { order: newOrder } = await razorpayService.createOrder({
          createRegistration: false,
          registrationId,
          full_name: paymentPayload.full_name,
          name: paymentPayload.full_name,
          email: paymentPayload.email,
          phone: paymentPayload.phone,
          date_of_birth: paymentPayload.date_of_birth,
          state: paymentPayload.state,
          city: paymentPayload.city,
          position: paymentPayload.position,
          pincode: paymentPayload.pincode,
          utm_source: utmData?.utm_source,
          utm_medium: utmData?.utm_medium,
          utm_campaign: utmData?.utm_campaign,
          utm_content: (utmData as any)?.utm_content,
          utm_term: (utmData as any)?.utm_term,
          qr_code_id: qrCodeId,
          amount: finalTeamAmountPaise, // Sending Paise to backend
          notes: {
            team_id: teamId, // Pass Team ID in notes for backend hooks
            is_team_payment: true,
            player_count: multiplier,
            discount_amount: discountAmount,
          },
        });
        order = newOrder; // Assign to outer scope variable

      } else {
        // ... EXISTING INDIVIDUAL LOGIC ...
        let photoPath: string | null = null;
        if (photoFile) {
          try {
            photoPath = await uploadPlayerPhoto(photoFile);
          } catch (photoError) {
            console.error('Player photo upload failed:', photoError);
            throw new Error('Could not upload your photo. Please try again, or remove the photo to continue.');
          }
        }

        const payload: any = {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          state: formData.state,
          city: formData.cityDistrict, // Mapped to city
          pincode: formData.pincode,
          position: formData.position,
          school_name: formData.school_name || null,
          payment_status: 'pending',
          payment_amount: totalAmount, // Required by DB
          registration_type: registrationType, // New field
          utm_source: utmData?.utm_source || null,
          utm_medium: utmData?.utm_medium || null,
          utm_campaign: utmData?.utm_campaign || null,
          utm_content: (utmData as any)?.utm_content || null,
          utm_term: (utmData as any)?.utm_term || null,
          qr_code_id: qrCodeId || null,
          // Only sent with a photo, so registrations without one never depend on the column.
          ...(photoPath && { photo_url: photoPath }),
        };

        console.log('Sending registration payload:', payload);

        const { data: newReg, error: regError } = await supabase
          .from('player_registrations')
          .insert(payload)
          .select()
          .single();

        if (regError) {
          console.error('Registration insert detailed error:', regError);
          toast({
            title: 'Registration Failed',
            description: `Error: ${regError.message || 'Unknown error'}. ${regError.details || ''} ${regError.hint || ''}`,
            variant: 'destructive',
          });
          throw new Error(regError.message || 'Failed to save registration details.');
        }

        registrationId = newReg.id;
        paymentPayload = payload; // Use individual payload for order creation

        // 2. Create Order via Backend (Backend handles Registration update + Order creation)
        // Backend validates amount. We only pass details.
        const { order: newOrder } = await razorpayService.createOrder({
          createRegistration: false, // Handled by frontend now
          registrationId, // Pass the ID we just created
          full_name: paymentPayload.full_name,
          name: paymentPayload.full_name, // Backend expects 'name' for notes
          email: paymentPayload.email,
          phone: paymentPayload.phone,
          date_of_birth: paymentPayload.date_of_birth,
          state: paymentPayload.state,
          city: paymentPayload.city,
          position: paymentPayload.position || 'Batting',
          pincode: paymentPayload.pincode,
          // UTM
          utm_source: utmData?.utm_source,
          utm_medium: utmData?.utm_medium,
          utm_campaign: utmData?.utm_campaign,
          utm_content: (utmData as any)?.utm_content,
          utm_term: (utmData as any)?.utm_term,
          qr_code_id: qrCodeId,
          amount: totalAmount * 100, // IMPORTANT: Backend expects amount in paise if passed directly, or it recalculates. Need to send current totalAmount in Paise * 100. Wait, previous branch multiplied by 100. Let's make sure it matches Razorpay's format if the backend accepts it directly. Actually `totalAmount` is handled by Razorpay's handler but the API takes it. Wait, `totalAmount` is in Rupees. The order.amount will be whatever the server returns. Our backend logic takes `amount` (in paise).
          notes: {
            discount_amount: discountAmount,
          },
        });
        order = newOrder; // Assign to outer scope variable
      }

      // 4. Supabase Realtime Listener (Replacing SSE)
      // Listen for updates to razorpay_ledger for this specific order
      if (order && order.id) {
        // Fix: Set createdRegistration so success modal has data to display
        setCreatedRegistration({
          ...paymentPayload,
          registrationType,
          teamName: teamDetails.teamName,
          teamMembers: teamDetails.players,
        });

        console.log(`Subscribing to payment updates for order: ${order.id}`);
        // Remove 'api' schema prefix if it was there, we want public table access
        const channel = supabase
          .channel(`payment-${order.id}`)
          .on(
            'postgres_changes',
            {

              event: '*',
              schema: 'public',
              table: 'razorpay_ledger',
              filter: `order_id=eq.${order.id}`,
            },
            (payload) => {
              console.log('Payment update received:', payload);
              const newRecord = payload.new as any;

              if (newRecord && (newRecord.status === 'captured' || newRecord.status === 'authorized')) {
                setPaymentData({
                  razorpay_payment_id: newRecord.payment_id,
                  razorpay_order_id: order.id,
                  amount: newRecord.amount,
                  date: new Date().toLocaleDateString(),
                  registrationId,
                });
                setShowSuccessModal(true);
                setRazorpayModalOpen(false);
                supabase.removeChannel(channel);
              }
            },
          )
          .subscribe();
      }

      setRazorpayModalOpen(true);

      // 2. Initiate Payment
      // Razorpay order.amount is in paise.
      await razorpayService.initiatePayment({
        amountPaise: order.amount,
        orderId: order.id,
        customerName: paymentPayload.full_name,
        customerEmail: paymentPayload.email,
        customerPhone: paymentPayload.phone,
        onDismiss: () => {
          setRazorpayModalOpen(false);
          setIsProcessing(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment. Click the button again to retry.',
            variant: 'destructive',
          });
        },
        onSuccess: async (response: RazorpayPaymentSuccessResponse) => {
          setRazorpayModalOpen(false);
          toast({
            title: 'Payment Received',
            description: 'Verifying...',
          });

          try {
            // 3. Verify Payment
            await razorpayService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              registrationId, // Pass registrationId returned by createOrder
            );

            // 4. Show Success immediately (Client-side fallback/primary)
            setPaymentData({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || order.id,
              amount: order.amount / 100,
              date: new Date().toLocaleDateString(),
              registrationId,
            });
            setShowSuccessModal(true);

          } catch (error: any) {
            console.error('Payment verification failed:', error);
            // Even if verification call fails technically, if we got here, payment likely worked.
            // But safely show error or redirect.
            toast({
              title: 'Verification Issue',
              description: 'Payment successful but verification response delayed. Check email.',
            });

            // Still show success modal as per user instruction "Show success modal immediately"
            setPaymentData({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || order.id,
              amount: order.amount / 100,
              date: new Date().toLocaleDateString(),
              registrationId,
            });
            setShowSuccessModal(true);
          }
        },
        onFailure: async (error: RazorpayPaymentFailedError) => {
          setRazorpayModalOpen(false);
          setIsProcessing(false);
          setPaymentError(error?.description || error?.reason || 'Payment failed.');
          toast({
            title: 'Payment Failed',
            description: error?.description || 'Payment could not be processed.',
            variant: 'destructive',
          });
        },
      });

    } catch (error: any) {
      setIsProcessing(false);
      setPaymentError(error.message || 'Failed to initiate payment.');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Removed multi-step icons and logic as form is now single-page


  if (loadingSettings) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="lg" text="Loading registration details..." />
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      <style>{`
          @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
          .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
          .animate-fade-in { animation: fadeIn 0.5s ease-out; }
          input, select, textarea { pointer-events: auto !important; }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex justify-center mb-6">
          <div className="bg-white p-1.5 rounded-2xl shadow-lg border border-white/20 inline-flex">
            <button
              type="button"
              onClick={() => { setRegistrationType('individual'); }}
              className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${registrationType === 'individual'
                ? 'bg-blue-600 text-white shadow-xl scale-105'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
            >
              <User className="w-4 h-4" />
              Individual/Student
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sport-orange to-green-600 rounded-2xl px-6 py-4 text-center shadow-xl border border-sport-orange/50 mb-8 animate-fade-in">
          <p className="text-white font-black text-lg tracking-tight flex flex-wrap justify-center items-center gap-1">
            🎯 Registration Fee: <span className="text-white">₹{finalBase - 300}</span> + Trials Fee: <span className="text-white">₹300</span> <span className="text-white text-sm font-bold">+ GST ({gstPercentage}%) {registrationType !== 'individual' ? 'per player' : ''}</span> = <span className="text-white text-2xl font-black">₹{finalTotal}</span>
          </p>
        </div>

        <div className="bg-[#0A1628] glass-card rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 animate-scale-up">
          {/* Step Header */}
          <div className={`bg-gradient-to-r ${registrationType === 'individual' ? 'from-blue-500 to-indigo-600' : registrationType === 'team' ? 'from-sport-orange to-green-600' : 'from-purple-600 to-indigo-800'} p-6 text-white relative overflow-hidden transition-all duration-500`}>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                {registrationType === 'individual' ? <User className="w-8 h-8" /> : registrationType === 'team' ? <Users className="w-8 h-8" /> : <Building className="w-8 h-8" />}
              </div>
              <div>
                <p className="text-white/70 text-xs font-black mb-1 uppercase tracking-[0.2em]">{registrationType === 'individual' ? 'Individual/Student' : registrationType === 'team' ? 'Team' : 'Students'} Registration</p>
                <h2 className="text-2xl font-black uppercase tracking-tight">Complete Your Details</h2>
              </div>
            </div>
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-12 -translate-y-12">
              {registrationType === 'individual' ? <User className="w-64 h-64" /> : registrationType === 'team' ? <Users className="w-64 h-64" /> : <Building className="w-64 h-64" />}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {registrationType === 'individual' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold !text-black flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" /> Personal Information
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">
                          Full Name<span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.full_name ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                          placeholder="Enter your full name"
                          aria-invalid={fieldErrors.full_name || undefined}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">
                          Date of Birth<span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          max={todayYMD()}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.date_of_birth ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                          aria-invalid={fieldErrors.date_of_birth || undefined}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">
                          Email<span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.email ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                          placeholder="email@example.com"
                          aria-invalid={fieldErrors.email || undefined}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">
                          Contact Number<span className="text-red-500"> *</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 !text-black font-bold text-sm">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full pl-14 pr-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.phone ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                            placeholder="10-digit number"
                            maxLength={10}
                            aria-invalid={fieldErrors.phone || undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location & Role */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-lg font-bold !text-black flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-sport-orange" /> Location & Role
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">State *</label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.state ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                        >
                          <option value="">Select State</option>
                          {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">City / District *</label>
                        <select
                          name="cityDistrict"
                          value={formData.cityDistrict}
                          onChange={handleInputChange}
                          disabled={!formData.state}
                          className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 !text-black font-medium ${fieldErrors.cityDistrict ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                        >
                          <option value="">Select City</option>
                          {availableCitiesDistricts.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">PIN Code *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          maxLength={6}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.pincode ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                          placeholder="Enter Pincode"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">Player Type *</label>
                        <select
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.position ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                        >
                          <option value="">Select Position</option>
                          <option value="Batting">🏏 Batting</option>
                          <option value="Bowling">⚡ Bowling</option>
                          <option value="All-Rounder">⭐ All-Rounder</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-1 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">School / College Name *</label>
                        <input
                          type="text"
                          name="school_name"
                          value={formData.school_name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.school_name ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                          placeholder="Enter School or College Name"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="player_photo" className="block text-sm font-bold !text-black mb-2">Player Photo</label>
                      <input
                        ref={photoInputRef}
                        id="player_photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                      {photoPreview ? (
                        <div className="flex items-center gap-4 p-3 bg-white border-2 border-slate-200 rounded-xl">
                          <img src={photoPreview} alt="Selected player photo" className="w-20 h-20 rounded-lg object-cover object-top shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium !text-black truncate">{photoFile?.name}</p>
                            <button type="button" onClick={() => photoInputRef.current?.click()} className="mt-1 text-sm font-bold text-blue-600 underline">
                              Change photo
                            </button>
                          </div>
                          <button type="button" onClick={removePhoto} aria-label="Remove photo" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-4 bg-white border-2 border-dashed border-slate-300 rounded-xl text-left hover:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all"
                        >
                          <Camera className="w-6 h-6 text-blue-600 shrink-0" />
                          <span>
                            <span className="block text-sm font-bold !text-black">Upload a photo</span>
                            <span className="block !text-xs !text-slate-500">Clear face photo · JPG, PNG or WEBP</span>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={e => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="acceptTerms" className="text-sm font-medium !text-black leading-relaxed cursor-pointer">
                      I agree to the <TermsAndConditions trigger={<span className="text-blue-600 underline font-bold">Terms & Conditions</span>} asLink={true} />
                    </label>
                  </div>

                  <div className="mt-8 space-y-6 pt-6 border-t-2 border-slate-100">
                    <div className="bg-white/5 rounded-2xl p-6 border-2 border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold !text-black uppercase tracking-wider">Individual/Student Payment</span>
                        <div className="text-right">
                          <span className="text-3xl font-black !text-black">₹{totalAmount}</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm !text-black font-medium">
                        <div className="flex justify-between">
                          <span>Base Registration:</span>
                          <span>₹{baseAmount - (300 * multiplier)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trials Fee:</span>
                          <span>₹{300 * multiplier}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1 mb-1">
                          <span>GST ({gstPercentage}%):</span>
                          <span>₹{gstAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(registrationType === 'team' || registrationType === 'students') && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-8">
                  {/* Team/School Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold !text-black flex items-center gap-2">
                      {registrationType === 'students' ? <Building className="w-5 h-5 text-purple-600" /> : <Users className="w-5 h-5 text-blue-600" />} {registrationType === 'students' ? 'School/Organization' : 'Team'} Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">{registrationType === 'students' ? 'School/College/Organization Name *' : 'Team Name *'}</label>
                        <input
                          type="text"
                          name="teamName"
                          value={teamDetails.teamName}
                          onChange={handleTeamDetailsChange}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.teamName ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                          placeholder={`Enter ${registrationType === 'students' ? 'School/College/Organization' : 'Team'} Name`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">Number of Players *</label>
                        <input
                          type="number"
                          name="playerCount"
                          min="1"
                          value={teamDetails.playerCount || ''}
                          onChange={handleTeamDetailsChange}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.playerCount ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                          placeholder={registrationType === 'students' ? 'Ex: 1' : 'Ex: 11'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team/School Location */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-lg font-bold !text-black flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-sport-orange" /> {registrationType === 'students' ? 'School/Organization' : 'Team'} Location
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">State *</label>
                        <select
                          name="state"
                          value={teamDetails.state}
                          onChange={handleTeamDetailsChange}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all !text-black font-medium ${fieldErrors.state ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                        >
                          <option value="">Select State</option>
                          {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold !text-black mb-2">City / District *</label>
                        <select
                          name="cityDistrict"
                          value={teamDetails.cityDistrict}
                          onChange={handleTeamDetailsChange}
                          disabled={!teamDetails.state}
                          className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 !text-black font-medium ${fieldErrors.cityDistrict ? 'border-red-400' : 'border-white/20 focus:border-transparent'}`}
                        >
                          <option value="">Select City</option>
                          {teamAvailableCities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Players/Students List */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-lg font-bold !text-black flex items-center gap-2">
                      <History className="w-5 h-5 text-purple-600" /> {registrationType === 'students' ? 'Students/Personnel' : 'Players'} List
                    </h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {teamDetails.players.map((player, index) => (
                        <div key={index} className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100 relative pt-10">
                          <div className="absolute top-0 left-0 bg-slate-800 text-white text-xs font-black uppercase px-4 py-1 rounded-br-xl rounded-tl-xl">
                            {registrationType === 'students' ? 'Student/Personnel' : 'Player'} {index + 1} {index === 0 && (registrationType === 'students' ? '(Primary Contact)' : '(Captain)')}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-[10px] font-bold !text-black uppercase mb-1">Full Name</label>
                              <input type="text" name="full_name" value={player.full_name} onChange={e => handleInputChange(e, index)} className="w-full px-3 py-2 bg-white border-2 rounded-lg text-sm !text-black font-medium transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold !text-black uppercase mb-1">Email</label>
                              <input type="email" name="email" value={player.email} onChange={e => handleInputChange(e, index)} className="w-full px-3 py-2 bg-white border-2 rounded-lg text-sm !text-black font-medium transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent" placeholder="email@example.com" />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold !text-black uppercase mb-1">Date of Birth</label>
                              <input type="date" name="date_of_birth" value={player.date_of_birth} onChange={e => handleInputChange(e, index)} max={todayYMD()} className="w-full px-3 py-2 bg-white border-2 rounded-lg text-sm !text-black font-medium transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold !text-black uppercase mb-1">Phone</label>
                              <input type="tel" name="phone" value={player.phone} onChange={e => handleInputChange(e, index)} maxLength={10} className="w-full px-3 py-2 bg-white border-2 rounded-lg text-sm !text-black font-medium transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold !text-black uppercase mb-1">Position</label>
                              <select name="position" value={player.position} onChange={e => handleInputChange(e, index)} className="w-full px-3 py-2 bg-white border-2 rounded-lg text-sm !text-black font-medium transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent">
                                <option value="">Select</option>
                                <option value="Batting">🏏 Batting</option>
                                <option value="Bowling">⚡ Bowling</option>
                                <option value="All-Rounder">⭐ All-Rounder</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={e => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="acceptTerms" className="text-sm font-medium !text-black leading-relaxed cursor-pointer">
                      I agree to the <TermsAndConditions trigger={<span className="text-blue-600 underline font-bold">Terms & Conditions</span>} asLink={true} />
                    </label>
                  </div>

                  {/* Team/Students Payment Summary at Bottom */}
                  <div className="mt-8 pt-6 border-t-2 border-slate-100">

                    <div className="bg-white/5 rounded-2xl p-6 border-2 border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold !text-black uppercase tracking-wider">Total {registrationType === 'students' ? 'Students' : 'Team'} Payment</span>
                        <div className="text-right">
                          <span className="text-3xl font-black !text-black">₹{totalAmount}</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm !text-black font-medium">
                        <div className="flex justify-between">
                          <span>Registration ({teamDetails.playerCount} {registrationType === 'students' ? 'students' : 'players'}):</span>
                          <span>₹{baseAmount - (300 * multiplier)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trials Fee ({teamDetails.playerCount} {registrationType === 'students' ? 'students' : 'players'}):</span>
                          <span>₹{300 * multiplier}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1 mb-1">
                          <span>GST ({gstPercentage}%):</span>
                          <span>₹{gstAmount}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between font-bold text-green-700 mb-2">
                            <span>Discount:</span>
                            <span>-₹{discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black !text-black pt-1 border-t border-white/10">
                          <span>Net Total:</span>
                          <span>₹{totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-bold border-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'} animate-fade-in`}>
            {message.text}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex justify-center w-full mt-8">
          <button
            onClick={() => {
              if (!validateForm()) return;
              googleAnalytics.trackButtonClick('proceed_to_payment', 'registration_form_single_step');
              handlePayment();
            }}
            disabled={isProcessing || !acceptTerms}
            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 !text-black font-black rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100 uppercase tracking-widest text-lg"
          >
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>) : 'Pay & Register'} <CreditCard className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showSuccessModal && createdRegistration && paymentData && (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
          <PaymentSuccessCelebration
            isOpen={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              window.location.href = '/registration/success';
            }}
            playerDetails={{
              full_name: createdRegistration.full_name,
              email: createdRegistration.email,
              phone: createdRegistration.phone,
              date_of_birth: createdRegistration.date_of_birth,
              state: createdRegistration.state,
              city: createdRegistration.city,
              position: createdRegistration.position,
              pincode: createdRegistration.pincode,
              preferred_trials: createdRegistration.preferred_trials,
              school_name: createdRegistration.school_name,
            }}
            paymentData={paymentData}
            photoUrl={photoPreview}
            photoFile={photoFile}
          />
        </Suspense>
      )}
    </div>
  );
};

export default PlayerRegistrationStepper;
