export const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2
    }).format(amount);

    return formatted.replace('ZAR', 'R').replace('R', 'R');
};


export const formatShortDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
};

export const formatLongDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
};

export const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
};

export function formalize(input: string): string {
    return input
        .toLowerCase() // Convert the entire string to lowercase
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
}

export function generateReferenceNumber(transactionType: string): string {
    const prefixes: { [key: string]: string } = {
        'LOAN_PAYMENT': 'LOAP',
        'LOAN_DISBURSEMENT': 'LOAD',
        'INCOME': 'INCE',
        'EXPENSE': 'EXPE'
    };

    // Generate a random number or use a unique timestamp as the suffix
    const suffix = Math.floor(Math.random() * 1000000); // Random number between 0 and 999999

    // Get the current date and format it as DD/YY (Day/Year)
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0'); // Ensure 2-digit day
    const year = String(currentDate.getFullYear()); // Get last two digits of the year

    // Check if the transactionType is valid and map to a prefix
    const prefix = prefixes[transactionType];
    if (!prefix) {
        console.log('Invalid transaction type - using default');
        return `DEF-${suffix}-${day}${year}`;
    }

    // Combine the prefix, random number, and formatted date to create the reference number
    return `${prefix}-${suffix}-${day}${year}`;
}

export function stripLoanDisbursement(input: string): string {
    return input.replace(/ - Loan Disbursement$/, "");
}

export function truncateText(text: string | undefined, maxLength = 30): string {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}