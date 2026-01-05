const NetworkCard = ({ title, r }) => {
  // Backend returns a struct even when not run yet; use attempted to decide neutral vs data.
  if (!r || r.attempted !== true) {
    return <div className="subtle">Not run</div>;
  }

  function renderValue(v) {
    if (v == null) return { text: String(v), isError: false };

    // backend ErrInfo: { type, message }
    if (typeof v === 'object' && v && 'type' in v && 'message' in v) {
      const msg = v.message ? ` - ${String(v.message)}` : '';
      return { text: `${String(v.type)}${msg}`, isError: true };
    }

    if (typeof v === 'object') {
      try {
        return { text: JSON.stringify(v), isError: false };
      } catch {
        return { text: String(v), isError: false };
      }
    }

    return { text: String(v), isError: false };
  }

  const keys = Object.keys(r);

  return (
    <div>
      <div className="kv">
        {keys.map((k) => {
          const rendered = renderValue(r[k]);
          return (
            <div className="kv-row" key={k}>
              <div className="k">{k}</div>
              <div className={`v ${rendered.isError ? 'v-error' : ''}`}>
                {rendered.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkCard;
