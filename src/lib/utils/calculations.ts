export const calculateLoanMetrics = (
    principal: number,
    interestRate: number,
    term: number,
    paymentFrequency: 'WEEKLY' | 'MONTHLY' = 'MONTHLY'
) => {
    const periodsPerYear = paymentFrequency === 'WEEKLY' ? 52 : 12;
    const totalPeriods = term * (paymentFrequency === 'WEEKLY' ? 4 : 1);
    const periodicRate = (interestRate / 100) / periodsPerYear;

    const monthlyPayment =
        (principal * periodicRate * Math.pow(1 + periodicRate, totalPeriods)) /
        (Math.pow(1 + periodicRate, totalPeriods) - 1);

    const totalAmount = monthlyPayment * totalPeriods;
    const totalInterest = totalAmount - principal;

    return {
        periodicPayment: parseFloat(monthlyPayment.toFixed(2)),
        totalPayment: parseFloat(totalAmount.toFixed(2)),
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        effectiveRate: parseFloat(((totalInterest / principal) * 100).toFixed(2))
    };
};