import { useState } from 'react';
import NetworkForm from './components/NetworkForm';
import NetworkDisplay from './components/NetworkDisplay';

function App() {
  const [result, setResult] = useState(null);

  async function handleRun(payload) {
    const res = await fetch('http://localhost:8080/api/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
  }

  function handleReset() {
    setResult(null);
  }

  return (
    <div>
      {result ? (
        <NetworkDisplay data={result} onReset={handleReset} />
      ) : (
        <NetworkForm handleRun={handleRun} />
      )}
    </div>
  );
}

export default App;
