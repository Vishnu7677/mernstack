const Reports = ({ onGenerate }) => (
    <div className="twgold_manager_card">
      <h3>Operational Reports</h3>
  
      <div className="twgold_manager_button_group">
        <button onClick={() => onGenerate('closing-stock')} className="twgold_manager_report_btn">
          Closing Stock
        </button>
        <button onClick={() => onGenerate('daily-collection')} className="twgold_manager_report_btn">
          Daily Collection
        </button>
        <button onClick={() => onGenerate('overdue')} className="twgold_manager_report_btn">
          Overdue / NPA
        </button>
        <button onClick={() => onGenerate('employee')} className="twgold_manager_report_btn">
          Employee Performance
        </button>
      </div>
    </div>
  );
  
  export default Reports;
  