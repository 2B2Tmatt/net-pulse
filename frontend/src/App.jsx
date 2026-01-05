import { useState } from 'react';
import NetworkDisplay from './components/NetworkDisplay';
import NetworkForm from './components/NetworkForm';

function App() {
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function formatCheckError(label, err) {
    if (!err) return null;
    const type = err.type ? String(err.type) : 'Error';
    const msg = err.message ? String(err.message) : '';
    return `${label}: ${type}${msg ? ` - ${msg}` : ''}`;
  }

  async function handleRun(payload) {
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!text) {
        throw new Error(
          `Server returned an empty response (status ${res.status}).`,
        );
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned non-JSON response (status ${res.status}).`,
        );
      }

      if (typeof data?.error === 'string' && data.error.trim()) {
        setErrorMsg(data.error);
        setResult(null);
        return;
      }

      const nested = [
        formatCheckError('DNS', data?.dns?.error),
        formatCheckError('TCP', data?.tcp?.error),
        formatCheckError('HTTP', data?.http?.error),
      ].filter(Boolean);

      setErrorMsg(nested.length ? nested.join('\n') : '');
      setResult(data);
    } catch (err) {
      setErrorMsg(err?.message || 'Network error: request failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setErrorMsg('');
    setLoading(false);
  }

  return (
    <div className="app-shell">
      <div className="net-label" aria-live="polite">
        net-pulse{' '}
        <span className="net-label-state">
          {loading ? 'testing…' : result ? 'ready' : 'idle'}
        </span>
      </div>

      <div className="container">
        <h1 className="page-title">Network Lookup</h1>

        {result ? (
          <NetworkDisplay
            data={result}
            errorMsg={errorMsg}
            onReset={handleReset}
          />
        ) : (
          <NetworkForm
            handleRun={handleRun}
            loading={loading}
            errorMsg={errorMsg}
          />
        )}
      </div>
    </div>
  );
}

export default App;
