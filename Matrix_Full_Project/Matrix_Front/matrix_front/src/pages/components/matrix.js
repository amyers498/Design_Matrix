import React, { useEffect, useState, useRef } from 'react';
import ScreenshotCapture from './ScreenshotCapture';

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
  
  const formatPrice = (price) => `$${price.toLocaleString()}`;

  const extractPriceRange = (colIndex, rowIndex) => {
    const r1PriceKey = `R1Price_${colIndex}_${rowIndex}`;
    const r2PriceKey = `R2Price_${colIndex}_${rowIndex}`;
    const r1Price = matrixData[0].attributes[r1PriceKey] || 0;
    const r2Price = matrixData[0].attributes[r2PriceKey] || 0;
    return `${formatPrice(r1Price)} - ${formatPrice(r2Price)}`;
  };

  const calculateTotalPrice = () => {
    let total = 0;
    const r1Total = Object.entries(clickedCells).reduce((acc, [colIndex, rowIndex]) => {
      const r1PriceKey = `R1Price_${parseInt(colIndex) + 1}_${parseInt(rowIndex) + 1}`;
      const r1Price = matrixData[0].attributes[r1PriceKey] || 0;
      return acc + r1Price;
    }, 0);
    const r2Total = Object.entries(clickedCells).reduce((acc, [colIndex, rowIndex]) => {
      const r2PriceKey = `R2Price_${parseInt(colIndex) + 1}_${parseInt(rowIndex) + 1}`;
      const r2Price = matrixData[0].attributes[r2PriceKey] || 0;
      return acc + r2Price;
    }, 0);
  
    return `${formatPrice(r1Total)} - ${formatPrice(r2Total)}`;
  };
  
  

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
  const calculateBoxColor = () => {
    const r1Percentage = (r1Total / totalPriceFromAPI) * 100;
    const r2Percentage = (r2Total / totalPriceFromAPI) * 100;
  
    if (r1Percentage >= 75 && r1Percentage <= 95 && r2Percentage <= 74) {
      return 'linear-gradient(to bottom,  green,yellow)';
    }
  
    if (r1Percentage <= 74 && r2Percentage >= 75 && r2Percentage <= 95) {
      return 'linear-gradient(to bottom, yellow,green)';
    }
  
    if (r1Percentage >= 75 && r1Percentage <= 95 && r2Percentage >= 96) {
      return 'linear-gradient(to bottom, red,yellow)';
    }
  
    if (r1Percentage >= 96 && r2Percentage <= 74) {
      return 'linear-gradient(to bottom, green, red)';
    }
  
    if (r1Percentage <= 74 && r2Percentage <= 74) {
      return 'linear-gradient(to bottom, green, green)';
    }
  
    if (r1Percentage >= 96 && r2Percentage >= 96) {
      return 'linear-gradient(to bottom, red, red)';
    }
  
    if (r1Percentage >= 75 && r1Percentage <= 95 && r2Percentage >= 75 && r2Percentage <= 95) {
      return 'linear-gradient(to bottom, yellow, yellow)';
    }
  
    if (r1Percentage <= 74 && r2Percentage >= 96) {
      return 'linear-gradient(to bottom, red,green)';
    }
  
    if (r1Percentage <= 74 && r2Percentage >= 75 && r2Percentage <= 95) {
      return 'linear-gradient(to bottom,  yellow,green)';
    }
  };
  
  

  const numberOfColumns = getNumberOfColumns();
  const numberOfRows = getNumberOfRows();

  

  const totalRange = calculateTotalPrice();
  const r1Total = parseFloat(totalRange.split(' - ')[0].replace(/[$,]/g, ''));
  const r2Total = parseFloat(totalRange.split(' - ')[1].replace(/[$,]/g, ''));
  const boxTop = Math.min(((totalPriceFromAPI - r2Total) / totalPriceFromAPI) * 60, 60);
  const boxHeight = Math.min(((r2Total - r1Total) / totalPriceFromAPI) * 60, 60);

  

  return (
    <ScreenshotCapture>
      <div className="container">
      {matrixTitle && <h1 className="matrix-title">{matrixTitle}</h1>}
      <div className="total-price">
        <p>Total Budget: {formatPrice(totalPriceFromAPI)}</p>
      </div>
      {/* Display Total Price Range at the top */}
      <div className="total-range">
        <p>Estimated Price Range: {totalRange}</p>
      </div>
      <div className="content-container">
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
                      <p>Price Range: {extractPriceRange(colIndex + 1, rowIndex + 1)}</p>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Vertical line */}
        <div className="vertical-line-container">
          <div className="line-text line-top">{formatPrice(totalPriceFromAPI)}</div>
          <div className="vertical-line" style={{ height: '100%' }}>
            <div
              className="line-box"
              style={{
                top: `${boxTop}%`,
                height: `${boxHeight}%`,
                background: calculateBoxColor(),
              }}
            ></div>
          </div>
          <div className="line-text line-bottom">$0</div>
          <div className="line-text line-total">Total Price: ${totalPriceFromAPI}</div>
        </div>
      </div>
      {/* Flex container for "Total Budget" and "Total Estimated Price" */}
      <div className="total-container"></div>
    
      
      <style jsx>{`
        /* Styles for the entire component */
        .container {
          font-family: 'Arial', sans-serif;
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background-color: #f9f7f0;
          position: relative;
        }
        /* Rest of the styles */
        .matrix-title {
          font-size: 50px;
          margin-bottom: 20px;
          color: black;
          text-align: left;
        }
        .content-container {
          display: flex;
          position: relative;
          margin-right: 50px;
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
          width: 90%; /* Reduce the width of the table */
        }
        th,
        td {
          border: 5px solid #ddd;
          border-color: #0a32f4;
          padding: 5px; /* Reduce the padding for cells */
          text-align: left;
          white-space: normal;
          word-break: break-word;
          overflow-wrap: break-word;
          font-family: 'Arial', sans-serif;
          font-weight: bold;
          color: black;
        }
        th {
          background-color: #245a99;
          color: white;
        }
        img {
          max-width: 40px; /* Adjust image size */
          max-height: 40px; /* Adjust image size */
        }
        .rotate {
          white-space: nowrap;
        }
        .rotate div {
          transform: rotate(0 deg);
          transform-origin: left top;
          width: 60px; /* Adjust cell width */
          font-size: 12px; /* Adjust font size */
          font-family: 'Arial', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60px; /* Adjust the height to center the text vertically */
        }
        .image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
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
       
        /* Style for the vertical line */
        .vertical-line-container {
          position: absolute;
          top: 0;
          right: 20px; /* Adjust this value to move the line further right */
          width: 40px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }
        .vertical-line {
          position: relative; /* Change to relative position */
          width: 2px;
          background-color: black;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }
        .line-box {
          position: absolute;
          left: -6px; /* Adjust the position to center the thicker line */
          width: 20px; /* Increase the width to make the line thicker */
          height: 12px; /* Set the height of the line box */
          top: calc(50% - 6px); /* Center the line box vertically on the line */
          background-color: red; /* Change this color */
          opacity: 0.8;
          transition: top 0.3s, height 0.3s;
          left: calc(50% - 6px); /* Horizontally center the line box */
        }
        .range-text {
          font-size: 14px;
          font-family: 'Arial', sans-serif;
          color: black;
          text-align: center;
          margin: 5px;
          font-weight: bold;
        }
        .line-bottom,
        .line-top {
          font-size: 14px;
          font-family: 'Arial', sans-serif;
          color: black;
          font-weight: bold;
        }
        .total-range {
          font-size: 25px;
          font-family: 'Arial', sans-serif;
          color: black;
          text-align: center;
          margin: 5px;
          font-weight: bold;
        }
        .total-price {
          
          font-weight: bold;
          font-size: 25px;
          font-family: 'Arial', sans-serif;
          color: black;
          margin: 5px
          
      `}</style>
    </div>
    </ScreenshotCapture>
  );
};

export default Matrix;
