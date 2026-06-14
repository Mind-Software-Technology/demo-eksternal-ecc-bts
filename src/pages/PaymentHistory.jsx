import { Link } from 'react-router-dom'
import { FiClock, FiCheckCircle, FiArrowRight, FiFileText } from 'react-icons/fi'
import Page from '../components/layout/Page'
import PageHero from '../components/sections/PageHero'
import Reveal from '../components/ui/Reveal'
import { getPayments } from '../data/payments'
import { formatIDR } from '../data/format'

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

export default function PaymentHistory() {
  const payments = getPayments()

  return (
    <Page title="Riwayat Pembayaran — ECC-BTS">
      <PageHero
        title="Riwayat Pembayaran"
        crumb="Riwayat Pembayaran"
        subtitle="Pantau status dan riwayat transaksi pembayaran Anda."
      />

      <section className="section">
        <div className="container">
          {payments.length === 0 ? (
            <Reveal className="cart-empty">
              <FiFileText className="cart-empty__ic" />
              <h2>Belum ada riwayat pembayaran</h2>
              <p>
                Setelah Anda menyelesaikan pembayaran, transaksinya akan tampil
                di sini.
              </p>
              <Link to="/produk" className="btn btn--blue btn--lg">
                Mulai Belanja <FiArrowRight />
              </Link>
            </Reveal>
          ) : (
            <div className="pay-history">
              {payments.map((p, i) => (
                <Reveal className="pay-record" key={p.invoice} delay={i * 0.05}>
                  <div className="pay-record__top">
                    <div>
                      <span className="pay-record__inv">Invoice #{p.invoice}</span>
                      <span className="pay-record__date">
                        <FiClock /> {fmtDate(p.paidAt)} WIB
                      </span>
                    </div>
                    <span className="pay-status pay-status--ok">
                      <FiCheckCircle /> Berhasil
                    </span>
                  </div>

                  <p className="pay-record__desc">{p.description}</p>

                  <ul className="pay-record__items">
                    {p.items.map((it) => (
                      <li key={it.title}>
                        <span>
                          {it.title}
                          {it.qty > 1 && <em> × {it.qty}</em>}
                        </span>
                        <b>{formatIDR(it.lineTotal)}</b>
                      </li>
                    ))}
                  </ul>

                  <div className="pay-record__foot">
                    <span className="pay-record__method">
                      Metode: {p.method}
                    </span>
                    <span className="pay-record__total">
                      Total <b>{formatIDR(p.total)}</b>
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </Page>
  )
}
