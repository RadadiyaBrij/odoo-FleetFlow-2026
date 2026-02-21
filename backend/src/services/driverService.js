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
    const { name, email, phone, licenseNumber, licenseExpiryDate, licenseCategory } = driverData;
    const expiry = new Date(licenseExpiryDate);
    const isExpired = expiry < new Date();

    try {
      return await prisma.driver.create({
        data: {
          name,
          email,
          phone,
          licenseNumber,
          licenseCategory: licenseCategory || 'LMV',
          status: isExpired ? 'SUSPENDED' : 'AVAILABLE',
          licenseExpiryDate: expiry
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        if (target.includes('licenseNumber')) {
          const err = new Error('This License ID is already registered in the system.');
          err.status = 400;
          throw err;
        }
        if (target.includes('email')) {
          const err = new Error('This Email Address is already registered to another driver.');
          err.status = 400;
          throw err;
        }
      }
      throw error;
    }
  },

  updateDriver: async (id, driverData) => {
    const { name, email, phone, licenseNumber, licenseExpiryDate, licenseCategory, status } = driverData;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone) data.phone = phone;
    if (licenseNumber) data.licenseNumber = licenseNumber;
    if (licenseCategory) data.licenseCategory = licenseCategory;
    if (status) data.status = status;
    if (licenseExpiryDate) data.licenseExpiryDate = new Date(licenseExpiryDate);

    return prisma.driver.update({ where: { id: parseInt(id) }, data });
  },

  // Safety Officer: update duty status
  updateDriverStatus: async (id, status) => {
    const allowed = ['AVAILABLE', 'ON LEAVE', 'SUSPENDED'];
    if (!allowed.includes(status)) throw new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
    return prisma.driver.update({ where: { id: parseInt(id) }, data: { status } });
  },

  // Auto-lock drivers with expired licenses (Safety Lock feature)
  checkAndLockExpiredLicenses: async () => {
    return prisma.driver.updateMany({
      where: { licenseExpiryDate: { lt: new Date() }, status: { not: 'SUSPENDED' } },
      data: { status: 'SUSPENDED' }
    });
  },

  getAvailableDrivers: async () => {
    return prisma.driver.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: { name: 'asc' }
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
