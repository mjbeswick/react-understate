import { state, effect } from 'react-understate';

const inputData = state({ items: [] }, 'inputData');
const processedData = state([], 'processedData');
const processingLog = state([], 'processingLog');

// Data processing pipeline that re-runs on any change
effect(
  () => {
    const items = inputData.value.items;
    const currentLog = processingLog.value;

    // Process the data
    const processed = items.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now(),
    }));

    // Update processed data
    processedData.value = processed;

    // Log the processing (this would normally cause a loop)
    processingLog.value = [
      ...currentLog,
      `Processed ${processed.length} items at ${new Date().toISOString()}`,
    ];

    console.log(`Processing complete: ${processed.length} items`);
  },
  'dataProcessingPipeline',
  { preventLoops: false },
);

// This will trigger multiple processing cycles
inputData.value = { items: [{ id: 1, name: 'Item 1' }] };
