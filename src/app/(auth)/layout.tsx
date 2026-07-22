export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      {/* Soft brand backdrop, echoing the app canvas */}
      <div
        className="dot-grid pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(79,139,255,0.14), transparent 70%)",
        }}
        aria-hidden
      />
      {children}
    </div>
  );
}
