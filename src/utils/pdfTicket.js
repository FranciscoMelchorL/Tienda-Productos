import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';

export async function generarPDFVenta({ productos, total, fecha, nombreArchivo }) {
  // Construir HTML para el ticket
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background: #eee; }
          .total { font-weight: bold; color: #228b22; }
        </style>
      </head>
      <body>
        <h2>Ticket de venta</h2>
        <p>Fecha: ${fecha}</p>
        <table>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
          ${productos.map(p => `
            <tr>
              <td>${p.nombre}</td>
              <td>${p.cantidad}</td>
              <td>$${p.precio}</td>
              <td>$${(p.precio * p.cantidad).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <p class="total">Total: $${total.toFixed(2)}</p>
      </body>
    </html>
  `;

  // Generar PDF
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  // Solicitar permisos y guardar en almacenamiento
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') throw new Error('Permiso de almacenamiento denegado');

  const asset = await MediaLibrary.createAssetAsync(uri);
  await MediaLibrary.createAlbumAsync('Tickets', asset, false);

  // Renombrar archivo
  // Expo no permite renombrar directamente, pero el nombre se puede usar para registro
  return asset;
}
