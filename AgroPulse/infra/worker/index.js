import { Kafka } from 'kafkajs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:19092';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const kafka = new Kafka({
  clientId: 'agropulse-worker',
  brokers: [KAFKA_BROKERS]
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'agropulse-group' });

const moistureState = {};

async function start() {
  console.log('Iniciando AgroPulse IoT Worker (Modo Anti-Fallos)...');
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'soil.moisture', fromBeginning: false });

  // 1. POLLING DE COMANDOS (A prueba de balas)
  setInterval(async () => {
    const { data: commands } = await supabase.from('irrigation_commands').select('*').eq('status', 'pending');
    if (commands && commands.length > 0) {
      for (const command of commands) {
        // Bloquearlo para no procesarlo dos veces
        await supabase.from('irrigation_commands').update({ status: 'processing' }).eq('id', command.id);
        console.log(`\n[COMANDO RECIBIDO] Válvula: ${command.valve_id} | Acción: ${command.action}`);
        
        // Simular 3 segundos de demora de la válvula física
        setTimeout(async () => {
          await supabase.from('irrigation_commands').update({ status: 'applied', applied_at: new Date() }).eq('id', command.id);
          const valveStatus = command.action === 'close' ? 'closed' : 'open';
          await supabase.from('valves').update({ status: valveStatus }).eq('id', command.valve_id);
          console.log(`[EXITO] Válvula físicamente movida a: ${valveStatus.toUpperCase()}`);
        }, 3000);
      }
    }
  }, 2000);

  // 2. SIMULADOR DE SENSORES (Generación de telemetría IoT)
  setInterval(async () => {
    const { data: stations } = await supabase.from('stations').select('id, name');
    if (!stations) return;

    for (let station of stations) {
      if (!moistureState[station.id]) {
         // Inicializar líneas base ambientales dependiendo de la topografía simulada
         if (station.name.includes('Costa 1')) moistureState[station.id] = 18 + Math.random() * 3; 
         else if (station.name.includes('Costa 2')) moistureState[station.id] = 35 + Math.random() * 5; 
         else moistureState[station.id] = 48 + Math.random() * 3; 
      } else {
         const change = (Math.random() - 0.5) * 0.5;
         moistureState[station.id] = Math.max(0, Math.min(100, moistureState[station.id] + change));
      }

      const payload = {
        station_id: station.id,
        moisture_pct: parseFloat(moistureState[station.id].toFixed(2)),
        temp_c: 20,
        ts: new Date()
      };
      await producer.send({ topic: 'soil.moisture', messages: [{ value: JSON.stringify(payload) }] });
    }
  }, 5000);

  // 3. CONSUMIDOR DE KAFKA
  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (topic === 'soil.moisture') {
        const data = JSON.parse(message.value.toString());
        await supabase.from('readings').insert({
          station_id: data.station_id,
          moisture_pct: data.moisture_pct,
          temp_c: data.temp_c,
          measured_at: data.ts,
          source: 'sensor'
        });
        console.log(`[KAFKA] Humedad: ${data.moisture_pct}% guardada en Supabase.`);
      }
    }
  });
}

start().catch(console.error);
