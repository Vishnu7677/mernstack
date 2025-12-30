import { useState } from 'react';
import { getCustomerByCustomerId } from '../../TWGLogin/axiosConfig';
import Customers from '../pages/Customers';

const CustomersContainer = () => {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState([]);

  const handleSearch = async () => {
    const res = await getCustomerByCustomerId(query);
    setCustomers(res.data.data ? [res.data.data] : []);
  };

  return (
    <Customers
      query={query}
      setQuery={setQuery}
      customers={customers}
      onSearch={handleSearch}
    />
  );
};

export default CustomersContainer;
