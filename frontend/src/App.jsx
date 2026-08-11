import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingState from './components/LoadingState';
import AdminUnlockGate from './components/AdminUnlockGate';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CapabilitiesPage = lazy(() => import('./pages/CapabilitiesPage'));
const PeoplePage = lazy(() => import('./pages/PeoplePage'));
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const InsightDetailPage = lazy(() => import('./pages/InsightDetailPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const MissionPage = lazy(() => import('./pages/MissionPage'));
const VisionPage = lazy(() => import('./pages/VisionPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const CapabilityDetailPage = lazy(() => import('./pages/CapabilityDetailPage'));
const ArticleEditorPage = lazy(() => import('./pages/ArticleEditorPage'));
const AdminMessagesPage = lazy(() => import('./pages/AdminMessagesPage'));

function PageLoader() {
  return (
    <div style={{ padding: '4rem 1rem' }}>
      <LoadingState label="Loading page..." />
    </div>
  );
}

export default function App() {
  return (
    <>
      <AdminUnlockGate />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route
              path="news/add"
              element={
                <ProtectedAdminRoute>
                  <ArticleEditorPage kind="news" />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="news/edit"
              element={
                <ProtectedAdminRoute>
                  <ArticleEditorPage kind="news" action="edit" />
                </ProtectedAdminRoute>
              }
            />
            <Route path="news/:slug" element={<NewsDetailPage />} />
            <Route path="services" element={<CapabilitiesPage />} />
            <Route path="services/:id" element={<CapabilityDetailPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/:id" element={<PersonDetailPage />} />
            <Route path="insight" element={<KnowledgePage />} />
            <Route
              path="insight/add"
              element={
                <ProtectedAdminRoute>
                  <ArticleEditorPage kind="insight" />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="insight/edit"
              element={
                <ProtectedAdminRoute>
                  <ArticleEditorPage kind="insight" action="edit" />
                </ProtectedAdminRoute>
              }
            />
            <Route path="insight/:slug" element={<InsightDetailPage />} />
            <Route path="careers" element={<CareersPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route
              path="admin/messages"
              element={
                <ProtectedAdminRoute>
                  <AdminMessagesPage />
                </ProtectedAdminRoute>
              }
            />
            <Route path="mission" element={<MissionPage />} />
            <Route path="vision" element={<VisionPage />} />
            <Route path="capabilities" element={<Navigate to="/services" replace />} />
            <Route path="knowledge" element={<Navigate to="/insight" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

