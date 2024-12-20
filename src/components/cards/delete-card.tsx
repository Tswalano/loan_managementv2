import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { BankCard } from "./bank-card";

interface DeleteAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    accountName: string;
    bankName: string;
    balance: string;
    isDeleting?: boolean;
}

export function DeleteAccountDialog({
    open,
    onOpenChange,
    onConfirm,
    accountName,
    bankName,
    balance,
    isDeleting
}: DeleteAccountDialogProps) {

    // bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md bg-white dark:bg-gray-800">
                <AlertDialogHeader className="gap-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
                    </div>
                    <AlertDialogTitle className="text-center text-lg font-semibold text-red-600 dark:text-red-500">
                        Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        Are you sure you want to delete this account? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="my-6 space-y-1 rounded-xl border p-4 dark:border-gray-800">
                    <BankCard
                        accountName={accountName}
                        accountReference={"xxxx"}
                        bankName={bankName}
                        currentBalance={balance}
                        onClick={function (): void {}}
                    />
                    {/* <AccountDetailRow
                        icon={<CreditCard className="h-4 w-4" />}
                        label="Account Name"
                        value={accountName}
                    />
                    <AccountDetailRow
                        icon={<Building2 className="h-4 w-4" />}
                        label="Bank Name"
                        value={bankName}
                    />
                    <AccountDetailRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Current Balance"
                        value={formatCurrency(parseFloat(balance))}
                    /> */}
                </div>

                <AlertDialogFooter className="gap-2 sm:gap-0">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="transition-transform hover:scale-102 active:scale-98"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async (e) => {
                            e.preventDefault();
                            await onConfirm();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 text-white transition-all hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:hover:text-white"
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