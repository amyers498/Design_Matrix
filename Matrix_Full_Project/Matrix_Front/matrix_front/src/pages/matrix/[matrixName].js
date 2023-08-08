import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Matrix from '../components/matrix';

const MatrixPage = () => {
  const router = useRouter();
  const { matrixName } = router.query;
  const [matrixData, setMatrixData] = useState(null);

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL);
      const data = await response.json();
      console.log(data); // Log the fetched data
      if (data.data && data.data.length > 0) {
        // Find the matrix data based on the matrixName in the URL
        const matrix = data.data.find((matrix) => matrix.attributes.Title_Matrix === matrixName);
        if (matrix) {
          setMatrixData(matrix);
        } else {
          console.error('Matrix not found');
        }
      }
    } catch (error) {
      console.error('Error fetching matrix data:', error);
    }
  };

  return (
    <div>
      {matrixData ? (
        <Matrix matrixData={matrixData} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default MatrixPage;
