import React from "react";
import { CloudIcon, LockIcon, RefreshCcwIcon } from "lucide-react";
import ChatbotPopup from "./chatbotPopup";

export function FeaturesSection() {
  return (
    <div className="space-y-32 ">

      {/* ===== About LumiViTA ===== */}
      <section
        id="aboutSection"
        className="relative w-full py-32 px-4"
      >
        {/* full-bleed background */}
        {/* <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[url('/lumivita_designs/top_vector.png')]
            bg-bottom bg-cover bg-no-repeat
          "
        /> */}

        {/* your existing content, optionally centered */}
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col md:flex-row items-center -space-x-8">
            <img
              src="/lumivitaDesigns/doctor.png"
              alt="Doctor"
              className="w-90 object-contain md:self-start"
            />
            <img
              src="/lumivitaDesigns/pills.png"
              alt="Pills"
              className="w-90 object-contain md:mt-52"
            />
          </div>
          <div className="max-w-md text-right space-y-4">
            <h2 className="text-2xl font-bold text-[#001F54]">
              About LumiViTA
            </h2>
            <h3 className="text-5xl font-extrabold text-[#001F54] leading-tight">
              Clarity and vitality
              <br />
              are the heart of
              <br />
              better healthcare
            </h3>
            <p className="text-lg text-[#001F54]">
              At LumiViTA, we empower patients and caregivers through
              seamless, technology-driven solutions that prioritize connection,
              insight, and personalized care. By combining innovation with a deep
              commitment to life and wellness, we’re redefining the future of
              healthcare—making it clearer, smarter, and more human.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Our Services ===== */}
      <section
        id="servicesSection"
        className=" py-16 px-4"
      >
        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[url('/lumivita_designs/bottom_vector.png')]
            bg-top bg-cover bg-no-repeat
          "/>

          <h2 className="text-2xl font-semibold text-[#001F54]">
            Our Services
          </h2>

          {/* Service Item */}
          <div className="space-y-8">
            {[{
              title: "Appointment Management",
              desc: "Caregivers can manage and create appointments",
              // icon: <CloudIcon className="h-8 w-8 text-[#001F54]" />
            },{
              title: "Prescription Management",
              desc: "Caregivers can prescribe appropriate medication",
              // icon: <LockIcon className="h-8 w-8 text-[#001F54]" />
            },{
              title: "Patient-Caregiver Matching",
              desc: "Pairing patients to caregivers based on compatibility",
              // icon: <RefreshCcwIcon className="h-8 w-8 text-[#001F54]" />
            },{
              title: "24/7 Customer Service",
              desc: "Lumi chatbot available 24/7",
              // icon: <ChatbotPopup />
            }].map(({ title, desc, icon }) => (
              <div key={title} className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="space-y-2">
                  <h3 className="text-3xl font-extrabold text-[#001F54]">{title}</h3>
                  <p className="text-lg text-[#001F54]">{desc}</p>
                </div>
                <div>{icon}</div>
                <hr className="border-t-2 border-[#001F54] w-full mt-8 md:hidden" />
              </div>
            ))}
          </div>
      </section>

      {/* ===== The Creators ===== */}
      <section
        id="creatorsSection"
        className=" py-16 px-4"
      >
        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[url('/lumivita_designs/top_vector.png')]
            bg-bottom bg-cover bg-no-repeat
          "/>
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-[#001F54]">
              The Creators
            </h2>
            <h3 className="text-5xl font-extrabold text-[#001F54] leading-tight">
              Four CSE TAs from the
              <br />
              University of Washington
            </h3>
            <p className="text-lg text-[#333]">
              We first met as TAs for an introductory Java course at UW. An
              assignment on patient prioritization sparked the idea to build
              this app—bringing clarity and care together.
            </p>
          </div>

          <div className="flex flex-row justify-center items-start gap-8">
            {[
              { name: "Ruslana Korolov", role: "Fullstack Engineer", img: "/lumivitaDesigns/ruslana.png" },
              { name: "Hanna Pan",        role: "UI/UX Designer",          img: "/lumivitaDesigns/hanna.png"   },
              { name: "Nicole Ham",       role: "Frontend Engineer", img: "/lumivitaDesigns/nicole.png" },
              { name: "Alice Zhu",        role: "Frontend Engineer", img: "/lumivitaDesigns/alice.png"  },
            ].map(({ name, role, img }) => (
              <div key={name} className="flex flex-col items-center space-y-4">
                <img src={img} alt={name} className="w-72 object-contain" />
                <p className="text-center text-lg">
                  {name}
                  <br />
                  <span className="font-medium">{role}</span>
                </p>
              </div>
            ))}
          </div>
      </section>
    </div>
  );
}
