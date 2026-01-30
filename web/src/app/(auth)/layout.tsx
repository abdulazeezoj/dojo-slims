export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <main className="w-full max-w-md p-6">{children}</main>
    </div>
  );
}
