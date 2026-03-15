import { version } from '../../package.json';
import { lazyWithPreload } from '../utils/chunkLoadRecovery';

const createRouteModule = (importer, contextName) => lazyWithPreload(importer, {
    buildId: version,
    contextName,
});

export const InspirationRoute = createRouteModule(
    () => import('../features/lifecycle/InspirationModule'),
    'route-inspiration'
);

export const WritingRoute = createRouteModule(
    () => import('../features/lifecycle/WritingModule'),
    'route-writing'
);

export const InspirationArchiveRoute = createRouteModule(
    () => import('../features/lifecycle/InspirationArchiveModule'),
    'route-inspiration-archive'
);

export const PendingRoute = createRouteModule(
    () => import('../features/lifecycle/PendingModule'),
    'route-pending'
);

export const PrimaryDevRoute = createRouteModule(
    () => import('../features/lifecycle/PrimaryDevModule'),
    'route-primary-dev'
);

export const AdvancedDevRoute = createRouteModule(
    () => import('../features/lifecycle/AdvancedDevModule'),
    'route-advanced-dev'
);

export const CommandCenterRoute = createRouteModule(
    () => import('../features/blueprint/CommandCenterModule'),
    'route-command-center'
);

export const DataCenterRoute = createRouteModule(
    () => import('../features/lifecycle/DataCenterModule'),
    'route-data-center'
);

export const ShareViewRoute = createRouteModule(
    () => import('../features/share/components/ShareViewPage'),
    'route-share-view'
);

export const ShareReceiverRoute = createRouteModule(
    () => import('../features/share/ShareReceiver'),
    'route-share-receiver'
);

export const UserIdentityRoute = createRouteModule(
    () => import('../features/auth/UserIdentityPage'),
    'route-user-identity'
);

const navbarRoutePreloaders = [
    { path: '/inspiration', preload: InspirationRoute.preload },
    { path: '/writing', preload: WritingRoute.preload },
    { path: '/sprout', preload: PendingRoute.preload },
    { path: '/flow', preload: PrimaryDevRoute.preload },
    { path: '/blueprint', preload: CommandCenterRoute.preload },
    { path: '/data', preload: DataCenterRoute.preload },
    { path: '/advanced', preload: AdvancedDevRoute.preload },
];

export const idleRoutePreloaders = [
    WritingRoute.preload,
    PendingRoute.preload,
    PrimaryDevRoute.preload,
    CommandCenterRoute.preload,
    DataCenterRoute.preload,
];

export function preloadNavbarRoute(pathname) {
    const matchedRoute = navbarRoutePreloaders.find(({ path }) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    return matchedRoute?.preload?.() || Promise.resolve();
}
