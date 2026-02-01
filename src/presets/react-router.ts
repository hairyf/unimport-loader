import type { InlinePreset } from 'unimport'

/** Only compatible with React Router v6 */
export const reactRouterHooks = [
  'useOutletContext',
  'useHref',
  'useInRouterContext',
  'useLocation',
  'useNavigationType',
  'useNavigate',
  'useOutlet',
  'useParams',
  'useResolvedPath',
  'useRoutes',
]

export const reactRouter: InlinePreset = {
  from: 'react-router',
  imports: [...reactRouterHooks],
}
