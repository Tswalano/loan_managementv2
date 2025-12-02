import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BankCard } from "./bank-card";

interface DeleteAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    accountName: string;
    accountNumber: string;
    bankName: string;
    balance: string;
    isDeleting?: boolean;
}

export function DeleteAccountDialog({
    open,
    onOpenChange,
    onConfirm,
    accountName,
    accountNumber,
    bankName,
    balance,
    isDeleting
}: DeleteAccountDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "max-w-md p-0 gap-0 overflow-hidden",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                {/* Header Section with Gradient */}
                <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 pb-8">
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex flex-col items-center gap-3 text-white">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">
                            Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-white/90 text-center max-w-sm">
                            This action cannot be undone. All associated data will be permanently removed.
                        </DialogDescription>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-6">

                    <BankCard
                        accountName={accountName}
                        accountNumber={accountNumber}
                        bankName={bankName}
                        currentBalance={balance}
                        onClick={() => { }}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isDeleting}
                            className={cn(
                                "flex-1 h-11",
                                "bg-gray-100 dark:bg-gray-800",
                                "border-2 border-gray-300 dark:border-gray-600",
                                "text-gray-900 dark:text-white font-semibold",
                                "hover:bg-gray-200 dark:hover:bg-gray-700",
                                "transition-all duration-200"
                            )}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className={cn(
                                "flex-1 h-11 font-semibold",
                                "bg-gradient-to-r from-red-600 to-red-700",
                                "hover:from-red-700 hover:to-red-800",
                                "text-white shadow-lg hover:shadow-xl",
                                "transition-all duration-300",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Deleting...</span>
                                </div>
                            ) : (
                                "Delete Account"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteAccountDialog;