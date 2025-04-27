// TODO: UPDATE THE TEXT TO REFLECT THE APP MARKETING

import React from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { Button } from '../ui/button';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // choose the weights you want
});
// import { ThreeJsScene } from './three-js-scene';
// import Link from 'next/link';
// import { motion } from 'framer-motion';

export function HeroContent() {
  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
      {/* <div style={{fontFamily:"Poppins", display:"flex"}}> */}
      <div style={{fontFamily:"Poppins", display:"flex",
    justifyContent: "center", 
    alignItems: "center", 
    height: "85vh", // Full viewport height
    // width:"200vh",
    gap: "20px", 
    color: "#001F54", 
    fontSize: "18px",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Semi-transparent black background
    padding: "20px", 
    borderRadius: "5px",
    marginTop: "20px"}}>
  {/* // }}></div> */}
  
        <div style={{margin: 9, display: "flex", flexDirection: "column", width: "100%", justifyContent: "center", alignItems: "center", textAlign: "center", alignContent:"center" }}>
          
          <p style={{fontSize: "100px", marginTop: "90px", fontWeight: "900"}}>
            <span style={{color:"#001F54"}}>Lumi</span>
            <span style={{color:"#6B9AC4"}}>ViTA</span></p>

          <p style={{fontSize: "33px", color: "#034078", fontWeight: "500"}}>Bringing Light Into Your Life</p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center", fontSize: "18px",  textAlign: "center" }}>
              {/* <p style={{ border: "2px solid #034078", backgroundColor: "#034078", color: "#FFFFFF", borderRadius: "10px", padding: "5px 20px"}}>Get Started</p> */}
              <AuthButton trigger={<Button  size="lg">Get Started</Button>} dashboardTrigger={<Button size="lg">Dashboard</Button>} />
              <p >Learn More <span style={{}}>→</span></p>
        </div>
        </div>
      </div>
    </div>

  );
} 