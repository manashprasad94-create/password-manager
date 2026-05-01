import { checkStrength, scoreToPercent, scoreColors } from '../lib/passwordUtils'

export default function StrengthMeter({ password }) {
  if (!password) return null

  const { score, label, color, checks } = checkStrength(password)
  const percent = scoreToPercent(score)
  const colors = scoreColors[color] || scoreColors.red

  return (
    <div className="mt-2">
      {/* Bar */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colors.bar}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${colors.text}`}>{label}</span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-0.5 mt-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className={check.passed ? 'text-green-400' : 'text-gray-600'}>
              {check.passed ? '✓' : '✗'}
            </span>
            <span className={`text-xs ${check.passed ? 'text-gray-400' : 'text-gray-600'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}