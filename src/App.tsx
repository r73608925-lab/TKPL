import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TournamentProvider } from './modules/core/context/TournamentContext';
import { Navbar } from './modules/core/components/Navbar';
import { Footer } from './modules/core/components/Footer';
import { HomePage } from './modules/registration/pages/HomePage';
import { RegisterPage } from './modules/registration/pages/RegisterPage';
import { RegistrationSuccessPage } from './modules/registration/pages/RegistrationSuccessPage';
import { CheckStatusPage } from './modules/registration/pages/CheckStatusPage';
import { AdminLoginPage } from './modules/admin/pages/AdminLoginPage';
import { AdminLayout } from './modules/admin/components/AdminLayout';
import { AdminOverviewPage } from './modules/admin/pages/AdminOverviewPage';
import { AdminPlayersPage } from './modules/players/pages/AdminPlayersPage';
import { AdminPlayerDetailPage } from './modules/players/pages/AdminPlayerDetailPage';
import { AdminPaymentsPage } from './modules/payments/pages/AdminPaymentsPage';
import { AdminSettingsPage } from './modules/settings/pages/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <TournamentProvider>
      <BrowserRouter>
        <div className="flex min-h-[100dvh] flex-col bg-zinc-950 text-zinc-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/registration-success" element={<RegistrationSuccessPage />} />
              <Route path="/check-status" element={<CheckStatusPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="players" element={<AdminPlayersPage />} />
                <Route path="players/:id" element={<AdminPlayerDetailPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TournamentProvider>
  );
};

export default App;
