import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  labelClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, labelClassName, ...props }, ref) => {
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
        <input
          ref={ref}
          className={cn(
            "input-field",
            error && "border-lc-error focus:border-lc-error focus:ring-lc-error/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 ml-1 text-xs text-lc-error font-medium">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
