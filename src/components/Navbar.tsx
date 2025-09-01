"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Upload, BookOpen, FolderOpen, Settings, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const SearchIcon = dynamic(() => import("lucide-react").then(m => m.Search), {
    ssr: false,
});

// Navigation items with icons
const links = [
    { name: "Papers", href: "/mypapers", icon: Paperclip },
    { name: "Projects", href: "/projects", icon: FolderOpen },
    { name: "Compare", href: "/compare", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
];

// Navbar component
export default function Navbar() {

    const pathname = usePathname();

    // Fix HTML mounting and hydration issue
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);  // Ensure component is mounted before rendering

    return (
        <>
            {/* Nav bar content */}
            <nav className="fixed w-full z-10 bg-white/30 backdrop-blur-md border-b border-gray-200">
                <div className="w-full px-6 py-4 flex items-center justify-between">
                    <a href="/" className="text-3xl font-bold text-gray-700 pl-12 pr-12">Paprly</a>  {/* Logo/Home */}

                    {/* Global Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-4 text-gray-400" />
                            <Input
                                placeholder="Search papers, authors, keywords..."
                                className="pl-10 bg-card text-black w-full"
                            />
                        </div>
                    </div>

                    {/* Navigation links */}
                    <nav className="flex items-center space-x-1 ml-8 pr-12">
                        {links.map((item) => {
                            const Icon = item.icon;

                            // Fix mounting issue when active link is determined
                            const isActive = mounted && (pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href)));

                            return (
                                <Link key={item.name} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        className={[
                                            "flex items-center space-x-2 text-gray-700 font-semibold",
                                            !isActive && "bg-transparent hover:bg-gray-200",
                                            isActive && "bg-gray-200",
                                        ].join(" ")}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden md:block">{item.name}</span>
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Authentication links */}
                    <div className="flex items-center gap-4 ml-8 pr-12">
                        <a href="/login" className="px-6 py-2 text-base rounded-md shadow-md bg-gray-700 text-white font-semibold hover:bg-gray-600 transform transition-transform duration-200 hover:scale-105">Login</a> {/* Login link */}
                        <a href="/signup" className="px-6 py-2 text-base rounded-md shadow-md bg-blue-400 text-white font-semibold hover:bg-blue-300 transform transition-transform duration-200 hover:scale-105">Sign Up</a> {/* Sign Up link */}
                    </div>

                </div>
            </nav>
        </>
    );

}