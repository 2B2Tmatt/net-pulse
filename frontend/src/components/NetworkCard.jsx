const NetworkCard = ({ title, r }) => {
  return (
    <div>
      <h1>{title}</h1>
      {Object.keys(r).map((k) => (
        <p>
          {k}: {r[k]}
        </p>
      ))}
    </div>
  );
};
export default NetworkCard;
