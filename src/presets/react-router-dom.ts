import type { InlinePreset } from 'unimport'
import { reactRouterHooks } from './react-router'

/** Only compatible with React Router Dom v6 */
export const reactRouterDom: InlinePreset = {
  from: 'react-router-dom',
  imports: [
    ...reactRouterHooks,
    'useLinkClickHandler',
    'useSearchParams',
    'Link',
    'NavLink',
    'Navigate',
    'Outlet',
    'Route',
    'Routes',
  ],
}
