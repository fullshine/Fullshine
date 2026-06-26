'use client'

export default function AgendaDatePicker({ defaultDate }: { defaultDate: string }) {
  return (
    <input
      type="date"
      defaultValue={defaultDate}
      onChange={e => { window.location.href = `/admin/agenda?date=${e.target.value}` }}
      className="input-field w-auto"
    />
  )
}
