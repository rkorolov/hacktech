// TODO: UPDATE THE TEXT TO REFLECT THE APP MARKETING

import React from 'react';
// import { AuthButton } from '@/components/auth/AuthButton';
// import { Button } from '../ui/button';
// import { ThreeJsScene } from './three-js-scene';
// import Link from 'next/link';
// import { motion } from 'framer-motion';

export function HeroContent() {
  return (
    <html>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
      <div style={{fontFamily: 'Poppins'}}>
        <div style={{margin: 9, display: "flex", flexDirection: "column", width: "100%", justifyContent: "center", alignItems: "center"}}>
          
          <p style={{fontSize: "80px", marginTop: "200px", fontWeight:"900"}}>
            <span style={{color:"#001F54"}}>Lumi</span>
            <span style={{color:"#6B9AC4"}}>ViTA</span></p>

          <p style={{fontSize: "40px", color: "#034078", fontWeight:"500" }}>Bringing Light Into Your Life</p>
        </div>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexGrow: 1, textAlign:"center", alignItems: "center",  }}>
              <p style={{ margin: 0, border: "2px solid #034078", backgroundColor: "#034078", color: "#FFFFFF", borderRadius: "10px", padding: "5px", paddingLeft: "20px", paddingRight: "20px"}}>Get Started</p>
              <p style={{ margin: 0 }}>Learn More <span style={{}}>→</span></p>
        </div>
      </div>
    </html>

  );
} 