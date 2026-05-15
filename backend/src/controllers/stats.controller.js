import Order from '../models/order.model.js';
import Client from '../models/client.model.js';
import Part from '../models/part.model.js';
import logger from '../utils/logger.js';

export const getOverview = async (req, res, next) => {
  logger.contexto('Iniciando controlador getOverview');

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalClients,
      totalOrders,
      totalParts,
      ordersThisMonth,
      pendingOrders,
      revenueThisMonth,
    ] = await Promise.all([
      Client.countDocuments(),
      Order.countDocuments(),
      Part.countDocuments(),
      Order.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
      Order.countDocuments({
        status: { $nin: ['entregada', 'cancelada'] },
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            isClosed: true,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
          },
        },
      ]),
    ]);

    logger.exito('Resumen general obtenido');

    res.status(200).json({
      totalClients,
      totalOrders,
      totalParts,
      ordersThisMonth,
      pendingOrders,
      revenueThisMonth:
        revenueThisMonth.length > 0 ? revenueThisMonth[0].totalRevenue : 0,
    });
  } catch (error) {
    logger.fracaso('Error en getOverview: ', error);
    next(error);
  }
};

export const getRevenueStats = async (req, res, next) => {
  logger.contexto('Iniciando controlador getRevenueStats');

  try {
    const { period = 'monthly', from, to } = req.query;

    const now = new Date();
    let startDate, groupBy;

    if (period === 'weekly') {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay() - 56
      );
      groupBy = {
        year: { $isoWeekYear: '$createdAt' },
        week: { $isoWeek: '$createdAt' },
      };
    } else {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    }

    const pipeline = [
      {
        $match: {
          isClosed: true,
          createdAt: { $gte: startDate },
          ...(from && to
            ? { createdAt: { $gte: new Date(from), $lte: new Date(to) } }
            : {}),
        },
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$total' },
          count: { $sum: 1 },
          avgTicket: { $avg: '$total' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 },
      },
    ];

    const results = await Order.aggregate(pipeline);

    const labels = results.map((r) => {
      if (period === 'weekly') {
        return `${r._id.year}-W${String(r._id.week).padStart(2, '0')}`;
      }
      return `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
    });

    const revenue = results.map((r) => r.totalRevenue);
    const counts = results.map((r) => r.count);
    const avgTickets = results.map((r) => Math.round(r.avgTicket));

    logger.exito('Estadísticas de ingresos: %d períodos', results.length);

    res.status(200).json({
      labels,
      revenue,
      count: counts,
      avgTicket: avgTickets,
    });
  } catch (error) {
    logger.fracaso('Error en getRevenueStats: ', error);
    next(error);
  }
};

export const getMechanicProductivity = async (req, res, next) => {
  logger.contexto('Iniciando controlador getMechanicProductivity');

  try {
    const pipeline = [
      {
        $match: {
          isClosed: true,
        },
      },
      {
        $group: {
          _id: '$mechanic',
          completedOrders: { $sum: 1 },
          totalBilled: { $sum: '$total' },
          avgTicket: { $avg: '$total' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'mechanicInfo',
        },
      },
      {
        $unwind: '$mechanicInfo',
      },
      {
        $project: {
          _id: 0,
          mechanicId: '$_id',
          name: '$mechanicInfo.name',
          email: '$mechanicInfo.email',
          completedOrders: 1,
          totalBilled: 1,
          avgTicket: { $round: ['$avgTicket', 0] },
        },
      },
      {
        $sort: { totalBilled: -1 },
      },
    ];

    const results = await Order.aggregate(pipeline);

    logger.exito('Productividad de mecánicos: %d encontrados', results.length);

    res.status(200).json({ mechanics: results });
  } catch (error) {
    logger.fracaso('Error en getMechanicProductivity: ', error);
    next(error);
  }
};

export const getMostUsedParts = async (req, res, next) => {
  logger.contexto('Iniciando controlador getMostUsedParts');

  try {
    const pipeline = [
      {
        $match: {
          'partsUsed.0': { $exists: true },
        },
      },
      {
        $unwind: '$partsUsed',
      },
      {
        $group: {
          _id: '$partsUsed.part',
          totalQuantity: { $sum: '$partsUsed.quantity' },
          totalRevenue: {
            $sum: {
              $multiply: ['$partsUsed.quantity', '$partsUsed.unitPrice'],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'parts',
          localField: '_id',
          foreignField: '_id',
          as: 'partInfo',
        },
      },
      {
        $unwind: '$partInfo',
      },
      {
        $project: {
          _id: 0,
          partId: '$_id',
          sku: '$partInfo.sku',
          name: '$partInfo.name',
          totalQuantity: 1,
          totalRevenue: 1,
          currentStock: '$partInfo.stock',
          minStock: '$partInfo.minStock',
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 20,
      },
    ];

    const results = await Order.aggregate(pipeline);

    logger.exito('Repuestos más usados: %d encontrados', results.length);

    res.status(200).json({ parts: results });
  } catch (error) {
    logger.fracaso('Error en getMostUsedParts: ', error);
    next(error);
  }
};

export const getOrderStatusDistribution = async (req, res, next) => {
  logger.contexto('Iniciando controlador getOrderStatusDistribution');

  try {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ];

    const results = await Order.aggregate(pipeline);

    const labels = results.map((r) => r.status);
    const data = results.map((r) => r.count);

    logger.exito('Distribución de estados obtenida');

    res.status(200).json({ labels, data });
  } catch (error) {
    logger.fracaso('Error en getOrderStatusDistribution: ', error);
    next(error);
  }
};
