// pages/index.js

import React from 'react';
import MatrixList from './MatrixList';






const IndexPage = ({matrixData}) => {
  return (
    <div className="container">
      <MatrixList />
      {/* Add any other content you want on the index page */}
    </div>
  );
};

export default IndexPage;
