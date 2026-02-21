import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const maintenanceService = {
  getMaintenanceLogs: async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.vehicleId) where.vehicleId = parseInt(filters.vehicleId);
    
    return prisma.maintenanceLog.findMany({
      where,
      include: {
        vehicle: true
      },
      orderBy: { serviceDate: 'desc' }
    });
  },

  createMaintenanceLog: async (logData) => {
    // Adding a vehicle to service log automatically switches status to "In Shop"
    const log = await prisma.maintenanceLog.create({
      data: {
        ...logData,
        vehicleId: parseInt(logData.vehicleId),
        cost: parseFloat(logData.cost),
        serviceDate: new Date(logData.serviceDate)
      }
    });

    await prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: 'In Shop' }
    });

    return log;
  },

  completeMaintenance: async (id, completedDate, technicianName) => {
    const log = await prisma.maintenanceLog.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Completed',
        completedDate: new Date(completedDate),
        technicianName
      }
    });

    // When maintenance is completed, vehicle becomes Available again
    await prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: 'Available' }
    });

    return log;
  }
};
