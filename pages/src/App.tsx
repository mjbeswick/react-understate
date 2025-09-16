import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Getting Started
import Introduction from './pages/Introduction';
import Installation from './pages/Installation';
import QuickStart from './pages/QuickStart';

// Guides
import StateManagement from './pages/guides/StateManagement';
import DerivedValues from './pages/guides/DerivedValues';
import Effects from './pages/guides/Effects';
import Batching from './pages/guides/Batching';
import Testing from './pages/guides/Testing';

// API Reference
import StateAPI from './pages/api/StateAPI';
import DerivedAPI from './pages/api/DerivedAPI';
import ActionAPI from './pages/api/ActionAPI';
import EffectAPI from './pages/api/EffectAPI';
import BatchAPI from './pages/api/BatchAPI';
import UseUnderstateAPI from './pages/api/UseUnderstateAPI';

// Patterns
import PatternsIndex from './pages/patterns/index';
import StorePattern from './pages/patterns/StorePattern';
import KeyboardShortcuts from './pages/patterns/KeyboardShortcuts';
import AsyncDataLoading from './pages/patterns/AsyncDataLoading';
import LocalStorage from './pages/patterns/LocalStorage';
import FilteringSorting from './pages/patterns/FilteringSorting';
import FormValidation from './pages/patterns/FormValidation';
import StateComposition from './pages/patterns/StateComposition';
import PerformanceOptimization from './pages/patterns/PerformanceOptimization';

function App() {
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/getting-started/introduction" replace />}
        />

        {/* Getting Started */}
        <Route
          path="/getting-started/introduction"
          element={<Introduction />}
        />
        <Route
          path="/getting-started/installation"
          element={<Installation />}
        />
        <Route path="/getting-started/quick-start" element={<QuickStart />} />

        {/* Guides */}
        <Route path="/guides/state-management" element={<StateManagement />} />
        <Route path="/guides/derived-values" element={<DerivedValues />} />
        <Route path="/guides/effects" element={<Effects />} />
        <Route path="/guides/batching" element={<Batching />} />
        <Route path="/guides/testing" element={<Testing />} />

        {/* API Reference */}
        <Route path="/api/state" element={<StateAPI />} />
        <Route path="/api/derived" element={<DerivedAPI />} />
        <Route path="/api/action" element={<ActionAPI />} />
        <Route path="/api/effect" element={<EffectAPI />} />
        <Route path="/api/batch" element={<BatchAPI />} />
        <Route path="/api/use-understate" element={<UseUnderstateAPI />} />

        {/* Patterns */}
        <Route path="/patterns" element={<PatternsIndex />} />
        <Route path="/patterns/store-pattern" element={<StorePattern />} />
        <Route
          path="/patterns/filtering-sorting"
          element={<FilteringSorting />}
        />
        <Route path="/patterns/async-data" element={<AsyncDataLoading />} />
        <Route path="/patterns/local-storage" element={<LocalStorage />} />
        <Route
          path="/patterns/keyboard-shortcuts"
          element={<KeyboardShortcuts />}
        />
        <Route path="/patterns/form-validation" element={<FormValidation />} />
        <Route
          path="/patterns/state-composition"
          element={<StateComposition />}
        />
        <Route
          path="/patterns/performance-optimization"
          element={<PerformanceOptimization />}
        />
        <Route path="/patterns/*" element={<div>Pattern coming soon...</div>} />

        {/* Fallback */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Layout>
  );
}

export default App;
