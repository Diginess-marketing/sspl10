import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ShieldCheck, UserPlus } from 'lucide-react';
import SelectorRegistrationForm from './SelectorRegistrationForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { googleAnalytics } from '@/utils/googleAnalytics';

const SelectorRegistrationButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className="selector-registration-button"
                    style={{ transform: 'rotate(270deg)' }}
                    onClick={() => googleAnalytics.trackButtonClick('selector_registration_button', 'vertical_sticky')}
                >
                    <UserPlus className="selector-registration-button-icon" style={{ transform: 'rotate(-270deg)' }} />
                    <span className="selector-registration-button-text">
                        Selector Registration
                    </span>
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto m-2">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-cricket-blue text-lg sm:text-xl">
                        <ShieldCheck className="w-5 h-5" />
                        SSPL T10 Selectors Registration
                    </DialogTitle>
                    <DialogDescription>
                        Register as a selector for the SSPL T10 cricket tournament. Fill out the form below to complete your registration.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <SelectorRegistrationForm />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SelectorRegistrationButton;