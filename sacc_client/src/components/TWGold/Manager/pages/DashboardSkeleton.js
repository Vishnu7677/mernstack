import Skeleton from '../../common/Skeleton';

const DashboardSkeleton = () => (
  <>
    <div className="twgold_manager_cards_grid">
      {[1,2,3,4].map(i => (
        <div key={i} className="twgold_manager_card kpi">
          <Skeleton height={16} width="60%" />
          <Skeleton height={36} width="40%" />
        </div>
      ))}
    </div>

    <div className="twgold_manager_card">
      <Skeleton height={22} width="40%" />
      <Skeleton height={160} />
    </div>

    <div className="twgold_manager_card">
      <Skeleton height={22} width="40%" />
      <div className="sla_grid">
        {[1,2,3].map(i => (
          <Skeleton key={i} height={90} />
        ))}
      </div>
    </div>
  </>
);

export default DashboardSkeleton;
