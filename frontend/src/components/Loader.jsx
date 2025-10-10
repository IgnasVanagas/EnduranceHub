import './Loader.css';

const Loader = ({ fullscreen = false, message = 'Loading...' }) => (
  <div className={fullscreen ? 'loader loader--fullscreen' : 'loader'}>
    <div className="loader__spinner" />
    <span className="loader__message">{message}</span>
  </div>
);

export default Loader;
