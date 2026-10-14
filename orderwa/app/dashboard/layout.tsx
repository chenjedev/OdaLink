import AuthGuard from "../components/AuthGuard";
import Sidebar from "../components/dashboard/sidebar";
import "./dashboard.css";
import "./products/products.css";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <AuthGuard>
        <div className="shell">

            <Sidebar />

            <div className="main">  
                {children}
            </div>
            
        </div>
     </AuthGuard>
    );
}
