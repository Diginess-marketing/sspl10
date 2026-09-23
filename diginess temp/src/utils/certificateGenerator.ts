/**
 * Certificate Generator Utility
 * Generates personalized participation certificates for non-selected players
 */

export interface CertificateOptions {
    playerName: string;
    templatePath?: string;
}

/**
 * Generates a certificate with the player's name overlaid on the template
 * @param options - Configuration options for certificate generation
 * @returns Promise<Blob> - The generated certificate as a blob
 */
export async function generateCertificate(
    options: CertificateOptions,
): Promise<Blob> {
    const { playerName, templatePath = '/certificate-template.jpg' } = options;

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        const image = new Image();
        image.crossOrigin = 'anonymous'; // Enabled for reliable blob generation

        image.onload = () => {
            // Set canvas dimensions to match image
            canvas.width = image.width;
            canvas.height = image.height;

            // Fill with white background first (good practice for JPG/PNG)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the certificate template
            ctx.drawImage(image, 0, 0);

            // Configure text styling for player name
            // Based on the certificate template, the name should be in the center area
            // around 45-50% from the top, using an elegant serif font
            // Configure text styling
            const baseFontSize = Math.floor(canvas.width * 0.045);
            const fontSize = baseFontSize - 5;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Text shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = '#8B7355';

            const nameXPosition = canvas.width / 2;
            const nameYPosition = canvas.height * 0.435;

            // Check for suffix (e.g. "- Double Eagle" or "- Kohinoor")
            // The separator used in PlayerResultCard is " - "
            const separator = ' - ';
            const hasSuffix = playerName.includes(separator);

            if (hasSuffix) {
                const parts = playerName.split(separator);
                const mainName = parts[0];
                const suffix = parts.slice(1).join(separator); // Rejoin rest if multiple separators (unlikely)

                // Layout for Split Text
                const mainNameY = canvas.height * 0.42; // Move name up slightly
                const suffixY = canvas.height * 0.48;   // Suffix below

                // Draw Main Name
                ctx.font = `bold ${fontSize}px "Playfair Display", "Times New Roman", serif`;
                ctx.fillText(mainName.toUpperCase(), nameXPosition, mainNameY);

                // Draw Suffix (Smaller)
                const suffixFontSize = Math.floor(fontSize * 0.65);
                ctx.font = `bold ${suffixFontSize}px "Playfair Display", "Times New Roman", serif`;
                ctx.fillText(suffix.toUpperCase(), nameXPosition, suffixY);
            } else {
                // Single Line Layout (Original)
                ctx.font = `bold ${fontSize}px "Playfair Display", "Times New Roman", serif`;

                // Simple auto-scale for very long names
                const maxWidth = canvas.width * 0.8;
                let currentFontSize = fontSize;
                while (ctx.measureText(playerName.toUpperCase()).width > maxWidth && currentFontSize > 10) {
                    currentFontSize -= 2;
                    ctx.font = `bold ${currentFontSize}px "Playfair Display", "Times New Roman", serif`;
                }

                ctx.fillText(playerName.toUpperCase(), nameXPosition, nameYPosition);
            }

            // Convert canvas to blob as PNG for better quality and compatibility
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log(`Certificate generated: ${blob.size} bytes, type: ${blob.type}`);
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to generate certificate blob'));
                    }
                },
                'image/png', // Using PNG for better compatibility and quality
                1.0, // Maximum quality
            );
        };

        image.onerror = (e) => {
            console.error('Certificate template load error:', e);
            reject(new Error('Failed to load certificate template'));
        };

        // Load the certificate template
        image.src = templatePath;
    });
}

/**
 * Downloads a certificate blob with a given filename
 * @param blob - The certificate blob to download
 * @param playerName - The player's name for the filename
 * @param type - The type of certificate (participation or achievement)
 */
export function downloadCertificate(blob: Blob, playerName: string, type: 'participation' | 'achievement' = 'participation'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename: SSPL_Certificate_Type_PlayerName_Date.png
    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = playerName.replace(/[^a-zA-Z0-9]/g, '_');
    const typeSuffix = type === 'achievement' ? 'Achievement' : 'Participation';
    const filename = `SSPL_Certificate_${typeSuffix}_${sanitizedName}_${date}.png`;

    console.log(`Downloading certificate: ${filename}`);
    link.download = filename;

    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Main function to generate and download a participation certificate
 * @param playerName - The player's name to include on the certificate
 */
export async function generateAndDownloadCertificate(
    playerName: string,
): Promise<void> {
    try {
        const timestamp = Date.now(); // Cache busting
        const blob = await generateCertificate({
            playerName,
            templatePath: `/certificate-participation-template.png?t=${timestamp}`,
        });
        downloadCertificate(blob, playerName, 'participation');
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw error;
    }
}

/**
 * Main function to generate and download an achievement certificate
 * @param playerName - The player's name to include on the certificate
 */
export async function generateAndDownloadAchievementCertificate(
    playerName: string,
): Promise<void> {
    try {
        const timestamp = Date.now(); // Cache busting
        const blob = await generateCertificate({
            playerName,
            templatePath: `/certificate-achievement-template.png?t=${timestamp}`,
        });
        downloadCertificate(blob, playerName, 'achievement');
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw error;
    }
}
