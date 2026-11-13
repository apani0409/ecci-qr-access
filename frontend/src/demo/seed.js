/**
 * Sample data for demo mode. All names, IDs and serials are fictitious.
 */
export const DEMO_PASSWORD = 'Demo1234!'

export const DEMO_ACCOUNTS = [
  { role: 'student', label: 'Estudiante', email: 'estudiante@ecci.demo', hint: 'Registra sus laptops y ve su historial' },
  { role: 'security', label: 'Guarda', email: 'guarda@ecci.demo', hint: 'Escanea cualquier QR en la puerta y ve todo el historial' },
  { role: 'admin', label: 'Admin', email: 'admin@ecci.demo', hint: 'Acceso total' },
]

const user = (id, email, full_name, student_id, role, created) => ({
  id,
  email,
  password: DEMO_PASSWORD,
  full_name,
  student_id,
  role,
  is_active: true,
  biometric_enabled: false,
  dark_mode: false,
  profile_photo: null,
  created_at: created,
  updated_at: created,
})

const device = (id, user_id, name, device_type, brand, model, serial_number, qr_data, created) => ({
  id,
  user_id,
  name,
  device_type,
  brand,
  model,
  photo: null,
  serial_number,
  qr_data,
  qr_code: null, // generated on first load
  created_at: created,
  updated_at: created,
})

/** ISO timestamp `daysAgo` days back at the given local hour:minute. */
const at = (daysAgo, hour, minute) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const buildSeed = () => {
  const created = at(30, 9, 0)
  const ana = 'a0000000-0000-4000-8000-000000000001'
  const luis = 'a0000000-0000-4000-8000-000000000002'
  const maria = 'a0000000-0000-4000-8000-000000000003'
  const guard = 'a0000000-0000-4000-8000-000000000010'
  const admin = 'a0000000-0000-4000-8000-000000000020'

  const users = [
    user(ana, 'estudiante@ecci.demo', 'Ana Rodríguez', 'C10001', 'student', created),
    user(luis, 'luis@ecci.demo', 'Luis Jiménez', 'C10002', 'student', created),
    user(maria, 'maria@ecci.demo', 'María Solano', 'C10003', 'student', created),
    user(guard, 'guarda@ecci.demo', 'Carlos Mora', 'SEG0001', 'security', created),
    user(admin, 'admin@ecci.demo', 'Admin ECCI', 'ADM0001', 'admin', created),
  ]

  const anaLaptop = 'd0000000-0000-4000-8000-000000000001'
  const anaTablet = 'd0000000-0000-4000-8000-000000000002'
  const luisLaptop = 'd0000000-0000-4000-8000-000000000003'
  const mariaLaptop = 'd0000000-0000-4000-8000-000000000004'

  const devices = [
    device(anaLaptop, ana, 'Laptop personal', 'laptop', 'Lenovo', 'ThinkPad E14', 'PF-3A9K21', '7f3c1e2a-4b6d-4c1e-9a2f-3d5e8b1c0a71', created),
    device(anaTablet, ana, 'Tablet de apuntes', 'tablet', 'Apple', 'iPad 9', 'DMPX-77QL2', '1b9d4c55-8e2f-4a3b-b6c7-9d0e1f2a3b42', created),
    device(luisLaptop, luis, 'Laptop de trabajo', 'laptop', 'Dell', 'Inspiron 15', 'CN-0XK4471', '5e2a9f10-3c4d-4e5f-8a6b-7c8d9e0f1a23', created),
    device(mariaLaptop, maria, 'MacBook', 'laptop', 'Apple', 'MacBook Air M1', 'C02FX1Q2MD6', 'c4d8b733-1a2b-4c3d-9e4f-5a6b7c8d9e04', created),
  ]

  let n = 0
  const rec = (device_id, user_id, access_type, timestamp, location) => ({
    id: `r0000000-0000-4000-8000-${String(++n).padStart(12, '0')}`,
    device_id,
    user_id,
    scanned_by_id: guard,
    access_type,
    timestamp,
    location,
  })

  const records = [
    rec(anaLaptop, ana, 'entrada', at(2, 7, 52), 'Entrada principal ECCI'),
    rec(luisLaptop, luis, 'entrada', at(2, 8, 5), 'Entrada principal ECCI'),
    rec(anaLaptop, ana, 'salida', at(2, 12, 1), 'Salida ECCI'),
    rec(luisLaptop, luis, 'salida', at(2, 12, 2), 'Salida ECCI'),
    rec(mariaLaptop, maria, 'entrada', at(1, 9, 40), 'Entrada principal ECCI'),
    rec(anaTablet, ana, 'entrada', at(1, 10, 15), 'Entrada principal ECCI'),
    rec(mariaLaptop, maria, 'salida', at(1, 16, 58), 'Salida ECCI'),
    rec(anaTablet, ana, 'salida', at(1, 17, 0), 'Salida ECCI'),
    rec(anaLaptop, ana, 'entrada', at(0, 7, 45), 'Entrada principal ECCI'),
  ]

  return { users, devices, records }
}
