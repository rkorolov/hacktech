// TODO: THIS IS THE LANDING PAGE THAT THE USER WILL ALWAYS FIRST SEE.
// Make sure that the marketing text in the HeroContent and FeaturesSection are always edited to reflect the app marketing

"use client"
// import Image from "next/image";
// import { AuthButton } from "@/components/auth/AuthButton";
// import { ThreeJsScene } from "@/components/landing/three-js-scene";
import { HeroContent } from "@/components/landing/HeroContent";
import { Header } from "@/components/landing/Header";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    console.log("✅ Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
  }, []);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="relative w-full border-b-2 border-gray-[#D9D9D9]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 
                    bg-[url('/lumivita_designs/background.png')] 
                    bg-center bg-cover bg-no-repeat"
        />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Header />
          <HeroContent />
        </div>
      </div>

      <div className="relative w-full border-b-2 border-gray-[#D9D9D9]">
        <div><FeaturesSection /></div>
      </div>
      
      <div><Footer /></div>
    </motion.div>
  );
}
