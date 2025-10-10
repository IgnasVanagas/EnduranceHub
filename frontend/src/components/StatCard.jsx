import './StatCard.css';

const StatCard = ({ title, value, description, accent = 'blue' }) => (
  <div className={`stat-card stat-card--${accent}`}>
    <div className="stat-card__value">{value}</div>
    <div className="stat-card__title">{title}</div>
    {description && <div className="stat-card__description">{description}</div>}
  </div>
);

export default StatCard;
