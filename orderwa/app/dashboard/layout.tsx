import AuthGuard from "../components/AuthGuard";
import "./dashboard.css";
import "./products/products.css";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <AuthGuard>
        <div className="shell">

           

            <div className="main">  
                {children}
            </div>
            
        </div>
     </AuthGuard>
    );
}
