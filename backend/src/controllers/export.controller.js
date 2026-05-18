import Order from '../models/order.model.js';
import Part from '../models/part.model.js';
import logger from '../utils/logger.js';

export const exportOrdersCSV = async (req, res, next) => {
  logger.contexto('Exportando órdenes a CSV');
  try {
    const orders = await Order.find().populate('motorcycle', 'plate brand model').populate('client', 'name').populate('mechanic', 'name').lean();
    const header = 'ID,Moto,Cliente,Mecánico,Estado,Motivo,Fecha,Subtotal Parts,Subtotal Labor,IVA,Total\n';
    const rows = orders.map(o =>
      `${o._id},${o.motorcycle?.plate || ''},${o.client?.name || ''},${o.mechanic?.name || ''},${o.status},${(o.entryReason || '').replace(/,/g, ';')},${o.createdAt?.toISOString()},${o.subtotalParts || 0},${o.subtotalLabor || 0},${o.tax || 0},${o.total || 0}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ordenes.csv');
    res.send(header + rows);
  } catch (error) {
    logger.fracaso('Error exportando CSV: ', error);
    next(error);
  }
};

export const exportPartsCSV = async (req, res, next) => {
  logger.contexto('Exportando inventario a CSV');
  try {
    const parts = await Part.find().lean();
    const header = 'SKU,Nombre,Marca,Precio Compra,Precio Venta,Stock,Stock Mínimo\n';
    const rows = parts.map(p =>
      `${p.sku},${(p.name || '').replace(/,/g, ';')},${p.brand || ''},${p.purchasePrice},${p.salePrice},${p.stock},${p.minStock}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario.csv');
    res.send(header + rows);
  } catch (error) {
    logger.fracaso('Error exportando CSV: ', error);
    next(error);
  }
};
