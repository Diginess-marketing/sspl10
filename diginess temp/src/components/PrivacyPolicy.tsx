import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

import { Link } from 'react-router-dom';

interface PrivacyPolicyProps {
  trigger?: React.ReactNode;
  asLink?: boolean;
}

const PrivacyPolicy = ({ trigger, asLink = false }: PrivacyPolicyProps) => {
  const defaultTrigger = asLink ? (
    <Link to="/privacy-policy" className="text-teal-400 cursor-pointer">
      Privacy Policy
    </Link>
  ) : (
    <Button variant="ghost" size="sm" className="text-cricket-blue hover:text-cricket-yellow">
      <Shield className="w-4 h-4 mr-2" />
      Privacy Policy
    </Button>
  );

  if (asLink) {
    return defaultTrigger;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-white text-slate-900 border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-cricket-blue text-2xl">
            Privacy Policy
          </DialogTitle>
          <DialogDescription>
            Read our privacy policy to understand how we collect, use, and protect your personal information.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm policy-container">
            <p className="text-muted-foreground">
              <strong>Last updated: June 14, 2025</strong>
            </p>

            <p>
              This document is an electronic record in terms of Information Technology Act, 2000 and rules made thereunder and as the same may be amended from time to time. Being a system generated electronic record, it does not require any physical or digital signature.
            </p>

            <p>
              Greetings from <strong>Southern Street Premier League (SSPL)</strong>. By accessing the Website from any computer, device, mobile, smartphone or any electronic device, you expressly agree to be bound by this Privacy Policy.
            </p>

            <p>
              We respect the privacy of our Website users and the confidentiality of the information provided by them and have developed this Privacy Policy to demonstrate our commitment to protecting the same. This Privacy Policy describes the type of information we collect, purpose, usage, storage and handling of such information, and disclosure thereof. We encourage you to read this Privacy Policy carefully when using our Website or availing any products or services offered on or through the Website. By using our Website you are accepting the practices described in this Privacy Policy.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue">1. What Information Do We Collect</h3>

              <h4 className="font-semibold">Personal and Non-personal information</h4>
              <p>
                When you use the Website, we collect your personal and non-personal information. Your personal information helps us to collect information that can directly identify you such as your name, address, email address, phone number. We also collect your non-personal information that does not directly identify you. By using the Website, you are authorizing us to collect, parse, store, process, disclose, disseminate and retain such information as envisaged herein. Your personal information shall not be made public or made available to other users without your explicit permission.
              </p>

              <h4 className="font-semibold">Geographical Information</h4>
              <p>
                When you use the Website, you may be asked to allow us to collect your location information from the device/computer when you use the Website. In addition, we may collect and store any personal information you provide while using our Website or in some other manner. If you contact us for customer service or other enquiry, you provide us with the content of that communication.
              </p>

              <p>
                If you place an order for any products or services from the Website, we collect information that you provide to us such as your contact and postal details, shipping, billing, and payment information (such as credit card, debit card or bank account details). You may also have the option to store payment information to make it easier to purchase products or avail services from our Website in the future.
              </p>

              <h4 className="font-semibold">Restrict Access Based on Age Group</h4>
              <p>
                We neither knowingly collect any information nor promote our Website to any minor under the age of 12 years. If you are under the age of 12, or if you are considered a minor in your jurisdiction, you must not access or use our website, we request that you do not submit information to us. If we become aware that a minor has registered with us and provided us with personal information, we may take steps to terminate such person registration and delete their account with us.
              </p>

              <p>
                We use various tools and technologies, including cookies, to collect your personal information and non-personal information from the device from which you access the Website and learn about your activities taking place under your account when you use our Website. Such non-personal information could include your IP address, device ID and type, your browser type and language, operating system used by your device, access times, your device/computer geographic location and the referring website address. We may use web beacons and other similar technologies to track your use of our Website and to deliver or communicate with cookies.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue">2. How We Use the Information We Collect</h3>
              <p>
                We may use information that we collect from you to deliver and improve our products and services, and manage our business; manage your account and provide you with customer support; perform research and analysis about your use of, or interest in, other users products, services, or content; communicate with you by email, postal mail, telephone and/or mobile devices about products or services that may be of interest to you; develop, display, and track content and advertising tailored to your interests on our Website; perform website analytics; enforce or exercise any rights in our Website Terms and Conditions; perform functions or services as otherwise described to you at the time of collection; and resolve disputes, troubleshoot problems, detect and protect us against any activity not expressly authorized under the Website Terms & Conditions.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue">3. With Whom We Share Your Information</h3>
              <p>
                When you register with our Website, your profile details (or information you have provided us directly or through your social media login account, if permitted) may be accessible and viewable by other Website users.
              </p>
              <p>
                We do not share your personal information with others except as indicated in this Privacy Policy or unless you have opted to reveal your personal information in your profile on the Website.
              </p>
              <p>
                We may also disclose your personal information for complying with applicable laws, requests or orders from law enforcement agencies, appropriate authorities or for any legal process; for enforcing the Website Terms and Conditions; for protecting or defending ours, any Website users or any third party rights or property; for supporting any fraud/legal investigation/verification checks; or in connection with a corporate transaction, including but not limited to sale of our business, merger, consolidation, or in the unlikely event of bankruptcy.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue">4. How Can You Access or Control Your Information</h3>
              <p>
                If you have a Website account with us, you can review and update your personal information by opening and editing your profile details. In addition, we give you the control to opt out of having your personal information shared, via the Website settings. If you logout of your Website account, we may retain certain information associated with your account for analytical purposes and recordkeeping purposes or as required by law, as well as to prevent fraud, enforce our Website Terms and Conditions, take actions we deem necessary to protect the integrity of our Website or other Website users, or take other actions otherwise permitted by law.
              </p>
              <p>
                You can choose not to provide us with certain information; however this may result in you being unable to use certain features of our Website. Our Website may also deliver notifications to your email and/or mobile device. You can disable these notifications by changing your Website account settings.
              </p>
              <p>
                You are solely liable and responsible for any information you provide and/or share using the Website.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue">5. How Do We Protect Your Personal Information</h3>
              <p>
                We adopt reasonable security practices and procedures to help safeguard your personal information under our control from unauthorized access. However, you acknowledge that no Internet transmission or system or server can be 100% secure. Therefore, although we take all reasonable steps to secure your personal information, we do not promise or guarantee the same, and you should not expect that your personal information, or other communications while using the Website will always remain secure and safeguarded by us. You should always exercise caution while providing, sharing or disclosing your personal information using the Website.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue">6. Children Privacy</h3>
              <p>
                Although our website is intended for a general audience, we make every effort to restrict its use to individuals aged 12 and above. We do not knowingly collect, maintain, or use personal information from children under the age of 12.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue">7. Changes to this Privacy Policy</h3>
              <p>
                We may occasionally update this Privacy Policy. When we post changes to this Privacy Policy, we will revise the last updated date. We recommend that you check our Website from time to time to keep yourself updated of any changes in this Privacy Policy or any of our other Website related terms and policies.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue">8. Contact Us</h3>
              <p>
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p>
                Email: customercare@sspl.co.in
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;