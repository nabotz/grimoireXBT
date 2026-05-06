import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Dashboard from './pages/Dashboard';
import TradeLog from './pages/TradeLog';
import TradeEntry from './pages/TradeEntry';
import TradeDetail from './pages/TradeDetail';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import SkillTree from './pages/SkillTree';
import Achievements from './pages/Achievements';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import Login from './pages/Login';
import MainLayout from './components/layout/MainLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,          element: <Dashboard /> },
      { path: 'trades',       element: <TradeLog /> },
      { path: 'trades/new',   element: <TradeEntry /> },
      { path: 'trades/:id',   element: <TradeDetail /> },
      { path: 'analytics',    element: <Analytics /> },
      { path: 'profile',      element: <Profile /> },
      { path: 'skills',       element: <SkillTree /> },
      { path: 'achievements', element: <Achievements /> },
      { path: 'journal',      element: <Journal /> },
      { path: 'settings',     element: <Settings /> },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
