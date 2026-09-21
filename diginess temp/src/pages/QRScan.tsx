import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, CheckCircle, XCircle, ExternalLink, Eye, Calendar } from 'lucide-react';
import { QRCodeService } from '@/services/qrCodeService';
import { QRAnalyticsService, type ScanTrackingData } from '@/services/qrAnalyticsService';

const QRScan: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanTracked, setScanTracked] = useState(false);

  const qrCodeParam = searchParams.get('code');
  const source = searchParams.get('source') || 'direct';

  useEffect(() => {
    if (qrCodeParam) {
      handleQRScan(qrCodeParam);
    } else {
      setError('No QR code provided');
      setLoading(false);
    }
  }, [qrCodeParam]);

  const handleQRScan = async (code: string) => {
    try {
      setLoading(true);

      // Get QR code details
      const qrData = await QRCodeService.getQRCodeByCode(code);

      if (!qrData) {
        setError('QR code not found or expired');
        setLoading(false);
        return;
      }

      setQrCode(qrData);

      // Store QR code ID in localStorage for registration attribution
      localStorage.setItem('qr_code_id', qrData.code);
      localStorage.setItem('qr_scan_timestamp', new Date().toISOString());

      // Track the scan asynchronously
      const trackingData: ScanTrackingData = {
        qrCodeId: qrData.id,
        timestamp: new Date(),
        ipAddress: '', // Will be collected by server-side function
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        scanSource: source,
      };

      // Call tracking service (non-blocking)
      QRAnalyticsService.trackScan(trackingData).catch((err) => {
      });

      setScanTracked(true);

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        if (qrData.targetUrl) {
          window.location.href = qrData.targetUrl;
        }
      }, 3000);

    } catch (err) {
      setError('Failed to process QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRedirect = () => {
    if (qrCode) {
      window.location.href = qrCode.targetUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-cricket-blue to-cricket-light-blue flex flex-col">

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-yellow mb-4"></div>
              <h2 className="text-xl font-semibold text-cricket-blue mb-2">Processing QR Code</h2>
              <p className="text-muted-foreground text-center">Please wait while we redirect you...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 flex flex-col">

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-center text-red-700">Invalid QR Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Alert className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex flex-col">

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <CheckCircle className="h-12 w-12 text-green-500" />
                {scanTracked && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-cricket-yellow rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
            <CardTitle className="text-center text-green-700">QR Code Scanned Successfully!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {qrCode && (
              <>
                <div className="text-center">
                  <Badge className="bg-cricket-blue text-cricket-yellow mb-2">
                    <QrCode className="w-3 h-3 mr-1" />
                    {qrCode.title}
                  </Badge>
                  {qrCode.description && (
                    <p className="text-sm text-muted-foreground">{qrCode.description}</p>
                  )}
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Total Scans
                    </span>
                    <span className="font-semibold">{qrCode.currentScans}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created
                    </span>
                    <span>{new Date(qrCode.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Alert>
                  <ExternalLink className="h-4 w-4" />
                  <AlertDescription>
                    You will be redirected to the destination in 3 seconds...
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button onClick={handleManualRedirect} className="flex-1 bg-cricket-yellow text-cricket-blue hover:bg-yellow-400">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go Now
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScan;