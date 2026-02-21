import prisma from '../lib/prisma.js';


export const vehicleService = {
  // Get all vehicles with filters
  getVehicles: async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.vehicleType) where.vehicleType = filters.vehicleType;

    return prisma.vehicle.findMany({
      where,
      include: { createdBy: { select: { username: true } } },
      orderBy: { createdDate: 'desc' }
    });
  },

  // Get single vehicle
  getVehicleById: async (id) => {
    return prisma.vehicle.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: { select: { username: true } },
        trips: { take: 10, orderBy: { createdDate: 'desc' } },
        maintenanceLogs: { take: 10, orderBy: { createdDate: 'desc' } },
        expenses: { take: 10, orderBy: { expenseDate: 'desc' } }
      }
    });
  },

  // Add new vehicle
  addVehicle: async (vehicleData, userId) => {
    return prisma.vehicle.create({
      data: {
        ...vehicleData,
        createdById: userId
      }
    });
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    return prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: vehicleData
    });
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    // Check if vehicle has active trips
    const activeTrips = await prisma.trip.count({
      where: {
        vehicleId: parseInt(id),
        status: { in: ['Draft', 'Dispatched'] }
      }
    });

    if (activeTrips > 0) {
      throw new Error('Cannot delete vehicle with active trips');
    }

    return prisma.vehicle.delete({ where: { id: parseInt(id) } });
  }
};
