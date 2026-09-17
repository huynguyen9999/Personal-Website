"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const liquidGlassButtonVariants = cva("liquid-glass-button", {
  variants: {
    size: {
      compact: "liquid-glass-button--compact",
      default: "liquid-glass-button--default",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type LiquidGlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>
  & VariantProps<typeof liquidGlassButtonVariants> & {
    asChild?: boolean;
  };

const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ asChild = false, children, className, size, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    const componentProps = {
      ref,
      className: cn(liquidGlassButtonVariants({ size }), className),
      "data-slot": "liquid-glass-button",
      ...props,
    };

    if (asChild) {
      return <Component {...componentProps}>{children}</Component>;
    }

    return (
      <Component {...componentProps}>
        <span className="liquid-glass-button__content">{children}</span>
      </Component>
    );
  },
);

LiquidGlassButton.displayName = "LiquidGlassButton";

export { LiquidGlassButton, liquidGlassButtonVariants };
