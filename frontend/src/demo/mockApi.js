/**
 * Demo mode: an axios adapter that emulates the FastAPI backend in the browser.
 *
 * It mirrors the backend's rules (see backend/app/services/*):
 *  - public sign-up always creates a student
 *  - students manage and scan only their own devices
 *  - security/admin scan any device and see the full history
 *  - same status codes: 401 / 403 / 404 / 409 / 422
 *
 * Data lives in this browser's localStorage only. Nothing is sent anywhere.
 */
import { AxiosError } from 'axios'
import QRCode from 'qrcode'
import { DEMO_PASSWORD, buildSeed } from './seed'

const STORAGE_KEY = 'ecci-demo-db-v2'
const TOKEN_PREFIX = 'demo-token.'

// ---------------------------------------------------------------- storage

let memoryDb = null // fallback when localStorage is unavailable (private mode)

const loadDb = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    if (memoryDb) return memoryDb
  }
  if (memoryDb) return memoryDb
  const seed = buildSeed()
  for (const device of seed.devices) device.qr_code = await toQr(device.qr_data)
  saveDb(seed)
  return seed
}

const saveDb = (db) => {
  memoryDb = db
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    /* keep in memory only */
  }
}

export const resetDemoData = () => {
  memoryDb = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** Devices of every user, for the "simulate a scan" helper on the scan page. */
export const listAllDemoDevices = async () => {
  const db = await loadDb()
  return db.devices.map((d) => ({
    ...d,
    owner_name: db.users.find((u) => u.id === d.user_id)?.full_name,
  }))
}

const toQr = (data) => QRCode.toDataURL(data, { margin: 2, width: 256 })

// ---------------------------------------------------------------- helpers

class HttpError extends Error {
  constructor(status, detail) {
    super(detail)
    this.status = status
  }
}

const isStaff = (user) => user.role === 'security' || user.role === 'admin'
const now = () => new Date().toISOString()
const uuid = () =>
  crypto.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

const publicUser = ({ password, ...user }) => user // never expose the password

const requireUser = (db, headers) => {
  const auth = headers?.Authorization || headers?.authorization || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token.startsWith(TOKEN_PREFIX)) throw new HttpError(401, 'Not authenticated')
  const user = db.users.find((u) => u.id === token.slice(TOKEN_PREFIX.length))
  if (!user) throw new HttpError(401, 'User not found')
  return user
}

const tokenResponse = (user) => ({
  access_token: TOKEN_PREFIX + user.id,
  token_type: 'bearer',
  user: publicUser(user),
})

const ownedDevice = (db, id, user) => {
  const device = db.devices.find((d) => d.id === id)
  if (!device) throw new HttpError(404, 'Device not found')
  if (device.user_id !== user.id) throw new HttpError(403, 'Not authorized to access this device')
  return device
}

const serializeRecord = (db, r) => {
  const device = db.devices.find((d) => d.id === r.device_id)
  return {
    ...r,
    device_name: device?.name ?? null,
    device_serial_number: device?.serial_number ?? null,
    user_name: db.users.find((u) => u.id === r.user_id)?.full_name ?? null,
    scanned_by_name: db.users.find((u) => u.id === r.scanned_by_id)?.full_name ?? null,
  }
}

const history = (db, records, limit) =>
  [...records]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
    .map((r) => serializeRecord(db, r))

const parseLimit = (params) => {
  const limit = Number(params.get('limit') ?? 100)
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new HttpError(422, 'Validation error')
  return limit
}

const requireFields = (body, fields) => {
  for (const [field, min] of fields) {
    if (typeof body[field] !== 'string' || body[field].trim().length < min) {
      throw new HttpError(422, `Campo inválido: ${field}`)
    }
  }
}

// ---------------------------------------------------------------- routes

