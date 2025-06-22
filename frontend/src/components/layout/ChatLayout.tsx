import { DialogueHeader } from '../game'

export default function ChatLayout({
  className,
  children,
}: {
  className: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`h-screen bg-neutral-900 relative overflow-y-auto lg:overflow-hidden ${className}`}
    >
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen lg:h-full">
        {/* Header */}
        <DialogueHeader />

        {children}
      </div>
    </div>
  )
}
