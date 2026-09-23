-- 00000000000000_init.sql
-- Habilitar PostGIS para polígonos
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Tablas
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT
);

CREATE TABLE memberships (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('producer', 'operator', 'advisor')),
    PRIMARY KEY (user_id, organization_id)
);

CREATE TABLE plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    crop TEXT,
    geom GEOMETRY(Polygon, 4326),
    threshold_min INT DEFAULT 25,
    threshold_max INT DEFAULT 45
);

CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL
);

CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL,
    moisture_pct FLOAT,
    temp_c FLOAT,
    rain_mm FLOAT,
    source TEXT NOT NULL CHECK (source IN ('sensor', 'manual'))
);
-- Índice solicitado en la rúbrica
CREATE INDEX idx_readings_station_measured ON readings(station_id, measured_at DESC);

CREATE TABLE valves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'closed'
);

CREATE TABLE irrigation_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    valve_id UUID NOT NULL REFERENCES valves(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL CHECK (action IN ('open', 'close', 'open_duration')),
    duration_min INT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'failed', 'cancelled')) DEFAULT 'pending',
    client_request_id UUID UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    applied_at TIMESTAMPTZ
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Habilitar Realtime para tablas clave
ALTER PUBLICATION supabase_realtime ADD TABLE readings, valves, irrigation_commands, alerts;

-- 2. Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE valves ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (Todos los miembros pueden leer los datos de su organización)
CREATE POLICY "Users can read own memberships" ON memberships FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read plots in their org" ON plots FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Users can read stations of their plots" ON stations FOR SELECT USING (
    plot_id IN (SELECT id FROM plots WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can read readings of their stations" ON readings FOR SELECT USING (
    station_id IN (SELECT id FROM stations WHERE plot_id IN (SELECT id FROM plots WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())))
);

CREATE POLICY "Users can read valves of their plots" ON valves FOR SELECT USING (
    plot_id IN (SELECT id FROM plots WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can read commands of their valves" ON irrigation_commands FOR SELECT USING (
    valve_id IN (SELECT id FROM valves WHERE plot_id IN (SELECT id FROM plots WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())))
);

-- Políticas de Escritura (Solo producer y operator)
-- Editar lotes (umbrales)
CREATE POLICY "Producers and operators can update plots" ON plots FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('producer', 'operator'))
);

-- Insertar lecturas manuales
CREATE POLICY "Members can insert manual readings" ON readings FOR INSERT WITH CHECK (
    source = 'manual' AND
    station_id IN (SELECT id FROM stations WHERE plot_id IN (SELECT id FROM plots WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())))
);

-- Insertar comandos
CREATE POLICY "Producers and operators can insert commands" ON irrigation_commands FOR INSERT WITH CHECK (
    requested_by = auth.uid() AND
    valve_id IN (SELECT id FROM valves WHERE plot_id IN (SELECT id FROM plots WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('producer', 'operator'))))
);
