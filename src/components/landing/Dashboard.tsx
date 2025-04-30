
import Link from "next/link";
import { Button } from "../ui/button";

export function Dashboard() {
    return (
        <Button>
            <Link href="/protected">Dashboard</Link>
        </Button>
    )
}