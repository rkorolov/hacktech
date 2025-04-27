'use client'

export function Header() {
  return (
    <div style={{display:"flex"}}>
      <body style={{backgroundImage:"url(../../../../lumivita_designs/background.png)", backgroundRepeat: "no-repeat"}}></body>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
        
        <div style={{margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0px", marginTop: "25px" }}>

            
          <img src="../../../../lumivita_designs/logoAndName.png" alt="image of mascot"></img>
          <div style={{ display: "flex", gap: "20px", color:"#001F54", justifyContent: "center", flexGrow: 1, textAlign:"center", fontSize:"18px", alignItems:"center", marginLeft:"-80px" }}>
             <a href="#aboutSection" style={{
              textDecoration: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              textAlign: "center", 
              fontWeight: "600", 
              display: "inline-block",
              cursor: "pointer", 
              transition: "background-color 0.3s", 
            }}>
              About
            </a>
            <a href="#servicesSection" style={{
              textDecoration: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              textAlign: "center",
              fontWeight: "600",
              display: "inline-block",
              cursor: "pointer", 
              transition: "background-color 0.3s",
            }}>
              Services
            </a>
            <a href="#creatorsSection" style={{
              textDecoration: "none", 
              padding: "10px 20px", 
              borderRadius: "5px", 
              textAlign: "center",
              fontWeight: "600", 
              display: "inline-block", 
              cursor: "pointer", 
              transition: "background-color 0.3s", 
            }}>
              Who We Are
            </a>
          </div>
        </div>
    </div>
  )
}
