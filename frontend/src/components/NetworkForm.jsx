import { useMemo, useState } from 'react';

const NetworkForm = ({ handleRun, loading = false, errorMsg = '' }) => {
  const [query, setQuery] = useState('');
  const [checks, setChecks] = useState({ dns: true, tcp: true, http: true });

  const [tcpPort, setTcpPort] = useState(443);

  const [method, setMethod] = useState('GET');
  const [followRedirects, setFollowRedirects] = useState(true);
  const [timeoutMS, setTimeoutMs] = useState(5000);

  const selectedChecks = useMemo(
    () =>
      Object.entries(checks)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [checks],
  );

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!query.trim()) return false;
    if (selectedChecks.length === 0) return false;
    return true;
  }, [loading, query, selectedChecks.length]);

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      query: query.trim(),
      checks: selectedChecks,
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

  const sectionClass = (enabled) =>
    `section ${enabled ? '' : 'section-disabled'}`;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Run checks</h2>
        <div className="subtle">
          DNS / TCP / HTTP — returns structured results + errors
        </div>
      </div>

      <div className="panel-body">
        {errorMsg ? <div className="alert">{errorMsg}</div> : null}

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Query */}
          <div className="section">
            <div className="section-head">
              <div>
                <div className="panel-title">Target</div>
                <div className="hint">Domain / host / URL</div>
              </div>
              <div className="pill">required</div>
            </div>

            <div className="section-body">
              <div className="field">
                <div className="label">Query</div>
                <input
                  className="input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                  placeholder="example.com"
                />
              </div>

              <div className="small-note">
                Tip: if you disable a section, its options won’t be sent.
              </div>
            </div>
          </div>

          {/* Checks */}
          <div className="section">
            <div className="section-head">
              <div>
                <div className="panel-title">Checks</div>
                <div className="hint">Choose what to run</div>
              </div>
              <div className="pill">{selectedChecks.length} selected</div>
            </div>

            <div className="section-body">
              <div className="chips">
                <label className="chip">
                  <input
                    type="checkbox"
                    checked={checks.dns}
                    disabled={loading}
                    onChange={(e) =>
                      setChecks((c) => ({ ...c, dns: e.target.checked }))
                    }
                  />
                  DNS
                </label>

                <label className="chip">
                  <input
                    type="checkbox"
                    checked={checks.tcp}
                    disabled={loading}
                    onChange={(e) =>
                      setChecks((c) => ({ ...c, tcp: e.target.checked }))
                    }
                  />
                  TCP
                </label>

                <label className="chip">
                  <input
                    type="checkbox"
                    checked={checks.http}
                    disabled={loading}
                    onChange={(e) =>
                      setChecks((c) => ({ ...c, http: e.target.checked }))
                    }
                  />
                  HTTP
                </label>
              </div>

              {selectedChecks.length === 0 ? (
                <div className="small-note">
                  Select at least one check to run.
                </div>
              ) : null}
            </div>
          </div>

          <div className={sectionClass(checks.tcp)}>
            <div className="section-head">
              <div>
                <div className="panel-title">TCP Options</div>
                <div className="hint">
                  {checks.tcp ? 'Active' : 'Disabled (not sent)'}
                </div>
              </div>
              <div className="pill">port</div>
            </div>

            <div className="section-body">
              <fieldset
                disabled={!checks.tcp || loading}
                style={{ border: 'none', padding: 0, margin: 0 }}
              >
                <div className="row">
                  <div className="field" style={{ flex: '1 1 240px' }}>
                    <div className="label">Port</div>
                    <input
                      className="input"
                      type="number"
                      value={tcpPort}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        if (Number.isNaN(v)) v = 0;
                        if (v > 65535) v = 65535;
                        if (v < 0) v = 0;
                        setTcpPort(v);
                      }}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          <div className={sectionClass(checks.http)}>
            <div className="section-head">
              <div>
                <div className="panel-title">HTTP Options</div>
                <div className="hint">
                  {checks.http ? 'Active' : 'Disabled (not sent)'}
                </div>
              </div>
              <div className="pill">method + timeout</div>
            </div>

            <div className="section-body">
              <fieldset
                disabled={!checks.http || loading}
                style={{ border: 'none', padding: 0, margin: 0 }}
              >
                <div className="row">
                  <div className="field" style={{ flex: '1 1 220px' }}>
                    <div className="label">Method</div>
                    <select
                      className="select"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </div>

                  <div className="field" style={{ flex: '1 1 220px' }}>
                    <div className="label">Timeout (ms) — max 5000</div>
                    <input
                      className="input"
                      type="number"
                      value={timeoutMS}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        if (Number.isNaN(v)) v = 0;
                        if (v > 5000) v = 5000;
                        if (v < 0) v = 0;
                        setTimeoutMs(v);
                      }}
                    />
                  </div>
                </div>

                <div className="row" style={{ marginTop: 10 }}>
                  <label className="chip">
                    <input
                      type="checkbox"
                      checked={followRedirects}
                      onChange={(e) => setFollowRedirects(e.target.checked)}
                    />
                    Follow redirects
                  </label>
                </div>
              </fieldset>
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button
              className="btn"
              type="button"
              disabled={loading}
              onClick={() => setQuery('')}
            >
              Clear
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!canSubmit}
            >
              {loading ? 'Testing…' : 'Run'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NetworkForm;
