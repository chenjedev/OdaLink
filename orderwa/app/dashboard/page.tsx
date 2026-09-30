"use client";

import StatCard from "../components/dashboard/statcard";
export default function DashboardPage() {
    return(
        <div>
             <h1>Welcome (user ) </h1>
             
             <div className="stats-grid">
                 <StatCard title="Orders today" value="24" change="+8%" />
                 <StatCard title="Pending" value="6" change="-3%" />
                 <StatCard title="Revenue" value="Tsh 480,000" change="+12%" />
                 <StatCard title="Customers" value="2133" change="+31% vs last month" />
             </div>

             
        </div>
    );
}

