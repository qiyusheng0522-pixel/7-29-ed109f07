import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  toastMessage?: string;
  toastDescription?: string;
  toastType?: "success" | "info" | "warning" | "error";
  danger?: boolean;
  onConfirm?: () => void | Promise<void>;
  disabled?: boolean;
};

export function ActionSheet({
  trigger,
  title,
  description,
  children,
  confirmText = "确认",
  cancelText = "取消",
  toastMessage,
  toastDescription,
  toastType = "success",
  danger,
  onConfirm,
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      if (toastMessage) {
        const fn = toast[toastType] ?? toast;
        fn(toastMessage, toastDescription ? { description: toastDescription } : undefined);
      }
    } finally {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-3xl border-0 bg-background p-0 shadow-2xl"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" />
        <div className="px-5 pt-3 pb-2">
          <SheetHeader className="text-left">
            <SheetTitle className="text-base">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-xs leading-relaxed">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
        </div>
        {children && <div className="max-h-[50vh] overflow-y-auto px-5 pb-2">{children}</div>}
        <SheetFooter className="grid grid-cols-2 gap-2 border-t border-border/60 bg-surface p-4">
          <SheetClose asChild>
            <button className="rounded-xl bg-surface-2 py-2.5 text-sm">
              {cancelText}
            </button>
          </SheetClose>
          <button
            disabled={disabled}
            onClick={handleConfirm}
            className={cn(
              "rounded-xl py-2.5 text-sm font-medium disabled:opacity-40",
              danger
                ? "bg-danger text-danger-foreground"
                : "bg-warm text-warm-foreground",
            )}
          >
            {confirmText}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
