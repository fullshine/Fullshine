import { isOctoberCampaignActive, buildOctoberCampaignPrompt, OCTOBER_CAMPAIGN } from '@/lib/agent/october-campaign'

describe('Campaña octubre: fecha de reserva en Chile', () => {
  test('incluye el último segundo de octubre, aunque UTC ya sea noviembre', () => {
    expect(isOctoberCampaignActive(new Date('2026-11-01T02:59:59.999Z'))).toBe(true)
    expect(isOctoberCampaignActive(new Date('2026-11-01T03:00:00Z'))).toBe(false)
  })
  test('no ofrece la promoción antes de su inicio', () => {
    expect(isOctoberCampaignActive(new Date('2026-10-21T02:59:59Z'))).toBe(false)
  })
  test('mantiene importes exactos, incluyendo XL', () => {
    expect(OCTOBER_CAMPAIGN.prices).toEqual({hatch_sedan:169990, suv_camioneta:189000, pickup_xl:209990})
    const prompt = buildOctoberCampaignPrompt(new Date('2026-10-22T12:00:00Z'))
    expect(prompt).toContain('$169.990')
    expect(prompt).toContain('$189.000')
    expect(prompt).toContain('$209.990')
    expect(prompt).toContain('4Runner')
    expect(prompt).toContain('el servicio puede realizarse después')
  })
  test('al vencer no cotiza precios de campaña y permite verificar reservas anteriores', () => {
    const prompt = buildOctoberCampaignPrompt(new Date('2026-11-01T03:00:00Z'))
    expect(prompt).not.toContain('$169.990')
    expect(prompt).toContain('reserva promocional previa')
  })
})
