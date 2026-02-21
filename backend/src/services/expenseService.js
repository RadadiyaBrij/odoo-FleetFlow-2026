import prisma from '../lib/prisma.js';


export const expenseService = {
  getExpenses: async (filters = {}) => {
    const where = {};
    if (filters.vehicleId) where.vehicleId = parseInt(filters.vehicleId);
    if (filters.expenseType) where.expenseType = filters.expenseType;

    return prisma.expense.findMany({
      where,
      include: {
        vehicle: true,
        trip: true
      },
      orderBy: { expenseDate: 'desc' }
    });
  },

  createExpense: async (expenseData) => {
    return prisma.expense.create({
      data: {
        ...expenseData,
        vehicleId: parseInt(expenseData.vehicleId),
        tripId: expenseData.tripId ? parseInt(expenseData.tripId) : null,
        amount: parseFloat(expenseData.amount),
        quantity: expenseData.quantity ? parseFloat(expenseData.quantity) : null,
        expenseDate: new Date(expenseData.expenseDate)
      }
    });
  },

  updateExpense: async (id, expenseData) => {
    const data = { ...expenseData };
    if (data.vehicleId) data.vehicleId = parseInt(data.vehicleId);
    if (data.tripId) data.tripId = parseInt(data.tripId);
    if (data.amount) data.amount = parseFloat(data.amount);
    if (data.quantity) data.quantity = parseFloat(data.quantity);
    if (data.expenseDate) data.expenseDate = new Date(data.expenseDate);
    return prisma.expense.update({ where: { id: parseInt(id) }, data });
  },

  getOperationalCost: async (vehicleId) => {
    const expenses = await prisma.expense.findMany({
      where: { vehicleId: parseInt(vehicleId) }
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const fuel = expenses.filter(e => e.expenseType === 'Fuel').reduce((sum, exp) => sum + exp.amount, 0);
    const maintenance = expenses.filter(e => e.expenseType === 'Maintenance').reduce((sum, exp) => sum + exp.amount, 0);

    return {
      total,
      fuel,
      maintenance,
      other: total - fuel - maintenance
    };
  }
};