const routes = [
  ['POST', /^\/auth\/register$/, (db, { body }) => {
    requireFields(body, [['email', 3], ['password', 8], ['full_name', 3], ['student_id', 5]])
    const email = body.email.trim().toLowerCase()
    if (db.users.some((u) => u.email === email || u.student_id === body.student_id)) {
      throw new HttpError(409, 'Email or student ID already registered')
    }
    const user = {
      id: uuid(),
      email,
      password: body.password,
      full_name: body.full_name,
      student_id: body.student_id,
      role: 'student', // never self-assigned, same as the backend
      is_active: true,
      biometric_enabled: false,
      dark_mode: false,
      profile_photo: null,
      created_at: now(),
      updated_at: now(),
    }
    db.users.push(user)
    return [201, tokenResponse(user)]
  }],

  ['POST', /^\/auth\/login$/, (db, { body }) => {
    const user = db.users.find((u) => u.email === String(body.email || '').trim().toLowerCase())
    if (!user || user.password !== body.password) throw new HttpError(401, 'Invalid email or password')
    return [200, tokenResponse(user)]
  }],

  ['GET', /^\/(auth|users)\/me$/, (db, { user }) => [200, publicUser(user)]],

  ['GET', /^\/devices\/?$/, (db, { user }) => [
    200,
    db.devices.filter((d) => d.user_id === user.id).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  ]],

  ['POST', /^\/devices\/?$/, async (db, { body, user }) => {
    requireFields(body, [['name', 3], ['device_type', 3], ['serial_number', 5]])
    if (db.devices.some((d) => d.serial_number === body.serial_number)) {
      throw new HttpError(409, 'Device with this serial number already exists')
    }
    const qr_data = uuid()
    const device = {
      id: uuid(),
      user_id: user.id,
      name: body.name,
      device_type: body.device_type,
      brand: body.brand || null,
      model: body.model || null,
      photo: null,
      serial_number: body.serial_number,
      qr_data,
      qr_code: await toQr(qr_data),
      created_at: now(),
      updated_at: now(),
    }
    db.devices.push(device)
    return [201, { device, qr_image_base64: device.qr_code }]
  }],

  ['GET', /^\/devices\/([^/]+)\/qr$/, (db, { user, match }) => {
    const device = ownedDevice(db, match[1], user)
    return [200, { device_id: device.id, qr_data: device.qr_data, qr_image_base64: device.qr_code }]
  }],

  ['GET', /^\/devices\/([^/]+)$/, (db, { user, match }) => [200, ownedDevice(db, match[1], user)]],

  ['PUT', /^\/devices\/([^/]+)$/, (db, { user, match, body }) => {
    const device = ownedDevice(db, match[1], user)
    if (body.serial_number && body.serial_number !== device.serial_number &&
        db.devices.some((d) => d.serial_number === body.serial_number)) {
      throw new HttpError(409, 'Device with this serial number already exists')
    }
    for (const field of ['name', 'device_type', 'brand', 'model', 'serial_number']) {
      if (body[field] != null) device[field] = body[field]
    }
    device.updated_at = now()
    return [200, device]
  }],

  ['DELETE', /^\/devices\/([^/]+)$/, (db, { user, match }) => {
    const device = ownedDevice(db, match[1], user)
    db.devices = db.devices.filter((d) => d.id !== device.id)
    db.records = db.records.filter((r) => r.device_id !== device.id) // ON DELETE CASCADE
    return [204, null]
  }],

  ['POST', /^\/access\/scan$/, (db, { user, body }) => {
    if (!['entrada', 'salida'].includes(body.access_type)) {
      throw new HttpError(422, "Invalid access type; expected 'entrada' or 'salida'")
    }
    const device = db.devices.find((d) => d.qr_data === String(body.qr_data || '').trim())
    if (!device) throw new HttpError(404, 'Device not found')
    if (!isStaff(user) && device.user_id !== user.id) {
      throw new HttpError(403, 'No autorizado para registrar este dispositivo')
    }
    const record = {
      id: uuid(),
      device_id: device.id,
      user_id: device.user_id,
      scanned_by_id: user.id,
      access_type: body.access_type,
      timestamp: now(),
      location: body.location || null,
    }
    db.records.push(record)
    return [201, serializeRecord(db, record)]
  }],

  ['GET', /^\/access\/history$/, (db, { user, params }) => {
    const records = isStaff(user) ? db.records : db.records.filter((r) => r.user_id === user.id)
    return [200, history(db, records, parseLimit(params))]
  }],

  ['GET', /^\/access\/device\/([^/]+)\/history$/, (db, { user, match, params }) => {
    const device = db.devices.find((d) => d.id === match[1])
    if (!device) throw new HttpError(404, 'Device not found')
    if (!isStaff(user) && device.user_id !== user.id) {
      throw new HttpError(403, "Not authorized to view this device's access history")
    }
    return [200, history(db, db.records.filter((r) => r.device_id === device.id), parseLimit(params))]
  }],
]

const PUBLIC = new Set(['/auth/register', '/auth/login'])

// ---------------------------------------------------------------- adapter

export const demoAdapter = async (config) => {
  const url = new URL(config.url, 'http://demo.local/')
  const path = url.pathname.replace(/^\/api/, '')
  const method = config.method.toUpperCase()
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {}

  // Small delay so loading states are visible, like a real network call
  await new Promise((resolve) => setTimeout(resolve, 150))

  let status
  let data
  try {
    const db = await loadDb()
    const route = routes.find(([m, re]) => m === method && re.test(path))
    if (!route) throw new HttpError(404, 'Not Found')
    const user = PUBLIC.has(path) ? null : requireUser(db, config.headers)
    ;[status, data] = await route[2](db, { body, user, params: url.searchParams, match: path.match(route[1]) })
    saveDb(db)
  } catch (err) {
    if (!(err instanceof HttpError)) throw err
    status = err.status
    data = { detail: err.message }
  }

  const response = { data, status, statusText: String(status), headers: {}, config, request: {} }
  if (status >= 400) {
    throw new AxiosError(data.detail, status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, null, response)
  }
  return response
}

export { DEMO_PASSWORD }
