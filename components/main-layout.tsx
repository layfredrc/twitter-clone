import Sidebar from './sidebar'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className='flex h-screen bg-background'>
            <Sidebar />
            {children}
        </div>
    )
}
