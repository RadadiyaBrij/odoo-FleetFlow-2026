import prisma from '../lib/prisma.js';


export const driverService = {
  getDrivers: async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;

    return prisma.driver.findMany({
      where,
      orderBy: { createdDate: 'desc' }
    });
  },

  getDriverById: async (id) => {
    return prisma.driver.findUnique({
      where: { id: parseInt(id) },
      include: {
        trips: { take: 10, orderBy: { createdDate: 'desc' } }
      }
    });
  },

  addDriver: async (driverData) => {
    return prisma.driver.create({
      data: {
        ...driverData,
        licenseExpiryDate: new Date(driverData.licenseExpiryDate)
      }
    });
  },

  updateDriver: async (id, driverData) => {
    const data = { ...driverData };
    if (data.licenseExpiryDate) data.licenseExpiryDate = new Date(data.licenseExpiryDate);
    return prisma.driver.update({ where: { id: parseInt(id) }, data });
  },

  // Safety Officer: update duty status
  updateDriverStatus: async (id, status) => {
    const allowed = ['On Duty', 'Taking a Break', 'Suspended'];
    if (!allowed.includes(status)) throw new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
    return prisma.driver.update({ where: { id: parseInt(id) }, data: { status } });
  },

  // Auto-lock drivers with expired licenses (Safety Lock feature)
  checkAndLockExpiredLicenses: async () => {
    return prisma.driver.updateMany({
      where: { licenseExpiryDate: { lt: new Date() }, status: { not: 'Suspended' } },
      data: { status: 'Suspended' }
    });
  },

  deleteDriver: async (id) => {
    const activeTrips = await prisma.trip.count({
      where: {
        driverId: parseInt(id),
        status: { in: ['Draft', 'Dispatched'] }
      }
    });

    if (activeTrips > 0) {
      throw new Error('Cannot delete driver with active trips');
    }

    return prisma.driver.delete({ where: { id: parseInt(id) } });
  }
};
