import {
  ADVANCED_PROFILE_FIELDS,
  ExtraProfileField,
} from '@/lib/profile-extra-fields'

type AdvancedProfileDetailsViewProps = {
  data: Record<string, string> | null | undefined
}

export default function AdvancedProfileDetailsView({
  data,
}: AdvancedProfileDetailsViewProps) {
  const answers = data ?? {}

  const groups = ADVANCED_PROFILE_FIELDS.reduce<Record<string, ExtraProfileField[]>>(
    (acc, field) => {
      if (!answers[field.key]) return acc
      if (!acc[field.group]) acc[field.group] = []
      acc[field.group].push(field)
      return acc
    },
    {}
  )

  const groupEntries = Object.entries(groups)

  if (groupEntries.length === 0) return null

  return (
    <div className="space-y-6">
      {groupEntries.map(([groupName, fields]) => (
        <section
          key={groupName}
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{groupName}</h2>

          <div className="space-y-4">
            {fields.map((field) => {
              const rawValue = answers[field.key]
              const displayValue =
                field.type === 'select'
                  ? field.options?.find((option) => option.value === rawValue)?.label || rawValue
                  : rawValue

              return (
                <div key={field.key}>
                  <div className="text-sm font-medium text-gray-500">{field.label}</div>
                  <div className="mt-1 text-gray-800">{displayValue}</div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}