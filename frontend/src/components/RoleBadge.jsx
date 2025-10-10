import './RoleBadge.css';

const roleLabels = {
  ATHLETE: 'Athlete',
  SPECIALIST: 'Specialist',
  ADMIN: 'Administrator'
};

const RoleBadge = ({ role }) => (
  <span className={`role-badge role-badge--${role?.toLowerCase() || 'unknown'}`}>
    {roleLabels[role] || role}
  </span>
);

export default RoleBadge;
