// ✅ DO: Batch related updates together
const goodBatching = action(
  () => {
    batch(() => {
      // Related UI updates
      sidebarOpen(true);
      activePanel('settings');
      currentTab('profile');
    });
  },
  { name: 'goodBatching' },
);

// ❌ DON'T: Batch unrelated updates
const badBatching = action(
  () => {
    batch(() => {
      // Unrelated updates - confusing
      userProfile(profile);
      weatherData(weather);
      gameScore(score);
    });
  },
  { name: 'badBatching' },
);

// ✅ DO: Use batching for performance-critical operations
const performanceCritical = action(
  () => {
    const largeDataset = generateLargeDataset();

    batch(() => {
      // Batch updates for large datasets
      items(largeDataset);
      totalCount(largeDataset.length);
      lastUpdated(new Date());
    });
  },
  { name: 'performanceCritical' },
);

// ❌ DON'T: Over-batch simple operations
const overBatching = action(
  () => {
    batch(() => {
      // Unnecessary batching for simple updates
      count(count() + 1);
    });
  },
  { name: 'overBatching' },
);

// ✅ DO: Batch updates in effects when appropriate
const goodEffectBatching = effect(
  () => {
    const data = externalData();

    if (data) {
      batch(() => {
        // Batch related updates in effects
        processData(data);
        updateCache(data);
        notifySubscribers(data);
      });
    }
  },
  { name: 'goodEffectBatching' },
);

// ❌ DON'T: Always batch in effects
const badEffectBatching = effect(
  () => {
    // Don't batch every effect update
    batch(() => {
      singleStateUpdate(value);
    });
  },
  { name: 'badEffectBatching' },
);

// ✅ DO: Use descriptive batch names for debugging
const descriptiveBatching = action(
  () => {
    console.log('action: updating user profile');

    batch(() => {
      // Clear what this batch does
      userProfile(profile);
      userSettings(settings);
      userPreferences(preferences);
    });
  },
  { name: 'descriptiveBatching' },
);

// ✅ DO: Handle errors in batches properly
const errorHandlingBatching = action(
  async () => {
    try {
      const data = await fetchData();

      batch(() => {
        // All updates happen together
        processData(data);
        updateUI(data);
        clearErrors();
      });
    } catch (error) {
      batch(() => {
        // Batch error state updates
        setError(error.message);
        setLoading(false);
        resetData();
      });
    }
  },
  { name: 'errorHandlingBatching' },
);

// ✅ DO: Monitor batching performance
const monitoredBatching = action(
  () => {
    const start = performance.now();

    batch(() => {
      performUpdates();
    });

    const duration = performance.now() - start;
    if (duration > 16) {
      console.warn(`Slow batch: ${duration.toFixed(2)}ms`);
    }
  },
  { name: 'monitoredBatching' },
);
