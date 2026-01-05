const NetworkCard = ({ title, r }) => {
  if (!r) return <div className="subtle">No data</div>;

  function renderValue(v) {
    if (v == null) return String(v);

    if (typeof v === 'object' && 'type' in v && 'message' in v) {
      return {
        text: `${String(v.type)} - ${String(v.message)}`,
        isError: true,
      };
    }

    if (typeof v === 'object') {
      return { text: JSON.stringify(v), isError: false };
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
