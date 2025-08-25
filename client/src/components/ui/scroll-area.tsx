import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

type RootProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  /** If true (default), the visual scrollbar is hidden but scrolling still works */
  hideScrollbar?: boolean
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  RootProps
>(({ className, children, hideScrollbar = true, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    {/* Hide rails in the viewport while keeping scroll functional */}
    <ScrollAreaPrimitive.Viewport
      className={cn(
        "h-full w-full rounded-[inherit]",
        // Cross‑browser hidden scrollbars (still scrollable)
        // Firefox
        "[scrollbar-width:none]",
        // Old Edge/IE
        "[-ms-overflow-style:none]",
        // WebKit
        "[&::-webkit-scrollbar]:hidden"
      )}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>

    {/* Only render the visual scrollbar if the caller wants it */}
    {!hideScrollbar && (
      <>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </>
    )}
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
