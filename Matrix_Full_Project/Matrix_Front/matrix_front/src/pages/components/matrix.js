import React, { useEffect, useState } from 'react';

const Matrix = ({ matrixName }) => {
  const [matrixData, setMatrixData] = useState([]);
  const [matrixTitle, setMatrixTitle] = useState('');
  const [clickedCells, setClickedCells] = useState({});
  const [totalPriceFromAPI, setTotalPriceFromAPI] = useState(0);

  useEffect(() => {
    fetchMatrixData();
  }, [matrixName]);

  const fetchMatrixData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL);
      const data = await response.json();
      console.log(data); // Log the fetched data
      if (data.data && data.data.length > 0) {
        setMatrixData(data.data);
        setMatrixTitle(data.data[0].attributes.Title_Matrix || '');
        setTotalPriceFromAPI(data.data[0].attributes.Total_Price || 0);
      }
    } catch (error) {
      console.error('Error fetching matrix data:', error);
    }
  };

  const renderPhotoIfExists = (photo) => {
    if (photo && photo.url && photo.url.startsWith('/uploads')) {
      return <img src={`http://localhost:1338${photo.url}`} alt={`Photo ${photo.name}`} />;
    }
    return 'N/A';
  };

  const extractRowNames = () => {
    if (matrixData.length === 0) return [];

    const rowNames = [];
    const attributeKeys = Object.keys(matrixData[0].attributes);

    for (const key of attributeKeys) {
      if (key.startsWith('Row_Name_')) {
        const rowIndex = parseInt(key.split('_')[2], 10);
        if (!isNaN(rowIndex)) {
          rowNames[rowIndex - 1] = matrixData[0].attributes[key];
        }
      }
    }

    return rowNames;
  };

  const extractColumnNames = () => {
    if (matrixData.length === 0) return [];

    const columnNames = [];
    const attributeKeys = Object.keys(matrixData[0].attributes);

    for (const key of attributeKeys) {
      if (key.startsWith('Column_Name_')) {
        const columnIndex = parseInt(key.split('_')[2], 10);
        if (!isNaN(columnIndex)) {
          columnNames[columnIndex - 1] = matrixData[0].attributes[key];
        }
      }
    }

    return columnNames;
  };

  const extractText = (colIndex, rowIndex) => {
    const textKey = `Text_${colIndex}_${rowIndex}`;
    return matrixData[0].attributes[textKey] || '';
  };

  const extractPrice = (colIndex, rowIndex) => {
    const priceKey = `Price_${colIndex}_${rowIndex}`;
    return matrixData[0].attributes[priceKey] || 0;
  };

  const handleCellClick = (colIndex, rowIndex) => {
    setClickedCells((prevClickedCells) => {
      const updatedClickedCells = { ...prevClickedCells };
  
      // Check if any other cell was clicked in the same column, and reset it
      const clickedRowIndex = updatedClickedCells[colIndex];
      if (typeof clickedRowIndex !== 'undefined') {
        updatedClickedCells[colIndex] = undefined;
      } else {
        updatedClickedCells[colIndex] = rowIndex;
      }
  
      return updatedClickedCells;
    });
  };
  
  const calculateTotalPrice = () => {
    let total = 0;
    Object.entries(clickedCells).forEach(([colIndex, rowIndex]) => {
      total += extractPrice(parseInt(colIndex) + 1, parseInt(rowIndex) + 1);
    });
    return total;
  };

  const temperatureColor = (percentage) => {
    if (percentage > 95) {
      return 'red';
    } else if (percentage > 80) {
      return 'yellow';
    } else {
      return 'green';
    }
  };

  const percentage = (calculateTotalPrice() / totalPriceFromAPI) * 100;

  const getNumberOfColumns = () => {
    if (matrixData.length === 0) return 0;

    let maxColIndex = 0;
    const attributeKeys = Object.keys(matrixData[0].attributes);

    for (const key of attributeKeys) {
      if (key.startsWith('Text_')) {
        const [colIndex] = key.split('_').slice(1).map((index) => parseInt(index, 10));
        if (!isNaN(colIndex) && colIndex > maxColIndex) {
          maxColIndex = colIndex;
        }
      }
    }

    return maxColIndex;
  };

  const getNumberOfRows = () => {
    if (matrixData.length === 0) return 0;

    let maxRowIndex = 0;
    const attributeKeys = Object.keys(matrixData[0].attributes);

    for (const key of attributeKeys) {
      if (key.startsWith('Text_')) {
        const [, rowIndex] = key.split('_').slice(1).map((index) => parseInt(index, 10));
        if (!isNaN(rowIndex) && rowIndex > maxRowIndex) {
          maxRowIndex = rowIndex;
        }
      }
    }

    return maxRowIndex;
  };

  const numberOfColumns = getNumberOfColumns();
  const numberOfRows = getNumberOfRows();

  return (
    <div className="container">
      {matrixTitle && <h1 className="matrix-title">{matrixTitle}</h1>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ backgroundColor: '#245a99' }}>Row Name</th>
              {extractColumnNames().map((columnName, colIndex) => (
                <th key={colIndex}>{columnName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {extractRowNames().map((rowName, rowIndex) => (
              <tr key={rowIndex}>
                <td className="rotate">
                  <div className="row-name">{rowName}</div>
                </td>
                {[...Array(numberOfColumns)].map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className={clickedCells[colIndex] === rowIndex ? 'clicked' : ''}
                    onClick={() => handleCellClick(colIndex, rowIndex)}
                  >
                    <div className="image-container">
                      {renderPhotoIfExists(
                        matrixData[0].attributes[`Photo_${colIndex + 1}_${rowIndex + 1}`]?.data?.attributes
                      )}
                    </div>
                    <p>{extractText(colIndex + 1, rowIndex + 1)}</p>
                    <p>Price: ${extractPrice(colIndex + 1, rowIndex + 1)}</p>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     {/* Flex container for "Total Budget" and "Total Estimated Price" */}
     <div className="total-container">
        <div className="total-price">
          <p>Total Budget: ${totalPriceFromAPI}</p>
        </div>
        <div className="total-estimated-price">
          <p>Total Estimated Budget: ${calculateTotalPrice()}</p>
        </div>
      </div>
      <div className="temperature-bar">
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: temperatureColor(percentage),
            height: '100%',
            borderRadius: '4px',
          }}
          />
        </div>
  
        <style jsx>{`
        /* Styles for the entire component */
        .container {
          font-family: 'Arial', sans-serif; /* Replace 'Arial' with your preferred sans-serif font */
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background-color: #f9f7f0;
        }

        /* Rest of the styles */
        .matrix-title {
          font-size: 40px;
          margin-bottom: 20px;
          color: black;
          text-align: left;
        }
        .table-container {
          display: block;
          max-width: 100%;
          overflow-x: auto;
        }
        table {
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 14px;
          table-layout: auto;
          width: 100%;
        }
        th,
        td {
          border: 5px solid #ddd;
          border-color: #0a32f4;
          padding: 10px;
          text-align: left;
          white-space: normal;
          word-break: break-word;
          overflow-wrap: break-word;
          font-family: 'Arial', sans-serif; /* Replace 'Arial' with your preferred sans-serif font */
          font-weight: bold;
          
          color: black;
        }
        th {
          background-color: #245a99;
          color: white;
        }
        img {
          max-width: 60px;
          max-height: 60px;
        }
        .rotate {
          white-space: nowrap;
        }
        .rotate div {
          transform: rotate(0 deg);
          transform-origin: left top;
          width: 80px;
          font-size: 14px;
          font-family: 'Arial', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80px; /* Adjust the height to center the text vertically */
          
        }
      
        }
        .image-container {
          display: flex;
          justify-content: center; /* Center horizontally */
          align-items: center; /* Center vertically */
          height: 100%; /* Make the container take the full height of the cell */
          
        }

        /* Modified style for the clicked cells */
        td.clicked {
          background-color: #8ab7e8;
        }

        /* Style for the total price */
        .total-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          font-weight: bold;
          color: black;
        }

        .total-price,
        .total-estimated-price {
          flex: 1;
        }

        /* Style for the temperature bar */
        .temperature-bar {
          margin-top: 20px;
          height: 40px; /* Double the height to make it double thick */
          background-color: #f2f2f2;
          border-radius: 4px;
          overflow: hidden;
        }

        .temperature-bar div {
          height: 100%;
          transition: width 0.3s;
        }

        .temperature-bar div.green {
          background-color: green;
        }

        .temperature-bar div.yellow {
          background-color: yellow;
        }

        .temperature-bar div.red {
          background-color: red;
        }
      `}</style>
      </div>
    );
  };
  
  export default Matrix;