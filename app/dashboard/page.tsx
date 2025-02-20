'use client'
import { useUser } from "@clerk/nextjs"
import Header from "@/components/Header"

export default function DashboardPage() {
    const { user } = useUser()
 
    
    

    return (
        <div className="min-h-screen w-full">
            <Header title="Dashboard"  />

            <main className="container mx-auto py-6">
                {user && <p className="text-sm text-muted-foreground">
                    Welcome back, {user.username}
                </p>}
                <p> This is the dashboard page</p>
            </main>

            
        </div>
    )
}
