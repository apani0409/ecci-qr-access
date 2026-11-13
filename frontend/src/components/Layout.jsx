import { Navigation } from './Navigation'

export const Layout = ({ title, actions, children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navigation />
    <main className="container py-8 sm:py-12">
      {(title || actions) && (
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
          )}
          {actions}
        </div>
      )}
      {children}
    </main>
  </div>
)

export const Alert = ({ type = 'error', children }) =>
  children ? (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`px-4 py-3 rounded mb-6 border ${
        type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200'
          : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200'
      }`}
    >
      {children}
    </div>
  ) : null
