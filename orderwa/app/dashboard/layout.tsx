import Link from  "next/link";
import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";
import "./dashboard.css";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="shell">
            <Sidebar />
            <div className="main">
                <Topbar />
                {children}
            </div>
        </div>
    );
}