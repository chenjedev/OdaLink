import StatCard from "../components/dashboard/statcard";
export default function DashboardPage() {
    return(
        <div>
             <h1>Welcome (user ) </h1>
             
             <div className="stats-grid">
                 <StatCard title="Orders today" value={24} change="+8% last month" />
                 <StatCard title="Pending" value={6} change="-3% last month" />
                 <StatCard title="Revenue" value={480000} change="+12% last month" />
                 <StatCard title="Customers" value={2133} change="+31% vs last month" />
             </div>

             
        </div>
    );
}

