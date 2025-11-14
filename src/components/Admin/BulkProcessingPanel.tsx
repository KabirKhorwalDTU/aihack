import { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';
import { reviewService } from '../../lib/reviewService';

const BulkProcessingPanel = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadPendingCount();
  }, []);

  const loadPendingCount = async () => {
    try {
      const count = await reviewService.getPendingReviewsCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Failed to load pending count:', error);
    }
  };

  const startProcessing = async () => {
    setProcessing(true);
    setProcessedCount(0);
    setFailedCount(0);
    setLogs([]);
    setCurrentBatch(0);

    const batchSize = 50;
    let offset = 0;
    let hasMore = true;
    let totalProcessed = 0;
    let totalFailed = 0;

    while (hasMore && processing) {
      try {
        addLog(`Processing batch ${currentBatch + 1}...`);
        setCurrentBatch((prev) => prev + 1);

        const result = await reviewService.processBatch(batchSize, offset);

        if (result.processed === 0) {
          hasMore = false;
          addLog('No more reviews to process');
          break;
        }

        totalProcessed += result.successful || 0;
        totalFailed += result.failed || 0;

        setProcessedCount(totalProcessed);
        setFailedCount(totalFailed);
        setProgress(Math.min(100, (totalProcessed / pendingCount) * 100));

        addLog(
          `Batch ${currentBatch + 1} complete: ${result.successful} successful, ${result.failed} failed`
        );

        offset += batchSize;

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        addLog(`Error processing batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
        hasMore = false;
      }
    }

    setProcessing(false);
    addLog('Processing complete!');
    loadPendingCount();
  };

  const stopProcessing = () => {
    setProcessing(false);
    addLog('Processing stopped by user');
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 100));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bulk Review Processing</h2>
        <p className="text-sm text-gray-600">
          Process all pending reviews with OpenAI to extract sentiment, topics, and priority
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-600 mb-1">Pending Reviews</p>
          <p className="text-2xl font-bold text-blue-900">{pendingCount.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-green-50 rounded-xl">
          <p className="text-xs text-green-600 mb-1">Processed</p>
          <p className="text-2xl font-bold text-green-900">{processedCount.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-red-50 rounded-xl">
          <p className="text-xs text-red-600 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-900">{failedCount.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 mb-1">Progress</p>
          <p className="text-2xl font-bold text-gray-900">{progress.toFixed(1)}%</p>
        </div>
      </div>

      {progress > 0 && progress < 100 && (
        <div className="mb-6">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0B5FFF] to-[#0B5FFF]CC rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-3">
        {!processing ? (
          <button
            onClick={startProcessing}
            disabled={pendingCount === 0}
            className="flex items-center gap-2 px-6 py-3 bg-[#0B5FFF] text-white rounded-xl font-medium hover:bg-[#0950CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} />
            Start Processing
          </button>
        ) : (
          <button
            onClick={stopProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            <Pause size={18} />
            Stop Processing
          </button>
        )}

        <button
          onClick={loadPendingCount}
          disabled={processing}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Refresh Count
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Processing Logs</h3>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            Clear
          </button>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Start processing to see activity.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-gray-700">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">Important Notes</p>
            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
              <li>Processing uses OpenAI API and will incur costs based on usage</li>
              <li>Each batch processes up to 50 reviews at a time</li>
              <li>You can stop processing at any time and resume later</li>
              <li>Failed reviews can be retried by running the process again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkProcessingPanel;
