// TODO: UPDATE THE TEXT TO REFLECT THE APP MARKETING
import React, { useEffect } from "react";
import { CloudIcon, LockIcon, RefreshCcwIcon } from "lucide-react";

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
      <div>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>

        {/* About */} 
        <div style={{display: "flex", justifyContent:"flex-end", fontFamily: "Poppins", margin: 0, fontSize: "25px", flexDirection: "column", marginRight:"-50px", textAlign:"right", right: "-400px", paddingTop: "800px"}}>
          <p style={{fontWeight: "700", }}>About LumiViTA</p>
          <p style={{fontSize: "56px", fontWeight: "700"}}>Clarity and vitality are <br />the heart of better <br />healthcare</p>
          <p style={{fontSize: "25px"}}>At LumiViTA, we empower patients and caregivers<br />
            through seamless, technology-driven solutions <br />
              that prioritize connection, insight, and personalized <br />
              care. By combining the illuminating power of <br />
              innovation with a deep commitment to life and <br />
              wellness, LumiViTA is redefining the future of healthcare <br />
              — making it clearer, smarter, and more human.</p>
          </div>

        {/* Services */} 
        <div style={{display: "flex", justifyContent: "flex-start", fontFamily: "Poppins", margin: 0, fontSize: "15px", flexDirection: "column", marginLeft:"-50px", textAlign:"left", left: "-5550px", paddingTop:"800px"}}>
          <p style={{fontSize:"25px", fontWeight:"600"}}>Our Services</p>
          <div style={{position:"relative"}}>
            <p style={{fontSize:"40px", fontWeight:"600"}}>Appointment Management</p>
              <span style={{
                position: "absolute",
                left: "59%",
                transform: "translateX(-50%)",
                display: "inline-block",
                width: "0",
                height: "0",
                borderTop: "15px solid transparent",
                borderBottom: "15px solid transparent",
                borderLeft: "20px solid black",
                top: "50%",
              }}></span>
            <p style={{fontSize:"22px"}}>Caregivers can manage and create appointments</p>
          </div>
          <hr style={{ width: "60%", margin: "20px 0", borderTop: "2px solid black" }} />
          
          <div style={{position:"relative"}}>
            <p style={{fontSize:"40px", fontWeight:"600"}}>Prescription Management</p>
            <span style={{
                position: "absolute",
                left: "59%",
                transform: "translateX(-50%)",
                display: "inline-block",
                width: "0",
                height: "0",
                borderTop: "15px solid transparent",
                borderBottom: "15px solid transparent",
                borderLeft: "20px solid black",
                top: "50%",
              }}></span>
            <p style={{fontSize:"22px"}}>Caregivers can prescribe appropriate medication</p>
          </div>
          <hr style={{ width: "60%", margin: "20px 0", borderTop: "2px solid black" }} />

          <div style={{position:"relative"}}>
          <p style={{fontSize:"40px", fontWeight:"600"}}>Patient-Caregiver Matching</p>
          <span style={{
                position: "absolute",
                left: "59%",
                transform: "translateX(-50%)",
                display: "inline-block",
                width: "0",
                height: "0",
                borderTop: "15px solid transparent",
                borderBottom: "15px solid transparent",
                borderLeft: "20px solid black",
                top: "50%",
              }}></span>
          <p style={{fontSize:"22px"}}>Pairing patients to caregivers based on compatibility</p>
          </div>
          <hr style={{ width: "60%", margin: "20px 0", borderTop: "2px solid black"}} />

          <div style={{position:"relative"}}>
          <p style={{fontSize:"40px", fontWeight:"600"}}>24/7 Customer Service</p>
          <span style={{
                position: "absolute",
                left: "59%",
                transform: "translateX(-50%)",
                display: "inline-block",
                width: "0",
                height: "0",
                borderTop: "15px solid transparent",
                borderBottom: "15px solid transparent",
                borderLeft: "20px solid black",
                top: "50%",
              }}></span>
          <p style={{fontSize:"22px"}}>Lumi chatbot available 24/7</p>
          </div>
        </div>
        

        {/* Creators */}
        <div style={{display: "flex", justifyContent: "flex-start", fontFamily: "Poppins", margin: 0, fontSize: "15px", flexDirection: "column", marginLeft:"-50px", textAlign:"left", left: "-5550px", paddingTop:"800px"}}>
          <p style={{fontSize:"25px", fontWeight:"600"}}>The Creators</p>
          <p style={{fontSize:"56px", fontWeight:"600"}}>Four CSE TAs from the <br />Univeristy of Washington</p>
          <p style={{fontSize:"25px"}}>The four of us originally met as teaching assistants for an introductory Java course at UW. <br />
          One of the assignments for the course was a patient prioritizing program that focused on <br />
          conditionals  and user input. From that assignment, we came to realize assigning priority<br />
          scores was a lot more nuanced than we realized. We decided to come together to build this<br />
          application, and help those in need.</p>

        </div>
        
      </div>
      
  );
}
