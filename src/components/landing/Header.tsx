'use client'

import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <div style={{display:"flex"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
        {/* <Link href="https://www.crack.diy" className="text-2xl font-serif font-extrabold"> */}  
        {/* </Link> */}
        <body style={{backgroundImage:"url(../../../../lumivita_designs/background.png)", backgroundRepeat: "no-repeat"}}></body>
        <div style={{margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0px", marginTop: "25px" }}>

            
          <img src="../../../../lumivita_designs/logoAndName.png" alt="image of mascot"></img>
          <div style={{ display: "flex", gap: "20px", color:"#001F54", justifyContent: "center", flexGrow: 1, textAlign:"center", fontSize:"18px", alignItems:"center", marginLeft:"-50px" }}>
            <p style={{ margin: 0 }}>About</p>
            <p style={{ margin: 0 }}>Services</p>
            <p style={{ margin: 0 }}>Who We Are</p>
          </div>
        </div>
    </div>
    // {/* <AuthButton trigger={<Button size="lg">Get Started</Button>} dashboardTrigger={<Button size="lg">Dashboard</Button>} /> */}
  )
}
