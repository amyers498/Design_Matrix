import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const MatrixList = () => {
  const [matrixData, setMatrixData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filteredMatrixData, setFilteredMatrixData] = useState([]);

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL);
      const data = await response.json();
      console.log(data); // Log the fetched data
      if (data.data && data.data.length > 0) {
        setMatrixData(data.data);
        setFilteredMatrixData(data.data);
      }
    } catch (error) {
      console.error('Error fetching matrix data:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filteredData = matrixData.filter((matrix) =>
      matrix.attributes.Title_Matrix.toLowerCase().includes(query.toLowerCase())
    );
    applyDateFilter(filteredData);
  };

  const handleDateFilter = (date) => {
    setFilterDate(date);
    applyDateFilter(matrixData);
  };

  const applyDateFilter = (data) => {
    const filteredData = data.filter((matrix) => {
      if (!filterDate) return true;

      const createdAtDate = new Date(matrix.attributes.createdAt).toDateString();
      return createdAtDate === new Date(filterDate).toDateString();
    });
    setFilteredMatrixData(filteredData);
  };

  return (
    <div className="matrix-list">
      <h1 className="matrix-list-title">Matrix List</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for matrix..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className="filter-section">
        <label htmlFor="filterDate">Filter by Date:</label>
        <input
          type="date"
          id="filterDate"
          value={filterDate}
          onChange={(e) => handleDateFilter(e.target.value)}
        />
      </div>
      <ul>
      {filteredMatrixData.map((matrix) => (
  <li key={matrix.id} className="matrix-item">
    <Link href={`/matrix/${encodeURIComponent(matrix.attributes.Title_Matrix)}`}>
      <span className="matrix-link">{matrix.attributes.Title_Matrix}</span>
    </Link>
    <p className="created-at">Created At: {new Date(matrix.attributes.createdAt).toLocaleDateString()}</p>
  </li>
))}

      </ul>
      <style jsx>{`
        .matrix-list {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .matrix-list-title {
          font-size: 28px;
          margin-bottom: 20px;
        }

        .search-bar {
          margin-bottom: 20px;
        }

        .search-bar input {
          width: 100%;
          padding: 10px;
          font-size: 16px;
        }

        .filter-section {
          margin-bottom: 20px;
        }

        .filter-section label {
          font-size: 16px;
          margin-right: 10px;
        }

        .filter-section input {
          padding: 6px;
          font-size: 16px;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        .matrix-item {
          margin-bottom: 20px;
          border: 1px solid #ddd;
          padding: 10px;
        }

        .matrix-link {
          text-decoration: none;
          color: #245a99;
          font-weight: bold;
          cursor: pointer;
        }

        .matrix-link:hover {
          text-decoration: underline;
        }

        .created-at {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default MatrixList;
