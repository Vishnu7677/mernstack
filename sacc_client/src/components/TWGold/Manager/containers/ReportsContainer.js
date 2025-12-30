import { getManagementData } from '../../TWGLogin/axiosConfig';
import Reports from '../pages/Reports';

const ReportsContainer = () => {
  const handleGenerate = async (type) => {
    await getManagementData(); // backend decides report logic
  };

  return <Reports onGenerate={handleGenerate} />;
};

export default ReportsContainer;
