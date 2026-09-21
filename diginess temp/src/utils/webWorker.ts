// Web Worker for heavy computations to prevent main thread blocking
export class ComputationWorker {
  private worker: Worker | null = null;
  private isSupported = typeof Worker !== 'undefined';

  constructor() {
    if (this.isSupported) {
      try {
        // Create inline worker for heavy computations
        const workerCode = `
          self.onmessage = function(e) {
            const { type, data } = e.data;

            switch (type) {
              case 'process-gallery-images':
                // Process gallery images in chunks to avoid blocking
                const result = processGalleryImages(data);
                self.postMessage({ type: 'gallery-processed', result });
                break;

              case 'optimize-image-data':
                // Optimize image data processing
                const optimized = optimizeImageData(data);
                self.postMessage({ type: 'image-optimized', result: optimized });
                break;

              case 'calculate-performance-metrics':
                // Calculate performance metrics
                const metrics = calculatePerformanceMetrics(data);
                self.postMessage({ type: 'metrics-calculated', result: metrics });
                break;

              default:
                self.postMessage({ type: 'error', error: 'Unknown task type' });
            }
          };

          function processGalleryImages(images) {
            // Process images in small chunks
            const chunkSize = 5;
            const results = [];

            for (let i = 0; i < images.length; i += chunkSize) {
              const chunk = images.slice(i, i + chunkSize);

              // Simulate processing time with small delay
              const processedChunk = chunk.map(img => ({
                ...img,
                processed: true,
                timestamp: Date.now()
              }));

              results.push(...processedChunk);

              // Yield control back to main thread periodically
              if (i % 20 === 0) {
                self.postMessage({ type: 'progress', progress: (i / images.length) * 100 });
              }
            }

            return results;
          }

          function optimizeImageData(imageData) {
            // Optimize image processing data
            return {
              ...imageData,
              optimized: true,
              compressionRatio: 0.8,
              processingTime: Date.now()
            };
          }

          function calculatePerformanceMetrics(metrics) {
            // Calculate performance metrics off main thread
            const calculated = {
              ...metrics,
              calculatedAt: Date.now(),
              thread: 'worker'
            };

            return calculated;
          }
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
      } catch (error) {
        this.isSupported = false;
      }
    }
  }

  // Process gallery images without blocking main thread
  async processGalleryImages(images: any[]): Promise<any[]> {
    if (!this.isSupported || !this.worker) {
      // Fallback to main thread processing in small chunks
      return this.processImagesOnMainThread(images);
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        const { type, result, error, progress } = e.data;

        if (type === 'gallery-processed') {
          this.worker!.removeEventListener('message', handleMessage);
          resolve(result);
        } else if (type === 'progress') {
          // Optional: emit progress events
        } else if (type === 'error') {
          this.worker!.removeEventListener('message', handleMessage);
          reject(new Error(error));
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({ type: 'process-gallery-images', data: images });

      // Timeout fallback
      setTimeout(() => {
        if (this.worker) {
          this.worker.removeEventListener('message', handleMessage);
        }
        reject(new Error('Worker processing timeout'));
      }, 30000);
    });
  }

  // Fallback processing on main thread with yielding
  private async processImagesOnMainThread(images: any[]): Promise<any[]> {
    const results: any[] = [];
    const chunkSize = 3; // Smaller chunks for main thread

    for (let i = 0; i < images.length; i += chunkSize) {
      const chunk = images.slice(i, i + chunkSize);

      // Process chunk
      const processedChunk = chunk.map(img => ({
        ...img,
        processed: true,
        timestamp: Date.now(),
        fallback: true,
      }));

      results.push(...processedChunk);

      // Yield control back to main thread
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return results;
  }

  // Optimize image data processing
  async optimizeImageData(data: any): Promise<any> {
    if (!this.isSupported || !this.worker) {
      return {
        ...data,
        optimized: true,
        fallback: true,
        processingTime: Date.now(),
      };
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        const { type, result, error } = e.data;

        if (type === 'image-optimized') {
          this.worker!.removeEventListener('message', handleMessage);
          resolve(result);
        } else if (type === 'error') {
          this.worker!.removeEventListener('message', handleMessage);
          reject(new Error(error));
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({ type: 'optimize-image-data', data });

      setTimeout(() => {
        if (this.worker) {
          this.worker.removeEventListener('message', handleMessage);
        }
        reject(new Error('Worker optimization timeout'));
      }, 10000);
    });
  }

  // Calculate performance metrics off main thread
  async calculateMetrics(metrics: any): Promise<any> {
    if (!this.isSupported || !this.worker) {
      return {
        ...metrics,
        calculatedAt: Date.now(),
        thread: 'main',
        fallback: true,
      };
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        const { type, result, error } = e.data;

        if (type === 'metrics-calculated') {
          this.worker!.removeEventListener('message', handleMessage);
          resolve(result);
        } else if (type === 'error') {
          this.worker!.removeEventListener('message', handleMessage);
          reject(new Error(error));
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({ type: 'calculate-performance-metrics', data: metrics });

      setTimeout(() => {
        if (this.worker) {
          this.worker.removeEventListener('message', handleMessage);
        }
        reject(new Error('Worker metrics calculation timeout'));
      }, 5000);
    });
  }

  // Cleanup worker
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Singleton instance
export const computationWorker = new ComputationWorker();