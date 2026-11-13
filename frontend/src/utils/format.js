const dateTime = new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' })
const date = new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' })

export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : '—')
export const formatDate = (iso) => (iso ? date.format(new Date(iso)) : '—')

export const ROLE_LABELS = { student: 'Estudiante', security: 'Seguridad', admin: 'Administrador' }
export const DEVICE_TYPES = { laptop: 'Laptop', tablet: 'Tablet', phone: 'Teléfono', otros: 'Otro' }
export const isStaff = (user) => user?.role === 'security' || user?.role === 'admin'
