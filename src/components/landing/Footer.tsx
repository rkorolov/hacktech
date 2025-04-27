import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background text-foreground">
      <div style={{paddingTop:"2750px"}}>
         <p>
         © {new Date().getFullYear()} LumiViTA. All rights reserved. 
        </p>
      </div>
    </footer>
  );
}

