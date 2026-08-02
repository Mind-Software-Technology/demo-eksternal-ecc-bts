import AdminGuard from '../../components/admin/AdminGuard'
import AdminSidebar from '../../components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin — ECC-BTS',
}

/** Chrome-less shell for /admin/* — no public navbar/footer, guarded by role. */
export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">{children}</main>
      </div>
    </AdminGuard>
  )
}
