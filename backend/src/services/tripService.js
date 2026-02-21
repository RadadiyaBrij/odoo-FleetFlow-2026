import prisma from '../lib/prisma.js';


export const tripService = {
  // Validate trip creation
  validateTrip: async (tripData) => {
    const errors = [];

    // Get vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(tripData.vehicleId) }
    });

    if (!vehicle) {
      errors.push('Vehicle not found');
      return { isValid: false, errors };
    }

    // Check capacity
    if (parseFloat(tripData.cargoWeightKg) > vehicle.maxCapacityKg) {
      errors.push(`Cargo weight (${tripData.cargoWeightKg}kg) exceeds vehicle capacity (${vehicle.maxCapacityKg}kg)`);
    }

    // Check vehicle availability
    if (vehicle.status !== 'Available') {
      errors.push(`Vehicle is ${vehicle.status}`);
    }

    // Get driver
    const driver = await prisma.driver.findUnique({
      where: { id: parseInt(tripData.driverId) }
    });

    if (!driver) {
      errors.push('Driver not found');
      return { isValid: false, errors };
    }

    // Check driver status
    if (driver.status === 'Suspended') {
      errors.push('Driver is suspended');
    }

    // Check license expiry
    if (new Date(driver.licenseExpiryDate) < new Date()) {
      errors.push('Driver license has expired');
    }

    return {
      isValid: errors.length === 0,
      errors,
      vehicle,
      driver
    };
  },

  // Create trip
  createTrip: async (tripData) => {
    const validation = await tripService.validateTrip(tripData);

    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.status = 400;
      throw error;
    }

    return prisma.trip.create({
      data: {
        ...tripData,
        vehicleId: parseInt(tripData.vehicleId),
        driverId: parseInt(tripData.driverId),
        cargoWeightKg: parseFloat(tripData.cargoWeightKg),
        estimatedFuelCost: parseFloat(tripData.estimatedFuelCost)
      }
    });
  },

  // Dispatch trip
  dispatchTrip: async (tripId, startOdometer) => {
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(tripId) },
      include: { vehicle: true, driver: true }
    });

    if (!trip) throw new Error('Trip not found');

    // Update trip status
    const updatedTrip = await prisma.trip.update({
      where: { id: parseInt(tripId) },
      data: {
        status: 'Dispatched',
        startOdometer: parseFloat(startOdometer),
        tripStartTime: new Date()
      }
    });

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'On Trip' }
    });

    // Update driver status
    await prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: 'On Duty' }
    });

    return updatedTrip;
  },

  // Complete trip
  completeTrip: async (tripId, endOdometer) => {
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(tripId) },
      include: { vehicle: true, driver: true }
    });

    if (!trip) throw new Error('Trip not found');

    // Update trip
    const updatedTrip = await prisma.trip.update({
      where: { id: parseInt(tripId) },
      data: {
        status: 'Completed',
        endOdometer: parseFloat(endOdometer),
        tripEndTime: new Date()
      }
    });

    // Update vehicle
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: 'Available',
        currentOdometer: parseFloat(endOdometer)
      }
    });

    // Update driver
    await prisma.driver.update({
      where: { id: trip.driverId },
      data: {
        status: 'Off Duty',
        tripsCompleted: { increment: 1 }
      }
    });

    return updatedTrip;
  },

  getTrips: async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;

    return prisma.trip.findMany({
      where,
      include: {
        vehicle: true,
        driver: true
      },
      orderBy: { createdDate: 'desc' }
    });
  }
};
