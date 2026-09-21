import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

import { Link } from 'react-router-dom';

interface TermsAndConditionsProps {
  trigger?: React.ReactNode;
  asLink?: boolean;
}

const TermsAndConditions = ({ trigger, asLink = false }: TermsAndConditionsProps) => {
  const defaultTrigger = asLink ? (
    <Link to="/terms-and-conditions" className="text-teal-400 cursor-pointer">
      Terms & Conditions
    </Link>
  ) : (
    <Button variant="ghost" size="sm" className="text-cricket-blue hover:text-cricket-yellow">
      <FileText className="w-4 h-4 mr-2" />
      Terms & Conditions
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
            Terms & Conditions
          </DialogTitle>
          <DialogDescription>
            Read our terms and conditions to understand the rules and regulations for using our services and participating in the cricket league.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm policy-container">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-cricket-blue mb-2">Southern Street Premier League 2025</h1>
              <h2 className="text-xl font-semibold text-cricket-blue mb-4">Terms & Conditions</h2>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Age Eligibility:</strong> Participants must be 12 years or older. (As on date of registration)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Registration Fee:</strong> ₹699 + GST, non-refundable.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Payment Modes:</strong> Accepted via GPay, UPI, cards, or net banking.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Trial Venue:</strong> Player will be allotted nearest trial location via email and Advanced Levels trials (Level 4 & 5) will be conducted in Chennai.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Trial Format:</strong> Level 1 & 2 trials use traditional methods where players get 12 balls for batting or bowling. Level 3 trials use AI-based techniques for precision assessment. Selectors' decision is final in all levels of trials.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Travel & Stay:</strong> All travel, food, and accommodation are at the player's own expense.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Substance Use:</strong> Alcohol or drug use leads to immediate disqualification.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Communication:</strong> Trial and selection details will be shared via E-Mail and WhatsApp.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Punctuality:</strong> Players must arrive at least 25 minutes before their scheduled slot.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>ID Proof:</strong> A government-issued ID with DOB (like Aadhaar) is mandatory.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Final Selection:</strong> Top 500 players will be announced after Level 3 of Trials for the Final Auction.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Decisions:</strong> All selection results are final and player has to abide by it.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Multiple Entries:</strong> Players may register at multiple locations by paying ₹699 + GST for each registration.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Equipment:</strong> Balls are provided and must be returned after use. Players must bring their own kits. Players may use bats provided by the company in case of non-availability. Fiber Bats and Srilankan Bats are not allowed.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Dress Code:</strong> Players must wear proper sports attire.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Agreement:</strong> Top 300 selected players may sign a separate Contract with the Company for further participation in the League.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Liability:</strong> Organizers are not responsible for personal loss/injury; basic first aid will be available.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Schedule Changes:</strong> Dates and venues may change with prior notice.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Organizer Rights:</strong> SSPL reserves the rights to alter any events due to technical or natural.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>False Info:</strong> Providing incorrect information leads to disqualification.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Support:</strong> Contact Customer Care at +91 880 777 5960 for any queries.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Jurisdiction:</strong> Legal disputes will be handled in Chennai courts only.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Foreign Players:</strong> Must pay $60 registration and should not use SSPL's player registration for VISA processing.</span>
                  </li>

                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Slot Confirmation:</strong> Venue details for the trial will be shared with you 5 days prior to the scheduled date. You will receive a confirmation message/email with location, reporting time, and other relevant instructions.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Below 12 years:</strong> Will be considered as guest participants.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Website Purpose:</h3>
              <p className="text-justify">
                The Website is mainly for players who want to enroll themselves and participate in the SSPL League. Any interested player can enroll with the SSPL by filling the form available at the link /register and providing with all the requested details in the said form.
              </p>

              <p className="text-justify">
                Each interested player is required to submit the said enrollment form by paying an enrollment fee of Rs. 699/- + applicable GST. Under no circumstances will the said fee be refundable and/or transferable for any reason whatsoever.
              </p>

              <p className="text-justify">
                Each interested player is required to provide all the details as requested in the enrollment form. The League Owner shall have the right and discretion to reject any incomplete forms without requiring to provide any reason or refund of fee whatsoever.
              </p>

              <p className="text-justify">
                Once all the details are filled in and the enrollment form is submitted to the Website, a player profile is generated by the Website for the SSPL selection committee to allocate the players for trials.
              </p>

              <p className="text-justify">
                Once the SSPL selection committee allocates the trials, the players will be notified by the League Owner with all other relevant details pertaining to the SSPL. The players will also be required to travel to mentioned cities for trials and all travel, lodging, boarding and related costs shall be borne by the players.
              </p>

              <p className="text-justify">
                The player registration and selection details are as under:
              </p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>Registration closing date: as per Website Notification.</li>
                <li>SSPL will allocate players for trials and send notifications through E-Mail and WhatsApp.</li>
                <li>Physical trials shall be conducted in the specified cities on specified days or as per Fixtures and Conditions.</li>
                <li>Top 500 players will be announced after Level 3 trials for the final auction.</li>
                <li>It is expressly stated that the League Owner reserves its right to cancel or amend the at any stage in any manner and/or to cancel or abandon the SSPL for any reason whatsoever at its sole discretion.</li>
              </ol>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Acceptance of Terms, etc:</h3>
              <p className="text-justify">
                These Terms is in the form of an electronic and legally binding contract that establishes the terms and conditions you have accepted before using the Website or any part thereof. These include our Privacy Policy and Other Policies as mentioned in these Terms as well as other specific policies and terms and conditions disclosed to you, in case you avail any subscription or any additional features, products or services we offer on or through the Website, whether free or otherwise, including but not limited to terms governing features, billing, subscriptions, free trials, promotions and discounts. By using the Website, you hereby unconditionally consent and accept to these Terms, Privacy Policy and Other Policies. To withdraw such consent, you must immediately cease using the Website and terminate your account with us. You are requested to keep a physical copy of these Terms and all other referred policies herein for your records.
              </p>

              <p className="text-justify">
                You consent to have these Terms and all notices provided to you in electronic form.
              </p>

              <p className="text-justify">
                Every time you use the Website, you confirm your agreement with these Terms, Privacy Policy and Other Policies.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Eligibility:</h3>
              <p className="text-justify">
                The minimum age to use the Website is 12 (twelve) years. By using the Website and in order to be competent to contract under applicable law, you represent and warrant that you are at least 12 (twelve) years of age or not a minor in any other jurisdiction from where you access the Website.
              </p>

              <p className="text-justify">
                By using the Website, you hereby represent and warrant to us that you have all right, authority and capacity to enter into these Terms and to abide by all of the terms and conditions thereof.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Website Account:</h3>
              <p className="text-justify">
                In order to use the Website, the Registered Player will be given specific login and password. For more information regarding the type/nature of information we collect from you and how we use it, please refer our Privacy Policy available at /privacy-policy
              </p>

              <p className="text-justify">
                Your account login details will be kept private and confidential and should not be disclosed to or permitted to be used by anyone else and you are solely responsible and liable for any and all usage and activity on the Website that takes place under your account.
              </p>

              <p className="text-justify">
                By agreeing to these Terms, you grant us the permission to send electronic communications to you as part of our offering. This includes but is not limited to sending emails, newsletters, notifications and promotional offers from us and our partners. Should you no longer wish to receive such electronic communications, you may write to us at support@Www.ssplt10.co.in
              </p>

              <p className="text-justify">
                Any account you open with us is personal to you and you are prohibited from gifting, lending, transferring or otherwise permitting any other person or entity to access or use your account in any way whatsoever.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Term and Termination:</h3>
              <p className="text-justify">
                These Terms will remain in full force and effect while you use the Website or any part thereof, as a registered user.
              </p>

              <p className="text-justify">
                You may terminate or disable your Website account at any time and for any reason by deleting your profile and Website account.
              </p>

              <p className="text-justify">
                We may terminate or suspend, whether temporarily or permanently, your Website account at any time without notice and for any reason. Further, at our sole discretion, we may terminate or suspend, whether temporarily or permanently, your Website account at any time without notice if we reasonably believe that you have breached these Terms, or for any other reason, with or without cause. After your Website account is terminated or suspended, all the terms hereof shall survive such termination or suspension, and continue in full force and effect, except for any terms that by their nature expire or are fully satisfied. You acknowledge that we reserve the right to terminate or delete your account in case it remains 'inactive' for a duration as determined by us in our sole discretion. If we terminate or suspend your account because you have breached these Terms or Other Policies, you will not be entitled to any refund of any unused subscription fees or refund of any fees towards any in-Website purchases.
              </p>

              <p className="text-justify">
                Following termination of these Terms, we will only retain and use your content in accordance with these Terms.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Website Usage:</h3>
              <p className="text-justify">
                The Website is strictly available for your personal use only.
              </p>

              <p className="text-justify">
                You are hereby strictly prohibited from and against:
              </p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>Undertaking any marketing, promotion, advertising or soliciting any other Website user to buy or sell any products or services whether through the Website or not.</li>
                <li>Transmitting any chain letters, junk, bulk or spam e-mail or other unsolicited communications of any kind whatsoever to other Website users or publishing the same on the Website or anywhere else.</li>
                <li>Defaming, stalking, harassing, abusing or contacting any Website user with a malicious intent or using the details of any Website user for any purpose not expressly permitted under these Terms.</li>
                <li>It is hereby expressly clarified that any of the aforesaid acts undertaken by you shall be to your sole liability, responsibility, risk and consequences and you hereby agree to indemnify us for the same.</li>
              </ol>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Account Security:</h3>
              <p className="text-justify">
                You shall be solely responsible and liable for maintaining the utmost privacy and confidentiality of your Website log-in (username and password) details as well as for any and all activities that occur under your log-in. You agree to immediately notify us of any disclosure or unauthorized use of your log-in or any other breach of security at customercare@ssplt10.co.in and ensure that you log-out from your account at the end of each session.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Proprietary Rights:</h3>
              <p className="text-justify">
                All content on this Website, including images, illustrations, audio and video clips, are protected by copyrights, trademarks, and other intellectual property rights that are owned and controlled by us or by our licensors.
              </p>

              <p className="text-justify">
                You confirm and agree that we are the owner of the proprietary information made available to you through the Website and hereby retain all proprietary and intellectual property rights in the same, including but not limited to all confidential information.
              </p>

              <p className="text-justify">
                You undertake not to copy, modify, transmit, disclose, show in public, create any derivative works from, distribute, make commercial use of, or reproduce in any way, and whether partly or fully, any (i) confidential or proprietary information, or (ii) intellectual property, including copyrights, trademarks, service marks or other proprietary information accessible via the Website without first obtaining our prior written consent. Any of the foregoing acts undertaken by you without our express permission constitutes breach of these Terms as well as breach of infringement of ours/our licensors intellectual and other proprietary rights
              </p>

              <p className="text-justify">
                Other Website users may upload/publish/post any copyrighted information, which may have copyright protection or not or which may be identified as copyright. You undertake not to copy, modify, publish, transmit, distribute, perform, display, commercially use/exploit, sell or use such information in any way and for any purpose whatsoever.
              </p>

              <p className="text-justify">
                By posting information or content to any profile pages or public area of the Website, or making it accessible to us by linking your account to any social network accounts (e.g. via Facebook, Twitter, Instagram etc.), you grant us unconditionally and in perpetuity, and represent and warrant that you have the right to grant to us, an irrevocable, perpetual, non-exclusive, transferable, sub-licensable, fully-paid/royalty-free, worldwide license to use, reproduce, publicly perform, publicly display and distribute such information and content, and to prepare derivative works of, or incorporate into other works, such information and content, and to grant and authorize sub-licenses of the foregoing in any media now known or hereafter created. From time to time, we may modify, add or vary existing features or programs of the Website or create, add, test or implement new features or programs on the Website in which you may voluntarily choose to participate or may be a part of a test group with special access, in accordance with the additional terms and conditions of such features or programs. By participating in such features or programs, you grant us an unconditional and perpetual right and consent to the terms and conditions (if any) of such features or programs which will be in addition to these Terms.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">User Information:</h3>
              <p className="text-justify">
                For information about the collection and possible use of information and content provided by you, please review our Privacy Policy available at /privacy-policy
              </p>

              <p className="text-justify">
                Notwithstanding any other provisions of these Terms, we reserve the right to disclose any information that you submit to us, if in our sole opinion, we reasonably believe that such disclosure is required to be disclosed (i) for complying with applicable laws, requests or orders from law enforcement agencies, appropriate authorities (such as without limitation, court officials, expert professional investigative agencies and the like) or for any legal process; (ii) for enforcing these Terms; (iii) for protecting or defending ours, any Website user or any third party's rights or property; or (iv) for supporting any fraud/ legal investigation/ verification checks. You acknowledge and understand the provisions of this Clause and grant us an unconditional, perpetual right and permission to make such disclosure.
              </p>

              <p className="text-justify">
                By using the Website, you hereby permit us to use the information you provide us, including your experiences to facilitate us to improve the Website and its functionality as well as for promotional purposes, including the permission to publish your non-personal information in any of our partner websites.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Prohibited Activities:</h3>
              <p className="text-justify">
                We reserve the right to investigate, suspend and/or terminate, whether temporarily or permanently, your Website account with us if you undertake any of the following acts:
              </p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>Breach these Terms, Privacy Policy or Other Policies.</li>
                <li>Abuse, impersonate or defame us or any Website user or any other person, entity or any religious community.</li>
                <li>Use the Website for any commercial use or activity, including for any unlawful activity, not expressly permitted as per aforesaid Clause 5 of these Terms.</li>
                <li>Make any statements, whether expressed or implied, and whether privately or publicly, as those endorsed by us without our specific prior written consent.</li>
                <li>Use the Website in an illegal manner or commit an illegal or unlawful act or use the Website in any manner not expressly authorized by us.</li>
                <li>Access the Website from a jurisdiction in which it is illegal or unauthorized or barred.</li>
                <li>Undertake, ask, solicit or use Website users to conceal the identity, source, or destination of any illegally gained money, services or products.</li>
                <li>Use any robot, spider, tool, site search/retrieval application, or other manual or automatic device or process to retrieve, index, data mine, or in any way reproduce or circumvent the navigational structure or presentation of the Website.</li>
                <li>Collect any personal information, including contact details, of any Website users by forcing any Website user by electronic or any other means and for any purpose, not expressly permitted under these Terms.</li>
                <li>Send any unsolicited email or any other communication to any Website user in any way whatsoever not expressly permitted under these Terms.</li>
                <li>Undertake any unauthorized framing of or linking to the Website or frame or mirror any part of the Website, without our prior written authorization.</li>
                <li>Interfere with, obstruct, destroy or disrupt the Website or the servers or networks connected to the Website, whether partly or fully and whether permanently or temporarily.</li>
                <li>Email or otherwise transmit any content or material that contains software viruses, malware, spyware or any other computer code, files or programs designed to interrupt, destroy, disrupt or limit the functionality of the Website or of any computer software or hardware or telecommunications equipment connected with the Website.</li>
                <li>Forge headers or otherwise manipulate identifiers in order to disguise the origin of any information transmitted to or through the Website (either directly or indirectly through use of any third-party software).</li>
                <li>Use meta tags, code, programs or other devices, tools or technology containing any reference to us or the Website (or any trademark, trade name, service mark, logo or slogan of ours) to direct any person to any other Website or application for any purpose.</li>
                <li>Directly or indirectly modify, adapt, sublicense, translate, sell, reverse engineer, decipher, decompile or otherwise disassemble any portion of the Website.</li>
                <li>Post, use, transmit or distribute, directly or indirectly, in any manner or media any content (whether textual, graphical, images, audio, video, audio-video or any combination thereof) or information obtained from the Website other than solely in connection with your use of the Website in accordance with these Terms.</li>
              </ol>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Content Posted by You:</h3>
              <p className="text-justify">
                You are solely responsible for any and all content or information that you post, upload, share, publish, link to, transmit, record, display or otherwise make available (hereinafter collectively referred to as publish ) on the Website or transmit to other Website users, including text messages, chat, audio, video, photographs, images, graphics or any combination thereof, whether publicly published or privately transmitted (hereinafter collectively referred to as Content ).
              </p>

              <p className="text-justify">
                We do not verify or validate the completeness, accuracy or truth of any Content you publish on or through the Website. We are not the publisher of the Content and only provide you with a technology platform to facilitate you to publish such Content. We assume no responsibility or liability of any sort whatsoever for providing a technology platform to our Website users to facilitate them to publish their Content. To protect the integrity of the Website, we reserve the right to exercise editorial control over your Content, including the right to block any Website user from accessing the Website, whether temporarily or permanently.
              </p>

              <p className="text-justify">
                You shall not publish to us or to any other Website user (either on or off the Website), any offensive, inaccurate, incomplete, inappropriate, abusive, obscene, profane, threatening, intimidating, harassing, racially offensive, or illegal material or content that infringes or violates any person’s rights (including intellectual property rights, and rights of privacy and publicity).
              </p>

              <p className="text-justify">
                You represent and warrant that (i) all information and Content that you submit upon creation of your Website account, including information submitted from any permissible linked third party account, is accurate, complete and truthful and that you will promptly update any information provided by you that subsequently becomes inaccurate, incomplete, misleading or false and (ii) you have the right to publish the Content on the Website and grant the licenses as agreed in these Terms.
              </p>

              <p className="text-justify">
                You understand and agree that we have the right but not the obligation to monitor or review any Content you publish on the Website. We may delete any Content, in whole or in part, that in our sole judgment violates these Terms or may harm the reputation of the Website or ours or other Website users.
              </p>

              <p className="text-justify">
                By publishing Content on the Website, you automatically grant us and to our affiliates, licensees, successors and assigns, an irrevocable, perpetual, non-exclusive, transferable, sub-licensable, fully paid-up/royalty-free, worldwide right and license to (i) use, copy, store, perform, display, reproduce, record, play, adapt, modify and distribute the Content, (ii) prepare derivative works of the Content or incorporate the Content into other works, and (iii) grant and authorize sublicenses of the foregoing in any media now known or hereafter created.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Payments and Cancellations/Refunds:</h3>
              <p className="text-justify">
                We accept payments through third party service providers from various modes as available on the Website. We reserve the right to amend any of these modes at our sole discretion. We will begin processing your enrolment form only upon verification that your payment has been received by us.
              </p>

              <p className="text-justify">
                Under no circumstances will the enrolment fee be refundable and/or transferable for any reason whatsoever. Further, we are unable to accept any cancellations once the enrolment form is submitted to us.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Copyright Notice:</h3>
              <p className="text-justify">
                If you are aware that yours or any third party's copyright has been infringed, then you can write to us at customercare@ssplt10.co.in by providing with the following details:
              </p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>Your contact's name, address and email.</li>
                <li>Description of the violation / infringement of the copyright.</li>
                <li>Ownership details of the owner of the original copyrighted work.</li>
                <li>Creation date of the original copyrighted work.</li>
                <li>First publication date of the original copyrighted work.</li>
                <li>date of copyright registration (if applicable).</li>
                <li>Your relationship with the original copyrighted work.</li>
              </ol>

              <p className="text-justify">
                Upon receipt of all the aforesaid information, we may request you to provide us with additional information, if required, and accordingly we will proceed further with the verification accordingly.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Modifications to the Website:</h3>
              <p className="text-justify">
                We reserve the right at any time to modify or discontinue, temporarily or permanently, the Website (or any part thereof) with or without notice. You agree that we shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Website. Any access or usage by you of the Website shall imply that you have accepted any new or modified Terms. Please re-visit these Terms from time to time to stay abreast of any changes that we may introduce.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Disclaimer of Warranty:</h3>
              <p className="text-justify">
                To the maximum extent permitted by applicable law, we have provided the Website on an "AS IS" and "AS AVAILABLE" and BEST EFFORTS basis and grant no warranties of any kind, whether express, implied, direct, indirect statutory or otherwise with respect to the Website or any part thereof (including all content contained therein), including any implied warranties of correctness, validity, accuracy, completeness, appropriateness, fitness, merchantability or compatibility for a particular purpose or outcome or non-infringement. We do not warrant that the use of the Website will always be secured, uninterrupted, available, error-free or will meet your requirements or expectations, or that any defects in the Website will be corrected or result in the desired results. We disclaim liability for, and no warranty is made with respect to, the connectivity and availability of the Website at all times and the results of the use of the Website.
              </p>

              <p className="text-justify">
                Opinions, advice, statements, offers, or other information or content made available through the Website, but not directly by us, are those of their respective authors, and should not necessarily be relied upon. Such authors are solely responsible for such Content. We do not (i) guarantee the accuracy, completeness or usefulness of any information provided on the Website, or (ii) adopt, endorse or accept responsibility for the accuracy or reliability of any opinion, advice, or statement made by any party other than us.
              </p>

              <p className="text-justify">
                From time to time, we may offer new features or tools which our Website users may experiment or experience. Such features or tools are offered solely for experimental purposes and without any warranty of any kind, and may be modified or discontinued at our sole discretion. The provisions of this Disclaimer of Warranty section shall apply with full force to such features and tools.
              </p>

              <p className="text-justify">
                We accept no responsibility for any damage, loss, liabilities, injury or disappointment incurred or suffered by you as a result of the Website.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Limitation of Liability:</h3>
              <p className="text-justify">
                To the maximum extent permitted by applicable law, in no event will we be liable for any indirect, incidental, special, consequential, liquidated and/or punitive damages arising out of or relating to the use or inability to use the Website, result of using the Website including, without limitation, damages for recommendation of the Website, loss or corruption of data or programs, service interruptions and procurement of substitute services, even if we know or have been advised of the possibility of such damages. To the maximum extent permitted by applicable law, under no circumstances will we be liable for any liquidated or punitive damages.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Indemnification:</h3>
              <p className="text-justify">
                You agree to indemnify, defend and hold us harmless, as well as our partner websites and affiliates, from and against any and all losses, claims, costs, liabilities and expenses (including reasonable attorneys fees) relating to or arising out of your use of the Website, including but not limited to (i) any violation by you of these Terms, or (ii) any action arising from the Content that you publish on the Website or using the Website that infringes any proprietary or intellectual property rights (e.g. copyright, trade secrets, trademark or patent) of ours or of any third party, or (iii) any Content that is in breach of Clause 11.7 above. We reserve the right, at our own cost, to assume the exclusive defence and control of any matter otherwise subject to indemnification by you, and you will co-operate fully in asserting any available defences in such case.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Miscellaneous:</h3>
              <p className="text-justify">
                <strong>Entire Agreement:</strong> These Terms constitutes the entire agreement between you and us regarding the subject matter hereof, and replaces and supersedes any and all prior agreements/ understandings/ correspondences, whether written or oral, between you and us.
              </p>

              <p className="text-justify">
                <strong>Amendment:</strong> We reserve the right to amend these Terms from time to time. Any such amendments will be applicable to all persons viewing/accessing/using the Website once the revisions have been posted onto the same. You should therefore check the Website from time to time to review the current Terms as applicable to you.
              </p>

              <p className="text-justify">
                <strong>Survival:</strong> Termination or suspension of your Website account shall not affect those provisions hereof that by their nature are intended to survive such termination or suspension.
              </p>

              <p className="text-justify">
                <strong>Governing Law and Jurisdiction:</strong> These Terms shall be governed and construed in accordance with the laws of India in relation to any legal action or proceedings to enforce the same. You irrevocably submit to the exclusive jurisdiction of any competent courts situated at Chennai, Tamilnadu, India and waive any objection to such proceedings on grounds of venue or on the grounds that the proceedings have been brought in an inconvenient forum.
              </p>

              <p className="text-justify">
                <strong>No Assignment:</strong> These Terms are personal to you. You cannot assign your rights or obligations, whether partly or fully, to anyone.
              </p>

              <p className="text-justify">
                <strong>Severability:</strong> If any provisions of these Terms are held invalid or unenforceable under applicable law, such provision will be inapplicable, but the remainder will continue in full force and effect.
              </p>

              <p className="text-justify">
                <strong>Waiver:</strong> No waiver of any term, provision or condition of these Terms whether by conduct or otherwise in any one or more instances shall be deemed to be or construed as a further or continuing waiver of any such term, provision or condition or of any other term, provision or condition of these Terms.
              </p>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Grievance Officer:</h3>
              <p className="text-justify">
                In accordance with Information Technology Act, 2000 and rules made there under, the name and contact details of the Grievance Officer are provided below:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Name: Mr. Prushotaman Sethu</p>
                <p className="font-medium">Email: customercare@ssplt10.co.in</p>
              </div>

              <h3 className="text-lg font-semibold text-cricket-blue mt-6">Contact Us:</h3>
              <p className="text-justify">
                Please contact us by email on customercare@ssplt10.co.in for any questions or comments regarding these Terms or pertaining to the Website.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions;