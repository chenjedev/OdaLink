"use client";

import Link from  "next/link"
import { usePathname }  from "next/navigation";

function Sidebar(){
    const pathname = usePathname();
    return(
        <div className="dash-nav">
            <h1>OdaLink</h1>

            <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""} >Dashboard</Link>
            <Link href="/dashboard/products" className={pathname === "/dashboard/products" ? "active" : ""}>Products</Link>
            <Link href="/dashboard/orders" className={pathname === "/dashboard/orders" ? "active" : ""}>Orders</Link>
        
        </div>
    );
}

export default Sidebar;