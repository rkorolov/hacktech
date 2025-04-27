// TODO: UPDATE THE TEXT TO REFLECT THE APP MARKETING
import React, { useEffect, useState } from "react";
import { CloudIcon, LockIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "../ui/button";
import { AuthButton } from "../auth/AuthButton";
import ChatbotPopup from "./chatbotPopup";

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolls smoothly to the top of the page
};

const features = [
  {
    name: "Push to deploy",
    description:
      "Commodo nec sagittis tortor mauris sed. Turpis tortor quis scelerisque diam id accumsan nullam tempus. Pulvinar etiam lacus volutpat eu. Phasellus praesent ligula sit faucibus.",
    href: "https://crack.diy",
    icon: CloudIcon,
  },
  {
    name: "SSL certificates",
    description:
      "Pellentesque enim a commodo malesuada turpis eleifend risus. Facilisis donec placerat sapien consequat tempor fermentum nibh.",
    href: "https://crack.diy",
    icon: LockIcon,
  },
  {
    name: "Simple queues",
    description:
      "Pellentesque sit elit congue ante nec amet. Dolor aenean curabitur viverra suspendisse iaculis eget. Nec mollis placerat ultricies euismod ut condimentum.",
    href: "https://crack.diy",
    icon: RefreshCcwIcon,
  },
];

