/** Landing page for a role: offline roles start on the financial dashboard, online roles on /online. */
export function homeFor(role?: string) {
  return role === 'online_admin' || role === 'online_viewer' ? '/online' : '/'
}
