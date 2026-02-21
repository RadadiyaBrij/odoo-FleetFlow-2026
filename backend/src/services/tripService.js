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
      errors.push('The selected vehicle could not be found in our registry.');
      return { isValid: false, errors };
    }

    // Check capacity
    const cargoWeight = parseFloat(tripData.cargoWeightKg);
    if (cargoWeight > vehicle.maxCapacityKg) {
      errors.push(`Weight (${cargoWeight}kg) is out of capacity for this ${vehicle.vehicleType}. Max allowed: ${vehicle.maxCapacityKg}kg. Please try another vehicle with higher capacity.`);
    }

    // Check vehicle availability
    if (vehicle.status !== 'Available') {
      errors.push(`This vehicle is currently ${vehicle.status} and cannot be assigned to a new trip.`);
    }

    // Get driver
    const driver = await prisma.driver.findUnique({
      where: { id: parseInt(tripData.driverId) }
    });

    if (!driver) {
      errors.push('The selected driver could not be found.');
      return { isValid: false, errors };
    }

    // Check driver status
    if (driver.status !== 'AVAILABLE') {
      errors.push(`Assignment blocked: This driver is currently ${driver.status} and cannot be assigned to a new trip.`);
    }

    // Check license expiry
    if (new Date(driver.licenseExpiryDate) < new Date()) {
      errors.push('Assignment blocked: The driver\'s license has expired. Please update their credentials.');
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

    const { vehicleId, driverId, cargoWeightKg, originAddress, destinationAddress, estimatedFuelCost, cargoDescription, tripNumber, revenue } = tripData;

    return prisma.trip.create({
      data: {
        tripNumber: tripNumber || undefined, // Use cuid() if not provided
        vehicleId: parseInt(vehicleId),
        driverId: parseInt(driverId),
        cargoWeightKg: parseFloat(cargoWeightKg),
        originAddress: originAddress || 'Main Hub',
        destinationAddress: destinationAddress || 'Delivery Point',
        estimatedFuelCost: parseFloat(estimatedFuelCost) || 0,
        revenue: parseFloat(revenue) || 0,
        status: 'Draft'
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
      data: { status: 'ON DUTY' }
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
        status: 'AVAILABLE',
        tripsCompleted: { increment: 1 }
      }
    });

    return updatedTrip;
  },

  // Cancel trip logic
  cancelTrip: async (tripId) => {
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(tripId) },
      include: { vehicle: true, driver: true }
    });

    if (!trip) throw new Error('Trip not found');
    if (trip.status === 'Completed') throw new Error('Cannot cancel a completed trip');

    // Update trip status
    const updatedTrip = await prisma.trip.update({
      where: { id: parseInt(tripId) },
      data: { status: 'Cancelled' }
    });

    // If it was dispatched, free up resources
    if (trip.status === 'Dispatched') {
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'Available' }
      });

      await prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' }
      });
    }

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
