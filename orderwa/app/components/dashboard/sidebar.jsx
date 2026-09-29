"use client";

import Link from  "next/link"
import { usePathname }  from "next/navigation";

function Sidebar(){
    const pathname = usePathname();
    return(
        <div className="dash-nav">
            <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""} >Dashboard</Link>
            <Link href="/dashboard/products" className={pathname === "/dashboard/products" ? "active" : ""}>Products</Link>
            <Link href="/dashboard/orders">Orders</Link>
            <Link href="/dashboard/overview">Overview</Link>
        </div>
    );
}

export default Sidebar;