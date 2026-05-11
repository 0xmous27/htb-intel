import { useTargetCtx } from '../hooks/TargetContext'

const FIELDS = [
  { key: 'TARGET_IP', placeholder: '10.10.10.1' },
  { key: 'TARGET_DOMAIN', placeholder: 'corp.local' },
  { key: 'USERNAME', placeholder: 'administrator' },
  { key: 'PASSWORD', placeholder: 'P@ssw0rd' },
  { key: 'PIVOT_IP', placeholder: '172.16.0.1' },
]

export default function TargetBar() {
  const { target, setTarget } = useTargetCtx()
  return (
    <div className="target-bar">
      {FIELDS.map(({ key, placeholder }) => (
        <div key={key} className="target-field">
          <span className="target-label">{key}</span>
          <input
            className="target-input"
            value={target[key]}
            onChange={e => setTarget(p => ({ ...p, [key]: e.target.value }))}
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  )
}
