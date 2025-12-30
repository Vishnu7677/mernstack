const ManagerInventory = () => (
    <div className="twgold_manager_card">
      <h3>Strong Room Inventory</h3>
  
      <div className="twgold_manager_inventory_stats">
        <div className="inv_stat_item">
          <span>Total Packets:</span> <b>245</b>
        </div>
        <div className="inv_stat_item">
          <span>Gross Weight:</span> <b>18.45 kg</b>
        </div>
        <div className="inv_stat_item">
          <span>Last Audit:</span> <b>28 Dec 2025</b>
        </div>
      </div>
  
      <button className="twgold_manager_button_secondary">
        Generate Audit Report
      </button>
    </div>
  );
  
  export default ManagerInventory;
  