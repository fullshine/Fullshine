import { classify, isOptOut, wantsHuman, isBusinessHour, welcome } from '@/lib/campaigns/rules'

describe('Campañas Fullshine', () => {
  test.each([
    ['Quiero pulido + limpieza de tapiz', 'pulido_tapiz'],
    ['TRATAMIENTO CERÁMICO para SUV', 'ceramico'],
    ['Hola, quiero precio', 'unknown'],
    ['¿Pulido y tapiz o cerámico?', 'unknown'],
    ['Pulido de focos', 'unknown'],
  ])('clasifica sin adivinar: %s', (input, expected) => expect(classify(input)).toBe(expected))
  test.each(['No me interesa', 'No me escribas más', 'STOP', 'Quiero darme de baja'])('detiene contacto: %s', s => expect(isOptOut(s)).toBe(true))
  it('no confunde una consulta con baja', () => expect(isOptOut('¿Me interesa el cerámico?')).toBe(false))
  it('deriva a una persona', () => expect(wantsHuman('Quiero hablar con Juan')).toBe(true))
  it('no promete precio, cupo ni reserva en la bienvenida', () => {
    expect(welcome('pulido_tapiz')).toContain('marca, modelo y año')
    expect(welcome('ceramico')).not.toMatch(/\$|confirmada|últimos cupos/)
  })
  test.each([
    ['2026-11-17T11:59:00Z', false], // 08:59 Chile en verano
    ['2026-11-17T12:00:00Z', true],
    ['2026-11-17T22:00:00Z', false],
    ['2026-11-21T16:59:00Z', true],
    ['2026-11-21T17:00:00Z', false],
    ['2026-11-22T15:00:00Z', false],
    ['2026-06-16T12:30:00Z', false], // 08:30 Chile en invierno
    ['2026-06-16T13:00:00Z', true],
  ])('respeta horario local %s', (input, expected) => expect(isBusinessHour(new Date(input))).toBe(expected))
})
