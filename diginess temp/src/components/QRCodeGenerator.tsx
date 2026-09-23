import React, { useState, useCallback } from 'react';
import { generateQRCode, generateQRCodeSVG } from '@/utils/utm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  QrCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  Link2,
  Palette,
  Settings2,
  Eye,
  Share2,
} from 'lucide-react';

interface QRCodeConfig {
  utmId: string;
  campaignName: string;
  utmSource: string;
  utmMedium: string;
  width: number;
  margin: number;
  darkColor: string;
  lightColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

interface GeneratedQR {
  url: string;
  dataUrl: string;
  svg: string;
  config: QRCodeConfig;
}

const defaultConfig: QRCodeConfig = {
  utmId: '',
  campaignName: '',
  utmSource: 'qr',
  utmMedium: 'scan',
  width: 256,
  margin: 2,
  darkColor: '#000000',
  lightColor: '#FFFFFF',
  errorCorrectionLevel: 'M',
};

const presetCampaigns = [
  { name: 'Facebook Ad', source: 'facebook', medium: 'social' },
  { name: 'Instagram Story', source: 'instagram', medium: 'social' },
  { name: 'WhatsApp Share', source: 'whatsapp', medium: 'referral' },
  { name: 'Print Poster', source: 'print', medium: 'offline' },
  { name: 'Event Banner', source: 'event', medium: 'offline' },
  { name: 'Email Newsletter', source: 'email', medium: 'newsletter' },
  { name: 'Partner Referral', source: 'partner', medium: 'referral' },
];

const QRCodeGenerator: React.FC = () => {
  const [config, setConfig] = useState<QRCodeConfig>(defaultConfig);
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateUTMId = useCallback(() => {
    const prefix = config.campaignName
      ? config.campaignName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
      : 'QR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }, [config.campaignName]);

  const handleGenerateQR = async () => {
    if (!config.campaignName.trim()) {
      setError('Campaign name is required');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate UTM ID if not provided
      const utmId = config.utmId.trim() || generateUTMId();

      // Build URL with UTM parameters
      const baseUrl = 'https://ssplt10.co.in/register';
      const params = new URLSearchParams({
        utm_id: utmId,
        utm_source: config.utmSource,
        utm_medium: config.utmMedium,
        utm_campaign: config.campaignName.trim().toLowerCase().replace(/\s+/g, '-'),
      });
      const fullUrl = `${baseUrl}?${params.toString()}`;

      // Generate QR code images
      const dataUrl = await generateQRCode(fullUrl, {
        width: config.width,
        margin: config.margin,
        color: {
          dark: config.darkColor,
          light: config.lightColor,
        },
        errorCorrectionLevel: config.errorCorrectionLevel,
      });

      const svg = await generateQRCodeSVG(fullUrl, {
        width: config.width,
        margin: config.margin,
        color: {
          dark: config.darkColor,
          light: config.lightColor,
        },
        errorCorrectionLevel: config.errorCorrectionLevel,
      });

      setGeneratedQR({
        url: fullUrl,
        dataUrl,
        svg,
        config: { ...config, utmId },
      });

      // Update config with generated UTM ID
      setConfig(prev => ({ ...prev, utmId }));
    } catch (err) {
      console.error('QR generation error:', err);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (format: 'png' | 'svg') => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    const filename = `${generatedQR.config.campaignName.replace(/[^a-z0-9]/gi, '_')}_${generatedQR.config.utmId}_qr`;

    if (format === 'png') {
      link.href = generatedQR.dataUrl;
      link.download = `${filename}.png`;
    } else {
      const blob = new Blob([generatedQR.svg], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.svg`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (format === 'svg') {
      URL.revokeObjectURL(link.href);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const applyPreset = (preset: typeof presetCampaigns[0]) => {
    setConfig(prev => ({
      ...prev,
      campaignName: preset.name,
      utmSource: preset.source,
      utmMedium: preset.medium,
      utmId: '', // Clear UTM ID to generate a new one
    }));
    setGeneratedQR(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            QR Code Generator
          </h2>
          <p className="text-muted-foreground mt-1">
            Create trackable QR codes for your UTM campaigns
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Campaign Configuration
            </CardTitle>
            <CardDescription>
              Set up your campaign parameters and QR code styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Presets */}
            <div>
              <Label className="text-sm font-medium">Quick Presets</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {presetCampaigns.map((preset) => (
                  <Badge
                    key={preset.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="campaign" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="campaign">
                  <Link2 className="h-4 w-4 mr-2" />
                  Campaign
                </TabsTrigger>
                <TabsTrigger value="style">
                  <Palette className="h-4 w-4 mr-2" />
                  Style
                </TabsTrigger>
              </TabsList>

              <TabsContent value="campaign" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g., Summer Tournament 2025"
                    value={config.campaignName}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, campaignName: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utmId">UTM ID (auto-generated if empty)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="utmId"
                      placeholder="Auto-generated"
                      value={config.utmId}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, utmId: e.target.value }))
                      }
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setConfig((prev) => ({ ...prev, utmId: generateUTMId() }))}
                      title="Generate new UTM ID"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="utmSource">UTM Source</Label>
                    <Input
                      id="utmSource"
                      placeholder="e.g., qr, facebook"
                      value={config.utmSource}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, utmSource: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="utmMedium">UTM Medium</Label>
                    <Input
                      id="utmMedium"
                      placeholder="e.g., scan, social"
                      value={config.utmMedium}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, utmMedium: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Size (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="128"
                      max="512"
                      value={config.width}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, width: parseInt(e.target.value) || 256 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin">Margin</Label>
                    <Input
                      id="margin"
                      type="number"
                      min="0"
                      max="10"
                      value={config.margin}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, margin: parseInt(e.target.value) || 2 }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="darkColor">QR Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="darkColor"
                        type="color"
                        value={config.darkColor}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, darkColor: e.target.value }))
                        }
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={config.darkColor}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, darkColor: e.target.value }))
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lightColor">Background</Label>
                    <div className="flex gap-2">
                      <Input
                        id="lightColor"
                        type="color"
                        value={config.lightColor}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, lightColor: e.target.value }))
                        }
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={config.lightColor}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, lightColor: e.target.value }))
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Error Correction Level</Label>
                  <div className="flex gap-2">
                    {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={config.errorCorrectionLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, errorCorrectionLevel: level }))
                        }
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    L: 7% | M: 15% | Q: 25% | H: 30% recovery
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerateQR}
              disabled={isGenerating || !config.campaignName.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview & Download
            </CardTitle>
            <CardDescription>
              {generatedQR ? 'Your QR code is ready' : 'Configure and generate to see preview'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQR ? (
              <div className="space-y-4">
                {/* QR Code Preview */}
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <img
                    src={generatedQR.dataUrl}
                    alt="Generated QR Code"
                    className="max-w-full"
                    width={Math.min(generatedQR.config.width, 300)}
                    height={Math.min(generatedQR.config.width, 300)}
                  />
                </div>

                {/* Campaign Info */}
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">UTM ID:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        {generatedQR.config.utmId}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(generatedQR.config.utmId, 'utmId')}
                      >
                        {copied === 'utmId' ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Campaign:</span>
                    <Badge variant="secondary">{generatedQR.config.campaignName}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Source / Medium:</span>
                    <span className="text-sm">
                      {generatedQR.config.utmSource} / {generatedQR.config.utmMedium}
                    </span>
                  </div>
                </div>

                {/* URL */}
                <div className="space-y-2">
                  <Label>Tracking URL</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={generatedQR.url}
                      className="text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(generatedQR.url, 'url')}
                    >
                      {copied === 'url' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => handleDownload('png')}>
                    <Download className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button variant="outline" onClick={() => handleDownload('svg')}>
                    <Download className="h-4 w-4 mr-2" />
                    SVG
                  </Button>
                </div>

                {/* Share Button */}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `QR Code: ${generatedQR.config.campaignName}`,
                        text: `Scan this QR code to register for ${generatedQR.config.campaignName}`,
                        url: generatedQR.url,
                      });
                    } else {
                      handleCopy(generatedQR.url, 'url');
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <QrCode className="h-16 w-16 mb-4 opacity-20" />
                <p>No QR code generated yet</p>
                <p className="text-sm mt-1">
                  Fill in the campaign details and click generate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
