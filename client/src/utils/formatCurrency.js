export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
};

export default formatCurrency;
