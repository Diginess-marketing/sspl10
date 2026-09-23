import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Download, Ticket, Trophy } from 'lucide-react';
import type { PlayerResult } from '@/types/playerData'; // Make sure this path is correct
import { generateAndDownloadCertificate, generateAndDownloadAchievementCertificate } from '@/utils/certificateGenerator';
import { useToast } from '@/hooks/use-toast';
import DoubleEagleTicketAnimation from '../animations/GoldenTicketAnimation';
import KohinoorTicketAnimation from '../animations/KohinoorTicketAnimation';
import PlatinumTicketAnimation from '../animations/PlatinumTicketAnimation';
import PaladianTicketAnimation from '../animations/PaladianTicketAnimation';
import TitanTicketAnimation from '../animations/TitanTicketAnimation';
import BetterLuckNexttimeAnimation from '../animations/BetterLuckNexttimeAnimation';

interface PlayerResultCardProps {
  player: PlayerResult;
  className?: string;
  compact?: boolean;
}

// Helper constant to control if we show placeholders for everyone
const displayPlaceholdersIfEmpty = true;

const PlayerResultCard: React.FC<PlayerResultCardProps> = ({ player, className, compact = false }) => {
  // Guard against 'Not Called For' players
  if (player.status === 'NOT_CALLED_FOR' || (player as any).final_status === 'NOT_CALLED_FOR') {
    return null;
  }

  // Determine statuses
  const level1Selected = player.status?.toUpperCase() === 'SELECTED';
  const level2Selected = player.level2Data?.status === 'SELECTED';
  const level2Declared = player.level2Data?.status === 'SELECTED' || player.level2Data?.status === 'NOT_SELECTED' || player.level2Data?.status === 'NOT SELECTED';
  const level3Selected = player.level3Data?.status === 'SELECTED';
  const level3Declared = player.level3Data?.status === 'SELECTED' || player.level3Data?.status === 'NOT_SELECTED' || player.level3Data?.status === 'NOT SELECTED';
  
  const level4Selected = player.level4Data?.status === 'SELECTED';
  const level4Declared = player.level4Data?.status === 'SELECTED' || player.level4Data?.status === 'NOT_SELECTED' || player.level4Data?.status === 'NOT SELECTED';

  const level5Selected = player.level5Data?.status === 'SELECTED';
  const level5Declared = player.level5Data?.status === 'SELECTED' || player.level5Data?.status === 'NOT_SELECTED' || player.level5Data?.status === 'NOT SELECTED';

  const isSelected = level1Selected || level2Selected || level3Selected || level4Selected || level5Selected;

  const [showLevel1Ticket, setShowLevel1Ticket] = useState(false);
  const [showLevel2Ticket, setShowLevel2Ticket] = useState(false);
  const [showLevel3Ticket, setShowLevel3Ticket] = useState(false);
  const [showLevel4Ticket, setShowLevel4Ticket] = useState(false);
  const [showLevel5Ticket, setShowLevel5Ticket] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  const { toast } = useToast();

  const handleDownloadCertificate = async (type: 'participation' | 'achievement', nameOverride: string) => {
    setIsGeneratingCertificate(true);
    try {
      if (type === 'achievement') {
        await generateAndDownloadAchievementCertificate(nameOverride);
      } else {
        await generateAndDownloadCertificate(nameOverride);
      }

      toast({
        title: 'Certificate Downloaded',
        description: `Your ${type} certificate has been downloaded successfully.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to generate certificate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Helper for sparkle icon
  const SparkleIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );

  return (
    <>
      <div className={`relative group ${className}`} >
        {/* Glow effect for selected players */}
        {isSelected && (
          <div className="absolute -inset-0.5 bg-linear-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        )}

        <Card className={`w-full mx-auto relative overflow-hidden transition-all duration-300 ${isSelected
          ? 'border-0 shadow-xl shadow-green-500/20'
          : 'border-0 shadow-lg shadow-gray-200'
          } ${compact ? 'max-w-5xl' : 'max-w-4xl'}`}>

          {/* Background Patterns */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-linear-to-br from-gray-100 to-gray-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-linear-to-tr from-gray-100 to-gray-50 rounded-full blur-3xl opacity-50"></div>

          {/* Status Banner */}
          <div className={`relative h-2 ${isSelected ? 'bg-linear-to-r from-green-500 via-emerald-500 to-teal-500' : 'bg-linear-to-r from-gray-300 to-gray-400'}`}></div>

          <CardContent className={`${compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'} relative`} >
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">

              {/* Left Section: Status Icon & Basic Info */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {/* Level 1 Status */}
                  {player.status && (
                    <Badge
                      variant={level1Selected ? 'default' : 'secondary'}
                      className={`px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-sm ${level1Selected
                        ? 'bg-[#001B69] text-white hover:bg-[#001B69]/90 border border-[#001B69]'
                        : player.status?.toUpperCase() === 'ABSENT'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                          : player.status?.toUpperCase() === 'PENDING'
                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                            : 'bg-red-500 text-white hover:bg-red-600 border border-red-600'
                        }`}
                    >
                      Level 1: {level1Selected ? 'Selected' : player.status?.toUpperCase() === 'ABSENT' ? 'Absent' : player.status?.toUpperCase() === 'PENDING' ? 'Pending' : 'Not Selected'}
                    </Badge>
                  )}

                  {/* Level 2 Status */}
                  {(player.level2Data || displayPlaceholdersIfEmpty) && (() => {
                    const isL1Absent = player.status?.toUpperCase() === 'ABSENT';
                    const isL1Pending = player.status?.toUpperCase() === 'PENDING';
                    const isL2Blank = player.level2Data?.status?.toUpperCase() === 'BLANK';
                    const isL2Absent = player.level2Data?.status?.toUpperCase() === 'ABSENT';
                    const isL2NotSelected = !isL2Blank && !isL2Absent && !isL1Pending && (!level1Selected || player.level2Data?.status === 'NOT_SELECTED' || player.level2Data?.status === 'NOT SELECTED' || player.level2Data?.status === 'REJECTED');
                    const isL2Pending = isL1Pending || (!level1Selected && !isL2NotSelected && !isL2Absent && !isL2Blank) || player.level2Data?.status === 'PENDING';
                    return (
                      <Badge
                        variant={level2Selected && !isL1Pending ? 'default' : 'secondary'}
                        className={`px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-sm ${level2Selected && !isL1Pending
                          ? 'bg-[#001B69] text-white hover:bg-[#001B69]/90 border border-[#001B69]'
                          : isL2Absent
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                            : isL2Blank
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                              : isL2NotSelected
                                ? 'bg-red-500 text-white hover:bg-red-600 border border-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                          }`}
                      >
                        Level 2: {level2Selected && !isL1Pending ? 'Selected' : (isL2Absent ? 'Absent' : (isL2Blank ? 'Blank' : (isL2NotSelected ? 'Not Selected' : 'Pending')))}
                      </Badge>
                    );
                  })()}
                  
                  {/* Level 3 Status */}
                  {(player.level3Data || displayPlaceholdersIfEmpty) && (() => {
                    const isL1Absent = player.status?.toUpperCase() === 'ABSENT';
                    const isL2Absent = player.level2Data?.status === 'ABSENT';
                    const isL1Pending = player.status?.toUpperCase() === 'PENDING';
                    const isL2Pending = player.level2Data?.status === 'PENDING';
                    const isL3Blank = player.level3Data?.status?.toUpperCase() === 'BLANK';
                    const isL3Absent = player.level3Data?.status?.toUpperCase() === 'ABSENT';
                    const isL3NotSelected = !isL3Blank && !isL3Absent && !isL1Pending && !isL2Pending && (!level1Selected || !level2Selected || player.level3Data?.status === 'NOT_SELECTED' || player.level3Data?.status === 'NOT SELECTED' || player.level3Data?.status === 'REJECTED');
                    return (
                      <Badge
                        variant={level3Selected && !isL1Pending && !isL2Pending ? 'default' : 'secondary'}
                        className={`px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-sm ${level3Selected && !isL1Pending && !isL2Pending
                          ? 'bg-green-600 text-white hover:bg-green-700 border border-green-700'
                          : isL3Absent
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                            : isL3Blank
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                              : isL3NotSelected
                                ? 'bg-red-500 text-white hover:bg-red-600 border border-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                          }`}
                      >
                        Level 3: {level3Selected && !isL1Pending && !isL2Pending ? 'Selected' : (isL3Absent ? 'Absent' : (isL3Blank ? 'Blank' : (isL3NotSelected ? 'Not Selected' : 'Pending')))}
                      </Badge>
                    );
                  })()}
                  
                  {/* Level 4 Status */}
                  {(player.level4Data || displayPlaceholdersIfEmpty) && (() => {
                    const isL1Absent = player.status?.toUpperCase() === 'ABSENT';
                    const isL2Absent = player.level2Data?.status === 'ABSENT';
                    const isL3Absent = player.level3Data?.status === 'ABSENT';
                    const isL1Pending = player.status?.toUpperCase() === 'PENDING';
                    const isL2Pending = player.level2Data?.status === 'PENDING';
                    const isL3Pending = player.level3Data?.status === 'PENDING';
                    const isL4Blank = player.level4Data?.status?.toUpperCase() === 'BLANK';
                    const isL4Absent = player.level4Data?.status?.toUpperCase() === 'ABSENT';
                    const isL4NotSelected = !isL4Blank && !isL4Absent && !isL1Pending && !isL2Pending && !isL3Pending && (!level1Selected || !level2Selected || !level3Selected || player.level4Data?.status === 'NOT_SELECTED' || player.level4Data?.status === 'NOT SELECTED' || player.level4Data?.status === 'REJECTED');

                    // if (isL4NotSelected) return null;

                    return (
                      <Badge
                        variant={level4Selected && !isL1Pending && !isL2Pending && !isL3Pending ? 'default' : 'secondary'}
                        className={`px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-sm ${level4Selected && !isL1Pending && !isL2Pending && !isL3Pending
                          ? 'bg-purple-600 text-white hover:bg-purple-700 border border-purple-700'
                          : isL4Absent
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                            : isL4Blank
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                              : isL4NotSelected
                                ? 'bg-red-500 text-white hover:bg-red-600 border border-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                          }`}
                      >
                        Level 4: {level4Selected && !isL1Pending && !isL2Pending && !isL3Pending ? 'Selected' : (isL4Absent ? 'Absent' : (isL4Blank ? 'Blank' : (isL4NotSelected ? 'Not Selected' : 'Pending')))}
                      </Badge>
                    );
                  })()}
                  
                  {/* Level 5 Status */}
                  {(player.level5Data || displayPlaceholdersIfEmpty) && (() => {
                    const isL1Absent = player.status?.toUpperCase() === 'ABSENT';
                    const isL2Absent = player.level2Data?.status === 'ABSENT';
                    const isL3Absent = player.level3Data?.status === 'ABSENT';
                    const isL4Absent = player.level4Data?.status === 'ABSENT';
                    const isL1Pending = player.status?.toUpperCase() === 'PENDING';
                    const isL2Pending = player.level2Data?.status === 'PENDING';
                    const isL3Pending = player.level3Data?.status === 'PENDING';
                    const isL4Pending = player.level4Data?.status === 'PENDING';
                    const isL5Blank = player.level5Data?.status?.toUpperCase() === 'BLANK';
                    const isL5Absent = player.level5Data?.status?.toUpperCase() === 'ABSENT';
                    const isL5NotSelected = !isL5Blank && !isL5Absent && !isL1Pending && !isL2Pending && !isL3Pending && !isL4Pending && (!level1Selected || !level2Selected || !level3Selected || !level4Selected || player.level5Data?.status === 'NOT_SELECTED' || player.level5Data?.status === 'NOT SELECTED' || player.level5Data?.status === 'REJECTED');

                    // if (isL5NotSelected) return null;

                    return (
                      <Badge
                        variant={level5Selected && !isL1Pending && !isL2Pending && !isL3Pending && !isL4Pending ? 'default' : 'secondary'}
                        className={`px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-sm ${level5Selected && !isL1Pending && !isL2Pending && !isL3Pending && !isL4Pending
                          ? 'bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90 border border-[#CCFF00]'
                          : isL5Absent
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                            : isL5Blank
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                              : isL5NotSelected
                                ? 'bg-red-500 text-white hover:bg-red-600 border border-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                          }`}
                      >
                        Level 5: {level5Selected && !isL1Pending && !isL2Pending && !isL3Pending && !isL4Pending ? 'Selected' : (isL5Absent ? 'Absent' : (isL5Blank ? 'Blank' : (isL5NotSelected ? 'Not Selected' : 'Pending')))}
                      </Badge>
                    );
                  })()}

                </div>

                <h3 className={`font-heading font-black leading-tight mb-1 ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`} style={{ color: '#000000' }}>
                  {player.name || `Player - ${player.mobile}`}
                </h3>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold" style={{ color: '#000000' }}>{player.mobile}</span>
                  </div>
                </div>
              </div>

              {/* Right Section: Action Buttons */}
              <div className={`w-full md:w-auto flex flex-col gap-2 ${compact ? 'md:min-w-[200px]' : 'md:min-w-60'}`}>



                {/* Certificate Downloads */}
                <div className="flex flex-col gap-2 w-full">

                  {/* Case 1: Level 1 Not Selected -> Participation Only (but only if not Absent and not Pending) */}
                  {!level1Selected && player.status?.toUpperCase() !== 'ABSENT' && player.status?.toUpperCase() !== 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-600 text-blue-700 bg-white hover:bg-blue-50 font-bold shadow-sm"
                      style={{ backgroundColor: '#ffffff', color: '#1d4ed8' }}
                      onClick={() => handleDownloadCertificate('participation', `${player.name} - Level 1`)}
                      disabled={isGeneratingCertificate}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      L1 Participation Cert
                    </Button>
                  )}

                  {/* Case 2: Level 1 Selected -> L1 Achievement */}
                  {level1Selected && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-linear-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-black shadow-sm"
                      style={{ color: '#ffffff' }} // Force white on dark background if needed, but here it looks like it should be white. Wait, the user wants text to be black in results page.
                      // Looking at the image, the buttons on the right also have poor visibility.
                      // L1 ACHIEVEMENT CERT - dark orange background. White text should be fine, but maybe it's being dimmed.
                      // Let's force it to black if the background is light, but here they are colored.
                      // Actually, let's look at the image again.
                      // L1 ACHIEVEMENT CERT - text is white on orange.
                      // L2 ACHIEVEMENT CERT - text is white on blue.
                      // L3 PARTICIPATION CERT - text is dark gray on white border (empty). This is the one that's unreadable.
                      
                      onClick={() => handleDownloadCertificate('achievement', `${player.name} - Double Eagle`)}
                      disabled={isGeneratingCertificate}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      L1 Achievement Cert
                    </Button>
                  )}

                  {/* Case 3 & 4: Level 2 Certs (Only if L1 Selected) */}
                  {level1Selected && player.level2Data && (
                    <>
                      {level2Selected ? (
                        // L2 Achievement
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-sm"
                          onClick={() => handleDownloadCertificate('achievement', `${player.name} - Kohinoor`)}
                          disabled={isGeneratingCertificate}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          L2 Achievement Cert
                        </Button>
                      ) : player.level2Data?.status !== 'ABSENT' && player.level2Data?.status !== 'PENDING' && (
                        // L2 Participation (If L2 Data exists but not selected, absent, or pending)
                        // Assuming existence of level2Data means result is declared
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-cyan-600 text-cyan-900 bg-white hover:bg-cyan-50 font-bold shadow-sm"
                          style={{ backgroundColor: '#ffffff', color: '#164e63' }}
                          onClick={() => handleDownloadCertificate('participation', `${player.name} - Level 2`)}
                          disabled={isGeneratingCertificate}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          L2 Participation Cert
                        </Button>
                      )}
                    </>
                  )}


                  {/* Case 5: Level 3 Certs */}
                  {level1Selected && level2Selected && player.level3Data && (
                    <>
                      {level3Selected ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-linear-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white font-bold shadow-sm"
                          onClick={() => handleDownloadCertificate('achievement', `${player.name} - Player Platinum`)}
                          disabled={isGeneratingCertificate}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          L3 Achievement Cert
                        </Button>
                      ) : player.level3Data?.status !== 'ABSENT' && player.level3Data?.status !== 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-slate-400 text-slate-900 bg-white hover:bg-slate-50 shadow-sm font-bold"
                          style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                          onClick={() => handleDownloadCertificate('participation', `${player.name} - Level 3`)}
                          disabled={isGeneratingCertificate}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          L3 Participation Cert
                        </Button>
                      )}
                    </>
                  )}

                  {/* Case 6: Level 4 Certs */}
                  {level1Selected && level2Selected && level3Selected && player.level4Data && level4Selected && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold shadow-sm"
                      onClick={() => handleDownloadCertificate('achievement', `${player.name} - Player Paladin`)}
                      disabled={isGeneratingCertificate}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      L4 Achievement Cert
                    </Button>
                  )}

                  {/* Case 7: Level 5 Certs */}
                  {level1Selected && level2Selected && level3Selected && level4Selected && player.level5Data && level5Selected && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-linear-to-r from-[#CCFF00] to-yellow-400 hover:from-[#b3e600] hover:to-yellow-500 text-black font-bold shadow-sm"
                      onClick={() => handleDownloadCertificate('achievement', `${player.name} - Player Titan`)}
                      disabled={isGeneratingCertificate}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      L5 Achievement Cert
                    </Button>
                  )}
                </div>

              </div>
            </div>


            {/* Mini Tickets Preview Section */}
            {(level1Selected || level2Selected || level3Selected || level4Selected || level5Selected) && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className={'flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap'}>
                  {level1Selected && (
                    <div className={'flex flex-col items-center w-full max-w-[360px]'}>
                      <div className="w-full transform transition-transform hover:scale-105 origin-top">
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                            Level 1 Achievement
                          </span>
                        </div>
                        <div className="scale-90 origin-top -mb-10"> {/* Scale down slightly */}
                          <DoubleEagleTicketAnimation player={player} embedded={true} />
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowLevel1Ticket(true)}
                        className="mt-2 w-full bg-linear-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold shadow-md transform transition active:scale-95 text-xs sm:text-sm"
                      >
                        <Ticket className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View Level 1 Ticket
                      </Button>
                    </div>
                  )}

                  {level2Selected && (
                    <div className={'flex flex-col items-center w-full max-w-[360px]'}>
                      <div className="w-full transform transition-transform hover:scale-105 origin-top">
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2 py-1 rounded-full border border-cyan-200">
                            Level 2 Achievement
                          </span>
                        </div>
                        <div className="scale-90 origin-top -mb-10"> {/* Scale down slightly */}
                          <KohinoorTicketAnimation player={player} embedded={true} />
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowLevel2Ticket(true)}
                        className="mt-2 w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-md transform transition active:scale-95 text-xs sm:text-sm"
                      >
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View Level 2 Ticket
                      </Button>
                    </div>
                  )}

                  {level3Selected && (
                    <div className={'flex flex-col items-center w-full max-w-[360px]'}>
                      <div className="w-full transform transition-transform hover:scale-105 origin-top">
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-green-600 px-2 py-1 rounded-full border border-green-700 shadow-sm transition-colors hover:bg-green-700">
                            Level 3 Achievement
                          </span>
                        </div>
                        <div className="scale-90 origin-top -mb-10"> {/* Scale down slightly */}
                          <PlatinumTicketAnimation player={player} embedded={true} />
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowLevel3Ticket(true)}
                        className="mt-2 w-full bg-linear-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white font-bold shadow-md transform transition active:scale-95 text-xs sm:text-sm"
                      >
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View Level 3 Ticket
                      </Button>
                    </div>
                  )}

                  {level4Selected && (
                    <div className={'flex flex-col items-center w-full max-w-[360px]'}>
                      <div className="w-full transform transition-transform hover:scale-105 origin-top">
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-purple-600 px-2 py-1 rounded-full border border-purple-700 shadow-sm transition-colors hover:bg-purple-700">
                            Level 4 Achievement
                          </span>
                        </div>
                        <div className="scale-90 origin-top -mb-10"> {/* Scale down slightly */}
                          <PaladianTicketAnimation player={player} embedded={true} />
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowLevel4Ticket(true)}
                        className="mt-2 w-full bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold shadow-md transform transition active:scale-95 text-xs sm:text-sm"
                      >
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View Level 4 Ticket
                      </Button>
                    </div>
                  )}

                  {level5Selected && (
                    <div className={'flex flex-col items-center w-full max-w-[360px]'}>
                      <div className="w-full transform transition-transform hover:scale-105 origin-top">
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-bold text-black uppercase tracking-widest bg-[#CCFF00] px-2 py-1 rounded-full border border-[#b3e600] shadow-sm transition-colors hover:bg-[#b3e600]">
                            Level 5 Achievement
                          </span>
                        </div>
                        <div className="scale-90 origin-top -mb-10"> {/* Scale down slightly */}
                          <TitanTicketAnimation player={player} embedded={true} />
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowLevel5Ticket(true)}
                        className="mt-2 w-full bg-linear-to-r from-[#CCFF00] to-yellow-400 hover:from-[#b3e600] hover:to-yellow-500 text-black font-bold shadow-md transform transition active:scale-95 text-xs sm:text-sm"
                      >
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View Level 5 Ticket
                      </Button>
                    </div>
                  )}

                  {level1Selected && level2Declared && !level2Selected && (
                    <div className={`flex flex-col items-center w-full ${level1Selected && level2Declared && level3Declared ? 'max-w-[360px]' : 'max-w-[500px]'}`}>
                      <div className="w-full transform transition-transform hover:scale-105 origin-top">
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full border border-slate-200 shadow-sm transition-colors hover:bg-slate-50">
                            Level 2 Result
                          </span>
                        </div>
                        <div className="scale-90 origin-top -mb-10"> {/* Scale down slightly */}
                          <BetterLuckNexttimeAnimation embedded={true} levelText="" />
                        </div>
                      </div>
                    </div>
                  )}

                  {level1Selected && level2Selected && level3Declared && !level3Selected && (
                    <div className={'flex flex-col items-center w-full max-w-[360px]'}>
                      <div className="w-full transform transition-transform hover:scale-105 origin-top">
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full border border-slate-200 shadow-sm transition-colors hover:bg-slate-50">
                            Level 3 Result
                          </span>
                        </div>
                        <div className="scale-90 origin-top -mb-10"> {/* Scale down slightly */}
                          <BetterLuckNexttimeAnimation embedded={true} levelText="" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            )}

          </CardContent>
        </Card>

        {/* Render Ticket Modals */}
        {showLevel1Ticket && (
          <DoubleEagleTicketAnimation
            player={player}
            onClose={() => setShowLevel1Ticket(false)}
            autoHideMs={999999} // Don't auto hide manual opens
          />
        )}

        {showLevel2Ticket && (
          <KohinoorTicketAnimation
            player={player}
            onClose={() => setShowLevel2Ticket(false)}
            autoHideMs={999999}
          />
        )}

        {showLevel3Ticket && (
          <PlatinumTicketAnimation
            player={player}
            onClose={() => setShowLevel3Ticket(false)}
            autoHideMs={999999}
          />
        )}

        {showLevel4Ticket && (
          <PaladianTicketAnimation
            player={player}
            onClose={() => setShowLevel4Ticket(false)}
            autoHideMs={999999}
          />
        )}

        {showLevel5Ticket && (
          <TitanTicketAnimation
            player={player}
            onClose={() => setShowLevel5Ticket(false)}
            autoHideMs={999999}
          />
        )}
      </div >
    </>
  );
};

export default PlayerResultCard;