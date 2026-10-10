import TcpSocket from 'react-native-tcp-socket';

export const runPingTest = (host = '8.8.8.8', iterations = 4, timeoutMs = 3000) => {
  return new Promise(async (resolve) => {
    let pings = [];
    
    for (let i = 0; i < iterations; i++) {
      let startTime = Date.now();
      let isResolved = false;

      const client = TcpSocket.createConnection({ port: 53, host: host }, () => {
        if (!isResolved) {
          isResolved = true;
          pings.push(Date.now() - startTime);
          client.destroy();
        }
      });

      client.on('error', (error) => {
        if (!isResolved) {
          isResolved = true;
          client.destroy();
        }
      });

      client.setTimeout(timeoutMs, () => {
        if (!isResolved) {
          isResolved = true;
          client.destroy();
        }
      });

      // Wait a bit before next iteration if resolved quickly
      await new Promise(r => setTimeout(r, 200));
    }

    if (pings.length === 0) return resolve(null);
    
    const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
    resolve({
      avg: Math.round(avg),
      min: Math.min(...pings),
      max: Math.max(...pings)
    });
  });
};