export function FeaturesSection() {
  return (
    
      <div >
        {/* <img 
          src="../../../../lumivitaDesigns/Lumi.png" 
          alt="small image"
          style={{
            position: "fixed",  // Keep the image fixed while scrolling
            bottom: "20px",     // Adjust this value to set the distance from the bottom
            right: "20px",      // Adjust this value to set the distance from the right
            width: "50px",      // Set the size of the image
            height: "auto",     // Maintain aspect ratio
            zIndex: "9999",     // Ensure it stays on top of other elements
          }}
          onClick={scrollToTop}/> */}
        
        {/* <ChatbotPopup /> */}
          <div>
  {/* < AuthButton 
    trigger={<Button size="lg">Sign In</Button>} 
    dashboardTrigger={<Button size="lg">Dashboard</Button>} 
     /> */}
</div>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>

        <div style={{display: "flex", justifyContent: "space-evenly", paddingTop: "300px", marginRight:"20px"}}>
        <p id="aboutSection"></p>
        <div style={{display: "flex", paddingTop:"10px", justifyContent: "center", alignItems: "center" }}>
          <div>
              <img src="../../../../lumivitaDesigns/doctor.png" alt="image of doctor"
                style={{
                  width: "350px", // Set the size of the image
                  height: "auto", // Maintain aspect ratio
                  objectFit: "contain", // Ensure the image doesn't distort
                  display: "inline-block", // Keep the image inline with text
                  
              }}/>
          </div>

          <div style={{justifyContent: "center", alignItems: "center"}}>
            <img src="../../../../lumivitaDesigns/pills.png" alt="image of pills"
              style={{
                paddingTop:"300px",
                width: "350px", // Set the size of the image
                height: "auto", // Maintain aspect ratio
                objectFit: "contain", // Ensure the image doesn't distort
                display: "inline-block", // Keep the image inline with textx
            }}/>
          </div>
            </div>
          <div style={{fontFamily: "Poppins", margin: 0, fontSize: "25px", flexDirection: "column", marginRight:"0px", textAlign:"right", right: "-40px", position:"relative", paddingTop:"50px"}}>
            <p style={{fontWeight: "700", position:"relative", color: "#001F54", marginBottom: "15px"}}>About LumiViTA</p>
            <p style={{fontSize: "56px", fontWeight: "700", position:"relative", lineHeight: "1.05ho", color: "#001F54", marginBottom: "20px"}}>Clarity and vitality <br/> are the heart of <br /> better healthcare</p>
            <p style={{fontSize: "25px", color: "#001F54", wordWrap: "break-word", whiteSpace: "normal"}}>
                At LumiViTA, we empower patients <br />and 
                caregivers through seamless, technology<br />-driven solutionsthat prioritize connection,<br /> insight, and personalized
                care. By combining <br />the illuminating power of 
                innovation with a <br />deep commitment to life and
                wellness, LumiViTA is redefining the future of healthcare 
                — <br />making it clearer, smarter, and more human.</p>
            </div>
          </div>

        {/* Services */} 
        <div style={{display: "flex", justifyContent: "flex-start", fontFamily: "Poppins", margin: 0, fontSize: "15px", marginRight:"20px", textAlign:"left", left: "-5550px", paddingTop:"200px"}}>
        <div id="servicesSection"></div>
          <div>
            <p style={{fontSize:"25px", fontWeight:"600", paddingTop:"50px", color: "#001F54", marginBottom: "15px"}}>Our Services</p>

            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
            <div style={{position:"relative"}}>
              <p style={{fontSize:"40px", fontWeight:"600", color: "#001F54"}}>Appointment Management</p>
              <p style={{fontSize:"22px", color: "#001F54"}}>Caregivers can manage and create appointments</p>
            </div>

            <div>
            {/* <span style={{
                  position: "relative",
                  left: "100%",
                  transform: "translateX(-50%)",
                  display: "inline-block",
                  width: "0",
                  height: "0",
                  borderTop: "15px solid transparent",
                  borderBottom: "15px solid transparent",
                  borderLeft: "20px solid black",
                  top: "50%",
                }}></span> */}
            </div>
          </div>


          <hr style={{ width: "100%", margin: "20px 0", borderTop: "2px solid #001F54" }} />

          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
            <div style={{position:"relative"}}>
              <p style={{fontSize:"40px", fontWeight:"600", color: "#001F54"}}>Prescription Management</p>
              <p style={{fontSize:"22px", color: "#001F54"}}>Caregivers can prescribe appropriate medication</p>
            </div>
            <div>
              {/* <span style={{
                  position: "relative",
                  left: "100%",
                  transform: "translateX(-50%)",
                  display: "inline-block",
                  width: "0",
                  height: "0",
                  borderTop: "15px solid transparent",
                  borderBottom: "15px solid transparent",
                  borderLeft: "20px solid #001F54",
                  top: "50%",
                }}></span> */}
            </div>
          </div>   

          <hr style={{ width: "100%", margin: "20px 0", borderTop: "2px solid #001F54" }} />

          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
            <div style={{position:"relative"}}>
              <p style={{fontSize:"40px", fontWeight:"600", color: "#001F54"}}>Patient-Caregiver Matching</p>
              <p style={{fontSize:"22px", color: "#001F54"}}>Pairing patients to caregivers based on compatibility</p>
            </div>
            <div>
              {/* <span style={{
                  position: "relative",
                  left: "100%",
                  transform: "translateX(-50%)",
                  display: "inline-block",
                  width: "0",
                  height: "0",
                  borderTop: "15px solid transparent",
                  borderBottom: "15px solid transparent",
                  borderLeft: "20px solid #001F54",
                  top: "50%",
                }}></span> */}
            </div>
          </div>
          <hr style={{ width: "100%", margin: "20px 0", borderTop: "2px solid #001F54"}} />


        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
          <div style={{position:"relative"}}>
          <p style={{fontSize:"40px", fontWeight:"600", color: "#001F54"}}>24/7 Customer Service</p>
          <p style={{fontSize:"22px", color: "#001F54"}}>Lumi chatbot available 24/7</p>
          </div>
          <div>
            {/* <span style={{
                position: "relative",
                left: "100%",
                transform: "translateX(-50%)",
                display: "inline-block",
                width: "0",
                height: "0",
                borderTop: "15px solid transparent",
                borderBottom: "15px solid transparent",
                borderLeft: "20px solid #001F54",
                top: "50%",
              }}></span> */}
          </div>
          </div>
          </div>


          <div>
            
        <img src="../../../../lumivitaDesigns/bear.png" alt="image of bear"
                style={{
                  width: "450px", 
                  height: "auto",
                  objectFit: "contain",
                  display: "inline-block",
                  position:"relative",
                  left:"130px",
                  top: "70px"
              }}/>
        </div>
        </div>
        

        {/* Creators */}
    <div style={{
      display: "flex", 
      justifyContent: "flex-start", 
      fontFamily: "Poppins", 
      fontSize: "15px", 
      flexDirection: "column", 
      paddingTop: "200px",  
      textAlign: "left", 
      width: "100%",
    }}>
  
  <div id="creatorsSection" style={{paddingTop:"50px"}}></div>
    <p style={{fontSize: "25px", fontWeight: "600", color: "#001F54"}}>The Creators</p>
    <p style={{fontSize: "56px", fontWeight: "600", color: "#001F54", lineHeight: "1.2"}}>Four CSE TAs from the <br />University of Washington</p>
    <p style={{fontSize: "25px", marginTop: "10px"}}>
      The four of us originally met as teaching assistants for an introductory Java course at UW. <br />
      One of the assignments for the course was a patient prioritizing program that focused on <br />
      conditionals and user input. From that assignment, we came to realize assigning priority<br />
      scores was a lot more nuanced than we realized. We decided to come together to build <br />
      this application, and help those in need.
    </p>
  </div>
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "20px", paddingRight:"5px" }}>
  
    <img src="../../../../lumivitaDesigns/ruslana.png" alt="image of ruslana"
      style={{
        width: "290px",
        height: "auto",
        objectFit: "contain",
        display: "inline-block",
      }}
    />

    <img src="../../../../lumivitaDesigns/hanna.png" alt="image of hanna"
      style={{
        width: "290px",
        height: "auto",
        objectFit: "contain",
        display: "inline-block",
      }}
    />

    <img src="../../../../lumivitaDesigns/nicole.png" alt="image of nicole"
      style={{
        width: "290px",
        height: "auto",
        objectFit: "contain",
        display: "inline-block",
        
      }}  
      
    />
    
    <img src="../../../../lumivitaDesigns/alice.png" alt="image of alice"
      style={{
        width: "290px",
        height: "auto",
        objectFit: "contain",
        display: "inline-block",
      }}
    />

    </div>
      
    <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", textAlign: "center", gap:"130px" }}>

      <div>
        <p>Ruslana Korolov <br /> Backend/Frontend Engineer</p>
      </div>

      <div> 
        <p>Hanna Pan <br /> UI/UX Designer</p>
      </div>

      <div>
        <p >Nicole Ham <br /> Backend/Frontend Engineer</p>
      </div>

      <div>
        <p>Alice Zhu <br /> Backend/Frontend Engineer</p>
      </div>

    </div>

  </div>
  );

  
}
