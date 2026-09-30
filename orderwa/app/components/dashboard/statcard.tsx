
export default function StatCard({title, value, change} : {
    title: string; value: string; change: string;
})  {
    return (
         <div className="stat-card">
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
            <p className="stat-change">{change}</p>
         </div>
    );
}