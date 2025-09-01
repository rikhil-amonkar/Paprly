"use client";
import { METHODS } from "http";
import { use, useEffect, useState } from "react";

// Already made components (imports for frontend)
import { Button } from "@/components/ui/button";
import { Typewriter } from "react-simple-typewriter";
import { Container } from "lucide-react";

// **** Routing Componenets ****

// Default home function to run frontend and routes
export default function Home() {

  // Get started button
  const [showGTB, setShowGTB] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowGTB(true), 400);
    return () => clearTimeout(t);  // Cleanup timeout on unmount
  }, []);  // Empty dependency array to run only once on mount

  useEffect(() => {
    const t = setTimeout(() => setShowDesc(true), 400);
    return () => clearTimeout(t);  // Cleanup timeout on unmount
  }, []);  // Empty dependency array to run only once on mount

  // **** Front End Componenets ****

  // Return frontend HTML
  return (

    // Main page layout
    <main className="mx-auto max-w-6xl px-6 pt-36 md:pt-40 pb-16">

      <header className="space-y-6">
        {/* shared measure: both h1 and p hang from the same left edge */}
        <div>
          <h1 className="text-7xl font-semibold leading-tight whitespace-pre-line text-gray-700 h-[2.5em] overflow-hidden">
            <Typewriter
              words={[
                "Never start from\nscratch again.",
                "The AI that reads\nfor you.",
                "Why read?\nJust know.",
                "The end of wasted\nresearch time."
              ]}
              loop={0}
              cursor
              cursorStyle="_"
              typeSpeed={60}
              deleteSpeed={30}
              delaySpeed={8000}
            />
          </h1>

          <p
            className={[
              "mt-4 text-2xl text-gray-400 pb-8",
              "transition-all duration-1000",
              showDesc ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            ].join(" ")}
          >
            Transform your research workflow with AI-powered paper summaries,
            personalized notes, and seamless organization. Focus on what matters
            most – your ideas and insights.
          </p>
        </div>
      </header>

      {/* button sits under same measure too to be aligned */}
      <div>
        <a href="/mypapers" className="inline-block">
          <Button
            className={[
              "px-20 py-5 text-base rounded-md shadow-md",
              "bg-blue-400 text-white font-semibold hover:bg-blue-300",
              "transition-transform duration-200 hover:scale-105",
            ].join(" ")}
          >
            Get Started
          </Button>
        </a>
      </div>

    </main>
  );
}



