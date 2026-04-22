import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  labelClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, labelClassName, ...props }, ref) => {
    const isPasswordField = props.type === "password"
    const [showPassword, setShowPassword] = React.useState(false)
    const inputType =
      isPasswordField && showPassword ? "text" : props.type

    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              "block text-sm font-medium text-lc-gray-light mb-1.5 ml-1",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "input-field",
              isPasswordField && "pr-14",
              error && "border-lc-error focus:border-lc-error focus:ring-lc-error/20",
              className
            )}
            {...props}
            type={inputType}
          />
          {isPasswordField ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lc-gray transition-colors hover:bg-lc-white/5 hover:text-lc-white focus:outline-none focus:ring-2 focus:ring-lc-purple/40"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
              disabled={props.disabled}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : null}
        </div>
        {error && (
          <p className="mt-1.5 ml-1 text-xs text-lc-error font-medium">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
