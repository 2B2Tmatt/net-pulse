import NetworkCard from './NetworkCard';

function hasErr(x) {
  return !!x?.error;
}

function overallStatus(data, errorMsg) {
  const anyError = hasErr(data?.dns) || hasErr(data?.tcp) || hasErr(data?.http);
  const ok = !errorMsg && !anyError;
  return ok
    ? { label: 'OK', cls: 'status-ok' }
    : { label: 'FAIL', cls: 'status-fail' };
}

function panelStateClass(r) {
  if (!r) return '';
  return hasErr(r) ? 'panel-fail' : 'panel-ok';
}

function cardStateClass(r) {
  if (!r) return '';
  return hasErr(r) ? 'card-fail' : 'card-ok';
}

const NetworkDisplay = ({ data, errorMsg = '', onReset }) => {
  const status = overallStatus(data, errorMsg);

  return (
    <div className="dashboard">
      <div className="panel dash-summary">
        <div className="panel-header">
          <div className="summary-bar">
            <div>
              <h2 className="panel-title">Dashboard</h2>
              <div className="subtle">
                Target:{' '}
                <span style={{ color: 'rgba(250,252,255,0.88)' }}>
                  {data?.query || '(unknown)'}
                </span>
              </div>
            </div>

            <div className="pill">
              Status:{' '}
              <span className={`status ${status.cls}`}>{status.label}</span>
            </div>
          </div>

          <button className="btn" onClick={onReset}>
            New Run
          </button>
        </div>

        <div className="panel-body">
          {errorMsg ? <div className="alert">{errorMsg}</div> : null}
          <div className="subtle">
            Each card tints green when that check succeeded, red when it
            returned an error. If a check was not run, it stays neutral.
          </div>
        </div>
      </div>

      <div className={`panel dash-dns ${panelStateClass(data?.dns)}`}>
        <div className="panel-header">
          <h3 className="panel-title">DNS</h3>
        </div>
        <div className={`panel-body ${cardStateClass(data?.dns)}`}>
          <NetworkCard title="DNS" r={data?.dns} />
        </div>
      </div>

      <div className={`panel dash-tcp ${panelStateClass(data?.tcp)}`}>
        <div className="panel-header">
          <h3 className="panel-title">TCP</h3>
        </div>
        <div className={`panel-body ${cardStateClass(data?.tcp)}`}>
          <NetworkCard title="TCP" r={data?.tcp} />
        </div>
      </div>

      <div className={`panel dash-http ${panelStateClass(data?.http)}`}>
        <div className="panel-header">
          <h3 className="panel-title">HTTP</h3>
        </div>
        <div className={`panel-body ${cardStateClass(data?.http)}`}>
          <NetworkCard title="HTTP" r={data?.http} />
        </div>
      </div>
    </div>
  );
};

export default NetworkDisplay;
