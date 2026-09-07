-- ============================================================
-- 26 · Contador manual de lavados ya realizados
-- ============================================================
-- Los clientes que ya venían con suscripción tienen lavados hechos
-- antes de que existiera este registro. En vez de inventar una fila
-- por cada uno con fecha falsa, se guarda el arrastre en un número.
--
-- El total mostrado es: lavados_previos + filas en subscription_washes
-- ============================================================

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS lavados_previos INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN subscriptions.lavados_previos IS
  'Lavados consumidos antes de llevar el registro detallado. Se suma a los '
  'lavados con fecha para calcular el total usado del plan.';

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions' AND column_name = 'lavados_previos';
