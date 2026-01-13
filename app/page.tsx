import MainLayout from '@/components/main-layout'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/auth-actions'

export default function Home() {
    return (
        <MainLayout>
            <Button onClick={signOut}>Logout</Button>
        </MainLayout>
    )
}
