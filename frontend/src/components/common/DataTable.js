import React from 'react';
import { Table, Spinner } from 'react-bootstrap';

const DataTable = ({ columns, data, loading }) => {
  if (loading) return (
    <div className="text-center py-4">
      <Spinner animation="border" variant="success" />
    </div>
  );

  return (
    <Table responsive hover className="align-middle">
      <thead className="table-light">
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} className="text-center text-muted py-4">No records found</td></tr>
        ) : (
          data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default DataTable;
