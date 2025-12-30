import { useEffect, useState } from 'react';
import { fetchInventorySummary } from '../../TWGLogin/axiosConfig';
import Inventory from '../pages/Inventory';

const InventoryContainer = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchInventorySummary()
      .then(res => setSummary(res.data.data));
  }, []);

  return <Inventory summary={summary} />;
};

export default InventoryContainer;
