// TODO: UPDATE THE TEXT TO REFLECT THE APP MARKETING

import React from 'react';
import { AuthButton } from '@/components/auth/AuthButton';
import { Button } from '../ui/button';
import { Poppins } from 'next/font/google';
import ChatbotPopup from './chatbotPopup';


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
      <div style={{
        fontFamily:"Poppins", 
        display:"flex",
        justifyContent: "center", 
        alignItems: "center", 
        height: "85vh", // Full viewport height
        width:"100%",
        gap: "20px", 
        color: "#001F54", 
        fontSize: "18px",
        backgroundColor: "rgba(254, 252, 251, 0.5)", 
        padding: "20px", 
        borderRadius: "5px",
        marginTop: "5px",
        border: "2px solid #5DB7DE"}}>

  
        <div style={{margin: 9, display: "flex", flexDirection: "column", width: "100%", justifyContent: "center", alignItems: "center", textAlign: "center", alignContent:"center" }}>
          
          <p style={{fontSize: "100px", marginTop: "70px", fontWeight: "900"}}>
            <span style={{color:"#001F54"}}>Lumi</span>
            <span style={{color:"#21A3DB"}}>ViTA</span></p>

          <p style={{fontSize: "30px", color: "#034078", fontWeight: "500", marginTop: "-20px"}}>Bringing Light Into Your Life</p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center", fontSize: "18px",  textAlign: "center", paddingTop: "20px" }}>
              <AuthButton trigger={<Button  size="lg">Get Started</Button>} dashboardTrigger={<Button size="lg">Dashboard</Button>} />
              <a href="#servicesSection">Learn More <span>→</span></a>
        </div>
        </div>
      </div>
      <ChatbotPopup />
    </div>

  );
} 
// export function HeroContent() {
//   return (
//     <div style={{ position: "relative" }}> {/* 👈 ADD THIS wrapper */}
//   <div style={{
//     fontFamily:"Poppins", 
//     display:"flex",
//     justifyContent: "center", 
//     alignItems: "center", 
//     height: "85vh",
//     width:"100%",
//     gap: "20px", 
//     color: "#001F54", 
//     fontSize: "18px",
//     padding: "20px", 
//     borderRadius: "5px",
//     marginTop: "5px",
//     border: "2px solid #5DB7DE"
//   }}>
//     <div style={{
//       margin: 9, 
//       display: "flex", 
//       flexDirection: "column", 
//       width: "100%", 
//       justifyContent: "center", 
//       alignItems: "center", 
//       textAlign: "center", 
//       alignContent:"center" 
//     }}>
      
//       <p style={{fontSize: "100px", marginTop: "70px", fontWeight: "900"}}>
//         <span style={{color:"#001F54"}}>Lumi</span>
//         <span style={{color:"#21A3DB"}}>ViTA</span>
//       </p>

//       <p style={{fontSize: "30px", color: "#034078", fontWeight: "500", marginTop: "-20px"}}>
//         Bringing Light Into Your Life
//       </p>

//       <div style={{ 
//         display: "flex", 
//         gap: "20px", 
//         justifyContent: "center", 
//         alignItems: "center", 
//         fontSize: "18px",  
//         textAlign: "center", 
//         paddingTop: "20px" 
//       }}>
//         <AuthButton 
//           trigger={<Button size="lg">Get Started</Button>} 
//           dashboardTrigger={<Button size="lg">Dashboard</Button>} 
//         />
//         <a href="#servicesSection">Learn More <span>→</span></a>
//       </div>
//     </div>
//   </div>

//   {/* ChatbotPopup placed INSIDE the wrapper */}
//   <ChatbotPopup />
// </div>


//   );
// } 