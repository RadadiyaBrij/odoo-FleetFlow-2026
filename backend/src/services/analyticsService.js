import prisma from '../lib/prisma.js';

export const analyticsService = {
  // General KPI — used by all roles
  getFleetKPI: async () => {
    const activeFleet = await prisma.vehicle.count({ where: { status: 'On Trip' } });
    const maintenanceAlerts = await prisma.vehicle.count({ where: { status: 'In Shop' } });
    const totalVehicles = await prisma.vehicle.count({ where: { status: { not: 'Out of Service' } } });
    const pendingCargo = await prisma.trip.count({ where: { status: 'Draft' } });
    const utilizationRate = totalVehicles > 0 ? (activeFleet / totalVehicles) * 100 : 0;
    return { activeFleet, maintenanceAlerts, utilizationRate: Math.round(utilizationRate * 100) / 100, pendingCargo, totalVehicles };
  },

  // Operational KPIs — Dispatcher
  getOperationalKPI: async () => {
    const activeTrips = await prisma.trip.count({ where: { status: 'Dispatched' } });
    const pendingTrips = await prisma.trip.count({ where: { status: 'Draft' } });
    const availableVehicles = await prisma.vehicle.count({ where: { status: 'Available' } });
    const availableDrivers = await prisma.driver.count({ where: { status: 'On Duty' } });
    return { activeTrips, pendingTrips, availableVehicles, availableDrivers };
  },

  // Safety KPIs — Safety Officer
  getSafetyKPI: async () => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiredLicenses = await prisma.driver.count({ where: { licenseExpiryDate: { lt: now } } });
    const expiringLicenses = await prisma.driver.count({ where: { licenseExpiryDate: { gte: now, lte: thirtyDaysLater } } });
    const suspendedDrivers = await prisma.driver.count({ where: { status: 'Suspended' } });
    const totalDrivers = await prisma.driver.count();
    const driversWithComplaints = await prisma.driver.count({ where: { complaintsCount: { gt: 0 } } });
    const drivers = await prisma.driver.findMany({ select: { safetyScore: true } });
    const avgSafetyScore = drivers.length > 0 ? drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length : 0;
    return { expiredLicenses, expiringLicenses, suspendedDrivers, totalDrivers, driversWithComplaints, avgSafetyScore: Math.round(avgSafetyScore * 10) / 10 };
  },

  // Financial KPIs — Analyst
  getFinancialKPI: async () => {
    const expenses = await prisma.expense.findMany();
    const totalFuelCost = expenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + e.amount, 0);
    const totalMaintenanceCost = expenses.filter(e => e.expenseType === 'Maintenance').reduce((s, e) => s + e.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalVehicles = await prisma.vehicle.count();
    const activeFleet = await prisma.vehicle.count({ where: { status: 'On Trip' } });
    const utilizationRate = totalVehicles > 0 ? (activeFleet / totalVehicles) * 100 : 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentExpenses = await prisma.expense.findMany({ where: { expenseDate: { gte: sixMonthsAgo } }, orderBy: { expenseDate: 'asc' } });
    const monthlyMap = {};
    recentExpenses.forEach(e => {
      const key = e.expenseDate.toISOString().slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, fuelCost: 0, maintenanceCost: 0, total: 0 };
      monthlyMap[key].total += e.amount;
      if (e.expenseType === 'Fuel') monthlyMap[key].fuelCost += e.amount;
      if (e.expenseType === 'Maintenance') monthlyMap[key].maintenanceCost += e.amount;
    });

    const vehicleExpenses = await prisma.vehicle.findMany({ include: { expenses: true }, take: 20 });
    const vehicleCosts = vehicleExpenses.map(v => ({
      name: v.name, plate: v.licensePlate, totalCost: v.expenses.reduce((s, e) => s + e.amount, 0)
    })).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

    const completedTrips = await prisma.trip.count({ where: { status: 'Completed' } });
    return {
      totalFuelCost: Math.round(totalFuelCost),
      totalMaintenanceCost: Math.round(totalMaintenanceCost),
      totalExpenses: Math.round(totalExpenses),
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      fleetROI: Math.round(utilizationRate * 0.125 * 10) / 10,
      fuelEfficiency: completedTrips > 0 ? Math.round(totalFuelCost / completedTrips) : 0,
      monthlySummary: Object.values(monthlyMap),
      vehicleCosts
    };
  }
};
