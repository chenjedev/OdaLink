"use client";

import StoreLink from "../components/dashboard/StoreLink";
import AddProduct from "../components/dashboard/AddProduct";
import ShopSettings from "../components/dashboard/ShopSettings";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ClipboardList,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Search,
  ShoppingBag,
  Store,
  Settings as SettingsIcon,
  Share2,
  Copy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";