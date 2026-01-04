import NetworkCard from './NetworkCard';

const NetworkDisplay = ({ data, onReset }) => {
  return (
    <div>
      <button onClick={onReset}>New Run</button>
      <h2>Overall: {data.overall}</h2>
      <NetworkCard title="DNS" r={data.dns} />
      <NetworkCard title="TCP" r={data.tcp} />
      <NetworkCard title="HTTP" r={data.http} />
    </div>
  );
};
export default NetworkDisplay;
