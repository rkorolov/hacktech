import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 border-b pb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <a href="mailto:contact@healthclinic.com" className="hover:underline">contact@healthclinic.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>123 Healthcare Ave, Medical District</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Hours</h3>
            <div className="space-y-2">
              <p>Monday - Friday: 8am - 6pm</p>
              <p>Saturday: 9am - 1pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency</h3>
            <p className="mb-2">For medical emergencies, please call 911</p>
            <p>After-hours support: (555) 987-6543</p>
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <Link href="https://crack.diy" className="text-2xl font-serif font-extrabold">
            crack.diy
          </Link>
        </div>
        <p className="text-center text-sm text-foreground/50">
          © {new Date().getFullYear()} crack.diy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}