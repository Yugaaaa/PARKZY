import React, { lazy, Suspense } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { CurbProvider, useCurb } from './context/CurbContext';
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard').then((module) => ({ default: module.CitizenDashboard })));
const VehicleZoneSelector = lazy(() => import('./pages/VehicleZoneSelector').then((module) => ({ default: module.VehicleZoneSelector })));
const AuthorityDashboard = lazy(() => import('./pages/AuthorityDashboard').then((module) => ({ default: module.AuthorityDashboard })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
import { AuthModal } from './components/auth/AuthModal';

function AppRoutes() {
  const { isAuthenticated, currentUser } = useCurb();
  const [location] = useLocation();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sand-150 dark:bg-graphite-dark text-graphite dark:text-sand-100 flex items-center justify-center p-6">
          <div role="status" className="rounded-2xl border border-line bg-paper px-5 py-4 text-sm font-semibold shadow-curb">
            Loading CurbSense…
          </div>
        </div>
      }
    >
      <Switch>
      {/* Surface 1: Root Route — Displays Login if unauthenticated, Citizen Dashboard if citizen, or Authority Dashboard if admin */}
      <Route path="/">
        {!isAuthenticated ? (
          <LoginPage />
        ) : currentUser.role === 'admin' ? (
          <Redirect to="/authority" />
        ) : (
          <CitizenDashboard />
        )}
      </Route>

      {/* Surface 2: Dedicated /login route fallback */}
      <Route path="/login">
        {isAuthenticated ? (
          currentUser.role === 'admin' ? (
            <Redirect to="/authority" />
          ) : (
            <Redirect to="/citizen" />
          )
        ) : (
          <LoginPage />
        )}
      </Route>

      {/* Surface 3: Citizen Dashboard */}
      <Route path="/citizen">
        {!isAuthenticated ? (
          <Redirect to="/?redirect=/citizen" />
        ) : currentUser.role === 'admin' ? (
          <Redirect to="/authority" />
        ) : (
          <CitizenDashboard />
        )}
      </Route>

      {/* Surface 4: Focused Vehicle & Zone Booking Flow */}
      <Route path="/vehicle-selector">
        {!isAuthenticated ? (
          <Redirect to="/?redirect=/vehicle-selector" />
        ) : currentUser.role === 'admin' ? (
          <Redirect to="/authority" />
        ) : (
          <VehicleZoneSelector />
        )}
      </Route>

      {/* Surface 5: Gated Municipal Authority Operations Console */}
      <Route path="/authority">
        {!isAuthenticated ? (
          <Redirect to="/?mode=authority&redirect=/authority" />
        ) : (
          <AuthorityDashboard />
        )}
      </Route>

      {/* Fallback route for all other paths: redirects unauthenticated users to '/' with query param */}
      <Route>
        {!isAuthenticated ? (
          <Redirect to={`/?redirect=${encodeURIComponent(location)}`} />
        ) : currentUser.role === 'admin' ? (
          <Redirect to="/authority" />
        ) : (
          <Redirect to="/" />
        )}
      </Route>
      </Switch>
    </Suspense>
  );
}

export function App() {
  return (
    <CurbProvider>
      <AppRoutes />
      <AuthModal />
    </CurbProvider>
  );
}

export default App;
