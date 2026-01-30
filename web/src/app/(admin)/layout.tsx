export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar will go here */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
