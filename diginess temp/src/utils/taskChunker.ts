/**
 * Utility for breaking long-running tasks into smaller chunks
 * to prevent main thread blocking and improve responsiveness
 */

export interface TaskChunk<T = any> {
  id: string;
  data: T;
  priority: 'high' | 'medium' | 'low';
  timeout?: number;
}

export interface ChunkedTaskResult<T = any> {
  success: boolean;
  results: T[];
  errors: Error[];
  duration: number;
  chunksProcessed: number;
}

/**
 * Task chunker that processes items in small batches with yielding
 */
export class TaskChunker {
  private static instance: TaskChunker;
  private isProcessing = false;
  private taskQueue: TaskChunk[] = [];
  private processingPromises = new Map<string, Promise<any>>();

  static getInstance(): TaskChunker {
    if (!TaskChunker.instance) {
      TaskChunker.instance = new TaskChunker();
    }
    return TaskChunker.instance;
  }

  /**
   * Process items in chunks with automatic yielding to prevent blocking
   */
  async processInChunks<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R> | R,
    options: {
      chunkSize?: number;
      yieldEvery?: number;
      timeout?: number;
      onProgress?: (processed: number, total: number) => void;
      priority?: 'high' | 'medium' | 'low';
    } = {},
  ): Promise<ChunkedTaskResult<R>> {
    const {
      chunkSize = 5,
      yieldEvery = 10,
      timeout = 30000,
      onProgress,
      priority = 'medium',
    } = options;

    const startTime = Date.now();
    const results: R[] = [];
    const errors: Error[] = [];
    let chunksProcessed = 0;

    try {
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);

        // Process chunk
        const chunkPromises = chunk.map(async (item, chunkIndex) => {
          try {
            const result = await processor(item, i + chunkIndex);
            results.push(result);
            return result;
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            errors.push(err);
            return null;
          }
        });

        await Promise.all(chunkPromises);
        chunksProcessed++;

        // Yield control back to main thread periodically
        if (chunksProcessed % yieldEvery === 0) {
          await this.yieldToMainThread();
        }

        // Report progress
        if (onProgress) {
          onProgress(Math.min(i + chunkSize, items.length), items.length);
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {
          throw new Error(`Task processing timeout after ${timeout}ms`);
        }
      }

      return {
        success: errors.length === 0,
        results: results.filter(r => r !== null),
        errors,
        duration: Date.now() - startTime,
        chunksProcessed,
      };
    } catch (error) {
      return {
        success: false,
        results: results.filter(r => r !== null),
        errors: [...errors, error instanceof Error ? error : new Error(String(error))],
        duration: Date.now() - startTime,
        chunksProcessed,
      };
    }
  }

  /**
   * Process a single heavy task by breaking it into micro-tasks
   */
  async processHeavyTask<T>(
    task: () => T | Promise<T>,
    options: {
      breakIntoMicroTasks?: boolean;
      microTaskSize?: number;
      timeout?: number;
    } = {},
  ): Promise<T> {
    const { breakIntoMicroTasks = false, timeout = 10000 } = options;

    if (!breakIntoMicroTasks) {
      return this.runWithTimeout(task, timeout);
    }

    // For tasks that can be broken into micro-tasks
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkTimeout = () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Task timeout after ${timeout}ms`));
          return true;
        }
        return false;
      };

      const runTask = async () => {
        try {
          if (checkTimeout()) return;
          const result = await task();
          if (!checkTimeout()) {
            resolve(result);
          }
        } catch (error) {
          if (!checkTimeout()) {
            reject(error);
          }
        }
      };

      // Use setTimeout to defer execution
      setTimeout(runTask, 0);
    });
  }

  /**
   * Yield control back to the main thread
   */
  private async yieldToMainThread(): Promise<void> {
    return new Promise(resolve => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => resolve(), { timeout: 16 }); // ~60fps
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  /**
   * Run a task with timeout protection
   */
  private async runWithTimeout<T>(task: () => T | Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task timeout after ${timeout}ms`));
      }, timeout);

      Promise.resolve(task())
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Queue a task for background processing
   */
  async queueTask<T>(
    task: TaskChunk<T>,
    processor: (data: T) => Promise<any>,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const taskId = task.id;

      if (this.processingPromises.has(taskId)) {
        reject(new Error(`Task ${taskId} is already processing`));
        return;
      }

      const processPromise = this.processHeavyTask(
        () => processor(task.data),
        { timeout: task.timeout || 30000 },
      );

      this.processingPromises.set(taskId, processPromise);

      processPromise
        .then(result => {
          this.processingPromises.delete(taskId);
          resolve(result);
        })
        .catch(error => {
          this.processingPromises.delete(taskId);
          reject(error);
        });
    });
  }

  /**
   * Cancel a queued task
   */
  cancelTask(taskId: string): boolean {
    const promise = this.processingPromises.get(taskId);
    if (promise) {
      this.processingPromises.delete(taskId);
      return true;
    }
    return false;
  }

  /**
   * Get current processing status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.processingPromises.size,
    };
  }
}

// Export singleton instance
export const taskChunker = TaskChunker.getInstance();

/**
 * Utility functions for common chunked operations
 */
export const chunkedUtils = {
  /**
   * Process array in chunks with progress callback
   */
  async processArray<T, R>(
    array: T[],
    processor: (item: T) => Promise<R> | R,
    options: {
      chunkSize?: number;
      onProgress?: (processed: number, total: number) => void;
    } = {},
  ): Promise<R[]> {
    const { chunkSize = 10, onProgress } = options;
    const results: R[] = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(item => Promise.resolve(processor(item))),
      );
      results.push(...chunkResults);

      if (onProgress) {
        onProgress(Math.min(i + chunkSize, array.length), array.length);
      }

      // Yield to main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  },

  /**
   * Debounced processing to prevent excessive calls
   */
  createDebouncedProcessor<T>(
    processor: (data: T) => void,
    delay: number = 100,
  ): (data: T) => void {
    let timeoutId: NodeJS.Timeout;

    return (data: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => processor(data), delay);
    };
  },
};