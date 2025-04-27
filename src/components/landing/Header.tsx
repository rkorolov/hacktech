'use client'

import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
        {/* <Link href="https://www.crack.diy" className="text-2xl font-serif font-extrabold"> */}  
        {/* </Link> */}

        <div style={{margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 25px", marginTop: "25px" }}>
          <p style={{ margin: 0, position: "absolute", left: "-50px", fontSize:"18px"}}>
            <span style={{color:"#001F54"}}>Lumi</span>
            <span style={{color:"6B9AC4"}}>ViTA</span></p>
          <div style={{ display: "flex", gap: "20px", color:"#001F54", justifyContent: "center", flexGrow: 1, textAlign:"center", fontSize:"18px" }}>
            <p style={{ margin: 0 }}>About</p>
            <p style={{ margin: 0 }}>Services</p>
            <p style={{ margin: 0 }}>Who We Are</p>
          </div>
        </div>
    </div>
  )
}
