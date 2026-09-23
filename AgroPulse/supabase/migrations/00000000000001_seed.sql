-- seed.sql (Datos iniciales para AgroPulse)

-- 1. Insertar Organización (Estancia Concordia)
INSERT INTO organizations (id, name, region) VALUES 
('00000000-0000-0000-0000-000000000001', 'Estancia Didáctica Concordia', 'Entre Ríos');

-- IMPORTANTE: Una vez que crees el usuario productor@agropulse.test en Supabase Auth,
-- vas a tener que insertar su ID en la tabla 'memberships' relacionándolo con esta organización:
-- INSERT INTO memberships (user_id, organization_id, role) VALUES ('<TU-UUID-ACA>', '00000000-0000-0000-0000-000000000001', 'producer');

-- 2. Insertar Lotes (Polígonos alrededor de Concordia)
INSERT INTO plots (id, organization_id, name, crop, threshold_min, threshold_max, geom) VALUES 
('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Costa 1', 'Citrus', 25, 45, ST_GeomFromText('POLYGON((-58.0173 -31.3931, -58.0150 -31.3931, -58.0150 -31.3910, -58.0173 -31.3910, -58.0173 -31.3931))', 4326)),
('11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Costa 2', 'Citrus', 25, 45, ST_GeomFromText('POLYGON((-58.0150 -31.3931, -58.0130 -31.3931, -58.0130 -31.3910, -58.0150 -31.3910, -58.0150 -31.3931))', 4326)),
('11111111-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Monte A', 'Soja', 25, 45, ST_GeomFromText('POLYGON((-58.0173 -31.3910, -58.0150 -31.3910, -58.0150 -31.3890, -58.0173 -31.3890, -58.0173 -31.3910))', 4326));

-- 3. Insertar Estaciones Meteorológicas (Simuladas)
INSERT INTO stations (id, plot_id, name, lat, lng) VALUES 
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Estación Costa 1', -31.3920, -58.0160),
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Estación Costa 2', -31.3920, -58.0140),
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', 'Estación Monte A', -31.3900, -58.0160);

-- 4. Insertar Válvulas de Riego
INSERT INTO valves (id, plot_id, name, status) VALUES 
('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Válvula Principal', 'closed'),
('33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Válvula Secundaria', 'closed'),
('33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', 'Válvula Norte', 'closed');
