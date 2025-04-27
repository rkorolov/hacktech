// TODO: THIS IS THE LANDING PAGE THAT THE USER WILL ALWAYS FIRST SEE.
// Make sure that the marketing text in the HeroContent and FeaturesSection are always edited to reflect the app marketing

"use client"
import Image from "next/image";
import { AuthButton } from "@/components/auth/AuthButton";
import { ThreeJsScene } from "@/components/landing/three-js-scene";
import { HeroContent } from "@/components/landing/HeroContent";
import { Header } from "@/components/landing/Header";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    console.log("CONVEX URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="max-w-6xl mx-auto relative px-4">
        <p><Header /></p>
        <p><HeroContent /></p>
        <p><FeaturesSection /> </p>
      </div>
      <p><Footer /></p>
    </motion.div>
  );
}
