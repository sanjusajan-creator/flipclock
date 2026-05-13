import FlipCard from './FlipCard';

const FlipUnit = ({ value, label }) => {
  // Ensure we have two digits (e.g., 5 -> "05")
  const stringValue = String(value).padStart(2, '0');
  const tensDigit = stringValue[0];
  const onesDigit = stringValue[1];

  return (
    <div className="flip-unit">
      <div className="unit-cards">
        <FlipCard digit={tensDigit} />
        <FlipCard digit={onesDigit} />
      </div>
      <span className="unit-label">{label}</span>
    </div>
  );
};

export default FlipUnit;
