import Order from '../models/order.model.js';
import Settings from '../models/settings.model.js';
import logger from '../utils/logger.js';

const SERVICE_TYPE_UNITS = {
  rapido: 0.5,
  medio: 1,
  complejo: 2,
  especial: 3,
};

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export const getSchedule = async (req, res, next) => {
  logger.contexto('Iniciando controlador getSchedule');
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: 'from and to query params are required (YYYY-MM-DD)',
      });
    }

    const settings = await Settings.getSettings();
    const dailyCapacity = settings.dailyCapacityUnits || 6;
    const serviceTypes = settings.serviceTypes || [];

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const orders = await Order.find({
      scheduledDate: {
        $gte: fromDate,
        $lte: new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1),
      },
      status: { $nin: ['entregada', 'cancelada'] },
    })
      .select(
        'motorcycle client serviceType scheduledDate estimatedDays priority status'
      )
      .populate('motorcycle', 'plate brand model')
      .populate('client', 'name')
      .lean();

    const days = {};
    const current = new Date(fromDate);

    while (current <= toDate) {
      const dateKey = formatDate(current);
      const dayOrders = orders.filter(
        (o) =>
          o.scheduledDate && formatDate(new Date(o.scheduledDate)) === dateKey
      );

      const usedUnits = dayOrders.reduce(
        (sum, o) => sum + (SERVICE_TYPE_UNITS[o.serviceType] || 1),
        0
      );

      days[dateKey] = {
        usedUnits: Math.round(usedUnits * 10) / 10,
        maxUnits: dailyCapacity,
        availableUnits: Math.round((dailyCapacity - usedUnits) * 10) / 10,
        percentUsed: Math.round((usedUnits / dailyCapacity) * 100),
        isWeekend: isWeekend(current),
        orders: dayOrders.map((o) => ({
          id: o._id,
          plate: o.motorcycle?.plate,
          client: o.client?.name,
          serviceType: o.serviceType,
          units: SERVICE_TYPE_UNITS[o.serviceType] || 1,
          priority: o.priority,
          estimatedDays: o.estimatedDays,
        })),
      };

      current.setDate(current.getDate() + 1);
    }

    let nextAvailableDate = null;
    const searchDate = new Date(fromDate);
    for (let i = 0; i < 60; i++) {
      const dateKey = formatDate(searchDate);
      const dayData = days[dateKey];
      if (dayData && dayData.availableUnits > 0) {
        nextAvailableDate = dateKey;
        break;
      }
      if (!dayData && !isWeekend(searchDate)) {
        nextAvailableDate = dateKey;
        break;
      }
      searchDate.setDate(searchDate.getDate() + 1);
    }

    logger.exito('Schedule obtenido: %d días', Object.keys(days).length);

    res.status(200).json({
      config: {
        dailyCapacityUnits: dailyCapacity,
        serviceTypes,
      },
      days,
      nextAvailableDate,
    });
  } catch (error) {
    logger.fracaso('Error al obtener schedule: ', error);
    next(error);
  }
};

export const checkCapacity = async (req, res, next) => {
  logger.contexto('Iniciando controlador checkCapacity');
  try {
    const { date, serviceType } = req.query;

    if (!date || !serviceType) {
      return res
        .status(400)
        .json({ message: 'date and serviceType query params are required' });
    }

    const settings = await Settings.getSettings();
    const dailyCapacity = settings.dailyCapacityUnits || 6;
    const serviceUnits = SERVICE_TYPE_UNITS[serviceType] || 1;

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayOrders = await Order.find({
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['entregada', 'cancelada'] },
    })
      .select('serviceType')
      .lean();

    const currentUsedUnits = dayOrders.reduce(
      (sum, o) => sum + (SERVICE_TYPE_UNITS[o.serviceType] || 1),
      0
    );

    const availableUnits = dailyCapacity - currentUsedUnits;
    const canFit = availableUnits >= serviceUnits;
    const wouldExceed = !canFit;

    let suggestedDate = null;
    if (wouldExceed) {
      const searchDate = new Date(targetDate);
      for (let i = 1; i <= 30; i++) {
        searchDate.setDate(searchDate.getDate() + 1);
        if (isWeekend(searchDate)) continue;

        const sStart = new Date(searchDate);
        sStart.setHours(0, 0, 0, 0);
        const sEnd = new Date(searchDate);
        sEnd.setHours(23, 59, 59, 999);

        const sOrders = await Order.find({
          scheduledDate: { $gte: sStart, $lte: sEnd },
          status: { $nin: ['entregada', 'cancelada'] },
        })
          .select('serviceType')
          .lean();

        const sUsed = sOrders.reduce(
          (sum, o) => sum + (SERVICE_TYPE_UNITS[o.serviceType] || 1),
          0
        );

        if (dailyCapacity - sUsed >= serviceUnits) {
          suggestedDate = formatDate(searchDate);
          break;
        }
      }
    }

    const message = canFit
      ? `${formatDate(targetDate)}: ${currentUsedUnits}/${dailyCapacity} unidades — capacidad disponible`
      : `${formatDate(targetDate)} al ${Math.round((currentUsedUnits / dailyCapacity) * 100)}% de capacidad. Quedan ${availableUnits} unidades pero este servicio requiere ${serviceUnits} unidades.${suggestedDate ? ` Sugerido: ${suggestedDate}` : ''}`;

    logger.exito('Check capacity: %s', canFit ? 'disponible' : 'lleno');

    res.status(200).json({
      date: formatDate(targetDate),
      serviceType,
      serviceUnits,
      currentUsedUnits: Math.round(currentUsedUnits * 10) / 10,
      maxUnits: dailyCapacity,
      availableUnits: Math.round(availableUnits * 10) / 10,
      canFit,
      wouldExceed,
      suggestedDate,
      message,
    });
  } catch (error) {
    logger.fracaso('Error al verificar capacidad: ', error);
    next(error);
  }
};
