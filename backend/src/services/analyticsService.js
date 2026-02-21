import prisma from '../lib/prisma.js';


export const analyticsService = {
  getFleetKPI: async () => {
    const activeFleet = await prisma.vehicle.count({
      where: { status: 'On Trip' }
    });

    const maintenanceAlerts = await prisma.vehicle.count({
      where: { status: 'In Shop' }
    });

    const totalVehicles = await prisma.vehicle.count({
      where: { status: { not: 'Out of Service' } }
    });

    const pendingCargo = await prisma.trip.count({
      where: { status: 'Draft' }
    });

    const utilizationRate = totalVehicles > 0
      ? (activeFleet / totalVehicles) * 100
      : 0;

    return {
      activeFleet,
      maintenanceAlerts,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      pendingCargo,
      totalVehicles
    };
  }
};
