import { AlertCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DialoProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    onRetry?: () => Promise<void>;
}


const ErrorComponent = ({ isOpen, onClose, title, message }: DialoProps) => {

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="border-l-4 border-red-500 bg-white dark:bg-gray-900 dark:border-red-400">
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                        <AlertDialogTitle className="text-lg font-semibold text-red-500 dark:text-red-400">
                            {title}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                    <AlertDialogAction
                        onClick={() => onClose()}
                        className="bg-red-500 text-white dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                    >
                        Close
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ErrorComponent;