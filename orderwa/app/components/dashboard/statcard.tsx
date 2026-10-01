
export default function StatCard({title, value, change} : {
    title: string; value: number; change: string;
})  {
    return (
         <div className="stat-card">
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value.toLocaleString() }</p>
            <p className="stat-change">{change}</p>
         </div>
    );
}