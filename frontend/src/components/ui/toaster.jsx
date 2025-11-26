import * as React from "react"
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

// 1. Create Context
const ToastContext = React.createContext({})

// 2. The Provider Component (Wrap your app with this in main.jsx or just use the hook if simple)
// For this simple version, we will use a Global State approach so it works easily.

const listeners = new Set()

function dispatch(action) {
  listeners.forEach((listener) => listener(action))
}

function toast({ title, description, variant = "default" }) {
  const id = Math.random().toString(36).substr(2, 9)
  dispatch({ type: "ADD_TOAST", toast: { id, title, description, variant } })
}

// 3. The Hook
export function useToast() {
  return { toast }
}

// 4. The Toaster Display Component
export function Toaster() {
  const [toasts, setToasts] = React.useState([])

  React.useEffect(() => {
    const handleEvent = (action) => {
      switch (action.type) {
        case "ADD_TOAST":
          setToasts((prev) => [...prev, action.toast])
          // Auto dismiss after 3 seconds
          setTimeout(() => {
            dispatch({ type: "REMOVE_TOAST", id: action.toast.id })
          }, 3000)
          break
        case "REMOVE_TOAST":
          setToasts((prev) => prev.filter((t) => t.id !== action.id))
          break
      }
    }

    listeners.add(handleEvent)
    return () => listeners.delete(handleEvent)
  }, [])

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 w-full max-w-[420px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
            t.variant === "destructive" 
              ? "destructive group border-red-500 bg-red-600 text-white" 
              : "border-slate-200 bg-white text-slate-950"
          )}
        >
          <div className="grid gap-1">
            {t.title && <div className="text-sm font-semibold">{t.title}</div>}
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          </div>
          <button
            onClick={() => dispatch({ type: "REMOVE_TOAST", id: t.id })}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-100 hover:text-foreground focus:opacity-100 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}