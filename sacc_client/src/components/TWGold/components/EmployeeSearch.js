import React, { useEffect, useState } from 'react';
import { searchEmployees } from '../TWGLogin/axiosConfig';
import useDebounce from '../hooks/useDebounce';
import './EmployeeSearch.css';

const EmployeeSearch = ({
  selectedEmployees = [],
  onToggleEmployee,
  role = 'employee',
  branch
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, [debouncedQuery]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await searchEmployees({
        q: debouncedQuery,
        role,
        branch,
        limit: 20
      });

      setResults(res.data?.data || []);
    } catch (err) {
      console.error('Employee search failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee_search_wrapper">
      <input
        type="text"
        placeholder="Search employees by name / ID"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="employee_search_input"
      />

      {loading && <div className="employee_search_loading">Searching…</div>}

      <div className="employee_search_results">
        {results.map(emp => (
          <label key={emp._id} className="employee_search_item">
            <input
              type="checkbox"
              checked={selectedEmployees.includes(emp._id)}
              onChange={() => onToggleEmployee(emp._id)}
            />
            <span>
              {emp.name}
              <small>
                {emp.employeeId} • {emp.role}
              </small>
            </span>
          </label>
        ))}

        {!loading && results.length === 0 && (
          <div className="employee_search_empty">
            No employees found
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSearch;
