import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { CategoryPage } from './pages/CategoryPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToolPage } from './pages/ToolPage';
import { WebNavigationPage } from './pages/WebNavigationPage';

function LegacyAddressRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/addr', search, hash }} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<WebNavigationPage />} />
        <Route path="navigation" element={<Navigate to="/" replace />} />
        <Route path="tools" element={<HomePage />} />
        <Route path="category/:categoryId" element={<CategoryPage />} />
        <Route path="addr" element={<ToolPage toolId="address-generator" />} />
        <Route path="tools/address-generator" element={<LegacyAddressRedirect />} />
        <Route path="tools/:toolId" element={<ToolPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
