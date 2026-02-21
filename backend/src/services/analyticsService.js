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
    const trips = await prisma.trip.findMany({ where: { status: 'Completed' } });
    const vehicles = await prisma.vehicle.findMany();

    const totalRevenue = trips.reduce((s, t) => s + t.revenue, 0);
    const totalFuelCost = expenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + e.amount, 0);
    const totalMaintenanceCost = expenses.filter(e => e.expenseType === 'Maintenance' || e.expenseType === 'Repair').reduce((s, e) => s + e.amount, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

    // Advanced ROI: (Revenue - OpCost) / AcquisitionCost
    const totalAcquisitionCost = vehicles.reduce((s, v) => s + (v.acquisitionCost || 0), 0);
    const fleetROI = totalAcquisitionCost > 0 ? ((totalRevenue - totalOperationalCost) / totalAcquisitionCost) * 100 : 0;

    const totalVehicles = vehicles.length;
    const activeFleetCount = vehicles.filter(v => v.status === 'On Trip').length;
    const utilizationRate = totalVehicles > 0 ? (activeFleetCount / totalVehicles) * 100 : 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentExpenses = await prisma.expense.findMany({ where: { expenseDate: { gte: sixMonthsAgo } }, orderBy: { expenseDate: 'asc' } });
    const monthlyMap = {};
    recentExpenses.forEach(e => {
      const key = e.expenseDate.toISOString().slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, fuelCost: 0, maintenanceCost: 0, total: 0 };
      monthlyMap[key].total += e.amount;
      if (e.expenseType === 'Fuel') monthlyMap[key].fuelCost += e.amount;
      if (e.expenseType === 'Maintenance' || e.expenseType === 'Repair') monthlyMap[key].maintenanceCost += e.amount;
    });

    const vehicleExpenses = await prisma.vehicle.findMany({ include: { expenses: true }, take: 20 });
    const vehicleCosts = vehicleExpenses.map(v => {
      const fuel = v.expenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + e.amount, 0);
      const maint = v.expenses.filter(e => e.expenseType === 'Maintenance' || e.expenseType === 'Repair').reduce((s, e) => s + e.amount, 0);
      return {
        name: v.name,
        plate: v.licensePlate,
        totalCost: fuel + maint,
        fuel,
        maint
      };
    }).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

    const completedTripsCount = trips.length;
    return {
      totalRevenue: Math.round(totalRevenue),
      totalFuelCost: Math.round(totalFuelCost),
      totalMaintenanceCost: Math.round(totalMaintenanceCost),
      totalOperationalCost: Math.round(totalOperationalCost),
      totalExpenses: Math.round(expenses.reduce((s, e) => s + e.amount, 0)),
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      fleetROI: Math.round(fleetROI * 10) / 10,
      fuelEfficiency: completedTripsCount > 0 ? Math.round(totalFuelCost / completedTripsCount) : 0,
      monthlySummary: Object.values(monthlyMap),
      vehicleCosts
    };
  }
};
