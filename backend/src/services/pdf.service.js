import PDFDocument from 'pdfkit';
import logger from '../utils/logger.js';

function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString('es-CO')}`;
}

function drawHeader(doc, company) {
  const name = company.companyName || company.name || 'E-Mechanic';
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(name.toUpperCase(), { align: 'center' })
    .fontSize(10)
    .font('Helvetica')
    .text('TALLER DE MOTOCICLETAS', { align: 'center' })
    .moveDown(0.3)
    .fontSize(8)
    .text(`NIT: ${company.nit || 'N/A'}  |  ${company.address || ''}`, {
      align: 'center',
    })
    .text(`Tel: ${company.phone || 'N/A'}  |  ${company.email || ''}`, {
      align: 'center',
    })
    .moveDown(1);

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke(company.primaryColor || '#2563eb')
    .moveDown(0.8);

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('FACTURA ELECTRÓNICA', { align: 'center' })
    .moveDown(0.5);
}

function drawInvoiceInfo(doc, invoiceNumber, date) {
  const y = doc.y;
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Nº Factura:', 50, y)
    .font('Helvetica')
    .text(invoiceNumber, 130, y)
    .font('Helvetica-Bold')
    .text('Fecha:', 350, y)
    .font('Helvetica')
    .text(date, 400, y)
    .moveDown(1);
}

function drawClientInfo(doc, client) {
  doc.roundedRect(50, doc.y, 495, 55, 4).stroke('#e5e7eb');

  const startY = doc.y + 8;
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('DATOS DEL CLIENTE', 60, startY)
    .font('Helvetica')
    .fontSize(8)
    .text(`Nombre: ${client.name || 'N/A'}`, 60, doc.y + 4)
    .text(
      `Documento: ${client.cedula || client.document || 'N/A'}  |  Tel: ${client.phone || 'N/A'}`,
      60,
      doc.y + 2
    )
    .text(`Email: ${client.email || 'N/A'}`, 60, doc.y + 2)
    .moveDown(2.5);
}

function drawMotorcycleInfo(doc, motorcycle, order) {
  doc.roundedRect(50, doc.y, 495, 55, 4).stroke('#e5e7eb');

  const startY = doc.y + 8;
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('DATOS DEL VEHÍCULO', 60, startY)
    .font('Helvetica')
    .fontSize(8)
    .text(`Placa: ${motorcycle.plate || 'N/A'}`, 60, doc.y + 4)
    .text(
      `Marca/Modelo: ${motorcycle.brand || ''} ${motorcycle.model || ''}  |  Año: ${motorcycle.year || 'N/A'}  |  Km: ${Number(motorcycle.mileage || 0).toLocaleString('es-CO')}`,
      60,
      doc.y + 2
    )
    .text(
      `Orden de Trabajo: ${order._id || 'N/A'}  |  Motivo: ${order.entryReason || 'N/A'}`,
      60,
      doc.y + 2
    )
    .moveDown(2.5);
}

function drawTableHeader(doc, company) {
  const y = doc.y;
  doc.rect(50, y, 495, 18).fill(company.primaryColor || '#2563eb');

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('white')
    .text('DESCRIPCIÓN', 60, y + 5, { width: 230 })
    .text('CANT', 295, y + 5, { width: 35, align: 'center' })
    .text('VR. UNITARIO', 335, y + 5, { width: 85, align: 'right' })
    .text('VR. TOTAL', 430, y + 5, { width: 105, align: 'right' })
    .fillColor('black');

  doc.y = y + 19;
}

function drawTableRow(doc, description, quantity, unitPrice, total, isBold) {
  const y = doc.y;
  if (isBold) doc.font('Helvetica-Bold');
  else doc.font('Helvetica');

  doc
    .fontSize(8)
    .text(description, 60, y + 4, { width: 230 })
    .text(String(quantity), 295, y + 4, { width: 35, align: 'center' })
    .text(formatCurrency(unitPrice), 335, y + 4, { width: 85, align: 'right' })
    .text(formatCurrency(total), 430, y + 4, { width: 105, align: 'right' });

  doc.y = y + 18;

  if (doc.y > 680) {
    doc.addPage();
  }
}

function drawTotalBlock(
  doc,
  subtotalParts,
  subtotalLabor,
  tax,
  total,
  company
) {
  doc
    .moveDown(0.3)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke('#e5e7eb')
    .moveDown(0.8);

  const labelX = 300;
  const valueX = 430;
  const valueWidth = 105;
  const lineHeight = 20;

  const drawTotalLine = (label, value, isTotal) => {
    const y = doc.y;
    if (isTotal) {
      doc
        .rect(labelX - 5, y, valueX + valueWidth - labelX + 10, lineHeight + 4)
        .fill(company.primaryColor || '#2563eb');
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('white')
        .text(label, labelX, y + 4, { width: 120, align: 'right' })
        .text(formatCurrency(value), valueX, y + 4, {
          width: valueWidth,
          align: 'right',
        })
        .fillColor('black');
      doc.y = y + lineHeight + 6;
    } else {
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(label, labelX, y + 3, { width: 120, align: 'right' })
        .text(formatCurrency(value), valueX, y + 3, {
          width: valueWidth,
          align: 'right',
        });
      doc.y = y + lineHeight;
    }
  };

  drawTotalLine('Subtotal Repuestos:', subtotalParts);
  drawTotalLine('Subtotal Mano de Obra:', subtotalLabor);
  drawTotalLine('IVA (19%):', tax);
  doc.moveDown(0.3);
  drawTotalLine('TOTAL:', total, true);
}

function drawFooter(doc, invoiceNumber, company) {
  const bottomY = 720;
  const name = company.companyName || company.name || 'E-Mechanic';
  doc
    .fontSize(7)
    .font('Helvetica')
    .fillColor('#6b7280')
    .text(
      'Documento generado electrónicamente. No requiere firma.',
      50,
      bottomY,
      { align: 'center' }
    )
    .text(
      `Factura Nº ${invoiceNumber}  |  ${name} © ${new Date().getFullYear()}`,
      50,
      bottomY + 12,
      { align: 'center' }
    )
    .text(
      `Código único: ${invoiceNumber}  |  Verifique en su taller de confianza`,
      50,
      bottomY + 24,
      { align: 'center' }
    );
}

export async function generateInvoicePDF(invoiceData) {
  logger.contexto(
    'Iniciando generación de PDF para factura %s',
    invoiceData.invoiceNumber
  );

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        logger.exito('PDF generado exitosamente: %d bytes', buffer.length);
        resolve(buffer);
      });
      doc.on('error', reject);

      const {
        invoiceNumber,
        order,
        client,
        motorcycle,
        subtotalParts,
        subtotalLabor,
        tax,
        total,
        company,
      } = invoiceData;

      const date = new Date().toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      drawHeader(doc, company || {});
      drawInvoiceInfo(doc, invoiceNumber, date);
      drawClientInfo(doc, client || {});
      drawMotorcycleInfo(doc, motorcycle || {}, order || {});
      drawTableHeader(doc, company || {});

      if (order?.partsUsed?.length) {
        order.partsUsed.forEach((p) => {
          const partName = p.part?.name || 'Repuesto';
          drawTableRow(
            doc,
            partName,
            p.quantity,
            p.unitPrice,
            p.quantity * p.unitPrice
          );
        });
      }

      if (order?.findings?.length) {
        doc
          .moveDown(0.5)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('REPARACIÓN DE LOS SIGUIENTES HALLAZGOS', 50, doc.y)
          .moveDown(0.5);

        order.findings.forEach((f) => {
          doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .text(`• ${f.title}`, 60, doc.y);
          if (f.description) {
            doc
              .font('Helvetica')
              .text(`  ${f.description}`, 65, doc.y)
              .moveDown(0.2);
          } else {
            doc.moveDown(0.2);
          }
        });
        doc.moveDown(0.5);
      }

      if (order?.labor?.length) {
        order.labor.forEach((l) => {
          drawTableRow(doc, l.description, 1, l.cost, l.cost);
        });
      }

      if (!order?.partsUsed?.length && !order?.labor?.length) {
        drawTableRow(doc, 'Sin ítems registrados', '-', 0, 0);
      }

      drawTotalBlock(
        doc,
        subtotalParts,
        subtotalLabor,
        tax,
        total,
        company || {}
      );
      drawFooter(doc, invoiceNumber, company || {});

      doc.end();
    } catch (error) {
      logger.fracaso('Error generando PDF: %s', error.message);
      reject(error);
    }
  });
}
