export const formatAmount = (amount: number) =>
  String(Math.trunc(amount)).replace(/\B(?=(\d{4})+(?!\d))/g, ',')
