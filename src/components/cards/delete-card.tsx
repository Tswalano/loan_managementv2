import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
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
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={cn(
                "max-w-md",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <AlertDialogHeader className="gap-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                        <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                    <AlertDialogTitle className="text-center text-xl font-bold text-red-600 dark:text-red-500">
                        Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this account? This action cannot be undone and all associated data will be permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="my-6 p-4 rounded-xl border border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10">
                    <BankCard
                        accountName={accountName}
                        accountNumber={accountNumber}
                        bankName={bankName}
                        currentBalance={balance}
                        onClick={() => { }}
                    />
                </div>

                <AlertDialogFooter className="gap-3 sm:gap-3">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className={cn(
                            "flex-1 bg-gray-100 dark:bg-gray-800",
                            "border-gray-300 dark:border-gray-600",
                            "text-gray-900 dark:text-white",
                            "hover:bg-gray-200 dark:hover:bg-gray-700",
                            "transition-all duration-200"
                        )}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async (e) => {
                            e.preventDefault();
                            await onConfirm();
                        }}
                        disabled={isDeleting}
                        className={cn(
                            "flex-1 bg-gradient-to-r from-red-600 to-red-700",
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
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DeleteAccountDialog;