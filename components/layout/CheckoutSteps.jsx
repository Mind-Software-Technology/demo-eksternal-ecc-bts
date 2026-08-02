import { FiCheck } from 'react-icons/fi'

const STEPS = [
  { n: 1, label: 'Data Pemesan' },
  { n: 2, label: 'Pembayaran' },
]

/** 2-step progress indicator for the /bayar/data → /bayar checkout flow. */
export default function CheckoutSteps({ active }) {
  return (
    <ol className="checkout-steps" aria-label="Langkah checkout">
      {STEPS.map((step) => {
        const state = step.n === active ? 'active' : step.n < active ? 'done' : 'upcoming'
        return (
          <li key={step.n} className={`checkout-step is-${state}`}>
            <span className="checkout-step__dot">
              {state === 'done' ? <FiCheck /> : step.n}
            </span>
            <span className="checkout-step__label">{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}
