// /admin/src/components/common/Table.js
import React from 'react';
import './Table.css';

const Table = ({ columns, data, actions, onSort, sortConfig = {} }) => {
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.accessor);
    }
  };

  const getSortIndicator = (column) => {
    if (!column.sortable || !sortConfig || sortConfig.key !== column.accessor) {
      return null;
    }
    
    return (
      <span className={`sort-indicator ${sortConfig.direction}`}>
        {sortConfig.direction === 'asc' ? '⬆' : '⬇'}
      </span>
    );
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                className={column.sortable ? 'sortable-column' : ''}
                onClick={() => handleSort(column)}
              >
                {column.header}
                {getSortIndicator(column)}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render 
                    ? column.render(row[column.accessor], row) 
                    : row[column.accessor]}
                </td>
              ))}
              {actions && (
                <td className="action-cell">
                  {actions.map((action, actionIndex) => (
                    <button 
                      key={actionIndex} 
                      className={`action-button ${action.type}`}
                      onClick={() => action.onClick(row)}
                      title={action.label}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;