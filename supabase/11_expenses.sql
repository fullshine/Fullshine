-- Tabla de gastos operacionales
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category     TEXT NOT NULL CHECK (category IN ('ayudante','insumos','herramientas','otros')),
  description  TEXT,
  amount       INTEGER NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
