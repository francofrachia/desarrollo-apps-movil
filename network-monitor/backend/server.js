const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Endpoint para el ping HTTP (fallback) o healthcheck
app.get('/ping', (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] GET /ping - Verificación solicitada`);
  res.status(200).send('pong');
});

// Endpoint de descarga de payload (Simula archivo de X MB)
app.get('/download', (req, res) => {
  const sizeMB = parseInt(req.query.size) || 1;
  console.log(`[${new Date().toLocaleTimeString()}] GET /download - Enviando payload de ${sizeMB} MB al celular...`);
  const payloadSize = sizeMB * 1024 * 1024; // Convertir a bytes
  
  const buffer = Buffer.alloc(payloadSize, '0');
  
  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Length': payloadSize,
  });
  
  res.send(buffer);
});

// Endpoint de subida (Echo)
app.post('/upload', (req, res) => {
  const bytesReceived = req.socket.bytesRead || (req.body ? req.body.length : 0);
  console.log(`[${new Date().toLocaleTimeString()}] POST /upload - Recibiendo datos de subida del celular...`);
  res.status(200).json({ success: true, bytesReceived });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`QoS Backend Server running at http://0.0.0.0:${port}`);
  console.log(`- Ping test: GET /ping`);
  console.log(`- Download test: GET /download?size=5`);
  console.log(`- Upload test: POST /upload`);
  console.log(`-------------------------------------------------`);
  console.log(`Esperando solicitudes desde la app móvil...`);
});
