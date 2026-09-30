import Link from  "next/link";
import Sidebar from "../components/dashboard/sidebar";
import "./dashboard.css";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="shell">

            <Sidebar />

            <div className="main">  
                {children}
            </div>
            
        </div>
    );
}