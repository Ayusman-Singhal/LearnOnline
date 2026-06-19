import Footer from './Footer'

export default function StaticLayout({ children }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-canvas)]">
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 pt-32 pb-16">
        {children}
      </div>
      <Footer />
    </div>
  )
}
