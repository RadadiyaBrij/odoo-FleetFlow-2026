import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
