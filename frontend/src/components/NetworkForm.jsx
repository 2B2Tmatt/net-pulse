import { useState } from 'react';

const NetworkForm = ({ handleRun }) => {
  const [query, setQuery] = useState('');
  const [checks, setChecks] = useState({ dns: true, tcp: true, http: true });
  const [tcpPort, setTcpPort] = useState(443);
  const [method, setMethod] = useState('GET');
  const [followRedirects, setFollowRedirects] = useState(true);
  const [timeoutMS, setTimeoutMs] = useState(5000);

  function handleSubmit(e) {
    e.preventDefault();

    const selected = Object.entries(checks)
      .filter(([, v]) => v)
      .map(([k]) => k);

    const payload = {
      query,
      checks: selected,
      tcp: checks.tcp ? { port: Number(tcpPort) } : undefined,
      http: checks.http
        ? {
            method,
            follow_redirects: followRedirects,
            timeout_ms: Number(timeoutMS),
          }
        : undefined,
    };
    handleRun(payload);
  }

  function handleDNS(e) {
    setChecks((c) => ({ ...c, dns: e.target.checked }));
  }

  function handleTCP(e) {
    setChecks((c) => ({ ...c, tcp: e.target.checked }));
  }

  function handleHTTP(e) {
    setChecks((c) => ({ ...c, http: e.target.checked }));
  }

  function handleTCPPort(e) {
    if (e.target.value > 65535) {
      e.target.value = 65535;
    }
    if (e.target.value < 0) {
      e.target.value = 0;
    }
    setTcpPort(e.target.value);
  }

  function handleTimeout(e) {
    if (e.target.value > 5000) {
      e.target.value = 5000;
    }
    if (e.target.value < 0) {
      e.target.value = 0;
    }

    setTimeoutMs(e.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Query
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <label>
        DNS
        <input type="checkbox" checked={checks.dns} onChange={handleDNS} />
      </label>
      <label>
        TCP
        <input type="checkbox" checked={checks.tcp} onChange={handleTCP} />
      </label>
      <label>
        HTTP
        <input type="checkbox" checked={checks.http} onChange={handleHTTP} />
      </label>
      {checks.tcp ? (
        <label>
          TCP port
          <input type="number" value={tcpPort} onChange={handleTCPPort} />
        </label>
      ) : null}
      {checks.http ? (
        <label>
          HTTP Options
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="GET">Get</option>
            <option value="POST">Post</option>
            <option value="PATCH">Patch</option>
            <option value="DELETE">Delete</option>
            <option value="PUT">Put</option>
          </select>
          Follow Redirects
          <input
            type="checkbox"
            checked={followRedirects}
            onChange={(e) => setFollowRedirects(e.target.checked)}
          />
          Timeout(ms): Max 5000
          <input type="number" value={timeoutMS} onChange={handleTimeout} />
        </label>
      ) : null}
      <button type="submit">Test</button>
    </form>
  );
};

export default NetworkForm;
