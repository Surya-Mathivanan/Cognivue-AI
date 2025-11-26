import React from 'react';

const Loader = ({ message = "" }) => {
  return (
    <div className="loader-wrapper">
      <span className="loader-letter">G</span>
      <span className="loader-letter">e</span>
      <span className="loader-letter">n</span>
      <span className="loader-letter">e</span>
      <span className="loader-letter">r</span>
      <span className="loader-letter">a</span>
      <span className="loader-letter">t</span>
      <span className="loader-letter">i</span>
      <span className="loader-letter">n</span>
      <span className="loader-letter">g</span>
      <div className="loader"></div>
      {message && <div className="loader-message">{message}</div>}
    </div>
  );
};

export default Loader;