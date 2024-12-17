export default function DashboardLayout({
    children,
    summary,
    tickets,
    visitors,
}: Readonly<{
    children: React.ReactNode
    summary: React.ReactNode
    tickets: React.ReactNode
    visitors: React.ReactNode
}>) {
    return (
        <>
            {children}
            {summary}
            {tickets}
            {visitors}
        </>
    )
}
