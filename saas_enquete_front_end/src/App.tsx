import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import InviteListPage from "./pages/InviteListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SignupTenantPage from "./pages/SignupTenantPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";

import RegionPage from "./pages/RegionPage";
import DepartementPage from "./pages/DepartementPage";
import SectorPage from "./pages/SectorPage";
import VillagePage from "./pages/VallagePage";

import AppNavbar from "./components/common/Navbar";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import SurveyListPage from "./pages/surveys/SurveyListPage";
import SurveyQuestionsPage from "./pages/questions/SurveyQuestionsPage";
import SurveyCreatePage from "./pages/surveys/SurveyCreatePage";
import SurveyDetailPage from "./pages/surveys/SurveyDetailPage";
import SurveyEditPage from "./pages/surveys/SurveyEditPage";
import RespondentListPage from "./pages/respondents/RespondentListPage";
import RespondentCreatePage from "./pages/respondents/RespondentCreatePage";
import RespondentDetailPage from "./pages/respondents/RespondentDetailPage";
import RespondentResponsePage from "./pages/respondents/RespondentResponsePage";

// ✅ Import du ConfirmProvider
import { ConfirmProvider } from "./components/ConfirmProvider";

/* =====================================================
   Route privée (auth obligatoire)
   ===================================================== */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, tenantSlug } = useAuth();

  if (!token) {
    if (tenantSlug) return <Navigate to={`/t/${tenantSlug}/login`} replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/* =====================================================
   Vérifie la présence du tenantSlug dans l'URL
   ===================================================== */
const TenantWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  if (!tenantSlug)
    return <div className="p-4 text-danger">Tenant missing in URL</div>;
  return <>{children}</>;
};

/* =====================================================
   Route multi-tenant COMPLÈTE
   ===================================================== */
const TenantRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => (
  <PrivateRoute>
    <TenantWrapper>
      <TenantProvider>{element}</TenantProvider>
    </TenantWrapper>
  </PrivateRoute>
);

/* =====================================================
   Application principale
   ===================================================== */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ✅ Enveloppe toute l'app avec ConfirmProvider */}
        <ConfirmProvider>
          <AppNavbar />

          <Routes>
            {/* ====================================== */}
            {/* Routes publiques globales */}
            {/* ====================================== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupTenantPage />} />

            {/* ====================================== */}
            {/* Routes publiques tenant-aware */}
            {/* ====================================== */}
            <Route path="/t/:tenantSlug/login" element={<LoginPage />} />
            <Route path="/t/:tenantSlug/register" element={<RegisterPage />} />
            <Route
              path="/t/:tenantSlug/forgot-password"
              element={<ForgotPasswordPage />}
            />
            <Route
              path="/t/:tenantSlug/reset-password"
              element={<ResetPasswordPage />}
            />

            {/* ====================================== */}
            {/* Routes protégées multi-tenant */}
            {/* ====================================== */}
            <Route
              path="/t/:tenantSlug/dashboard"
              element={<TenantRoute element={<Dashboard />} />}
            />
            <Route
              path="/t/:tenantSlug/invite"
              element={<TenantRoute element={<InviteListPage />} />}
            />
            <Route
              path="/t/:tenantSlug/settings"
              element={<TenantRoute element={<SettingsPage />} />}
            />
            <Route
              path="/t/:tenantSlug/region"
              element={<TenantRoute element={<RegionPage />} />}
            />
            <Route
              path="/t/:tenantSlug/departement"
              element={<TenantRoute element={<DepartementPage />} />}
            />
            <Route
              path="/t/:tenantSlug/secteur"
              element={<TenantRoute element={<SectorPage />} />}
            />
            <Route
              path="/t/:tenantSlug/village"
              element={<TenantRoute element={<VillagePage />} />}
            />
            <Route
              path="/t/:tenantSlug/surveys"
              element={<TenantRoute element={<SurveyListPage />} />}
            />
            <Route
              path="/t/:tenantSlug/surveys/:surveyId/questions"
              element={<TenantRoute element={<SurveyQuestionsPage />} />}
            />
            <Route
              path="/t/:tenantSlug/surveys/new"
              element={<TenantRoute element={<SurveyCreatePage />} />}
            />
            <Route
              path="/t/:tenantSlug/surveys/:surveyId"
              element={<TenantRoute element={<SurveyDetailPage />} />}
            />
            <Route
              path="/t/:tenantSlug/surveys/:surveyId/edit"
              element={<TenantRoute element={<SurveyEditPage />} />}
            />
            <Route
              path="/t/:tenantSlug/surveys/:surveyId/respondents"
              element={<TenantRoute element={<RespondentListPage />} />}
            />
            <Route
              path="/t/:tenantSlug/surveys/:surveyId/respondents/new"
              element={<TenantRoute element={<RespondentCreatePage />} />}
            />
            <Route
              path="/t/:tenantSlug/respondents/:respondentId"
              element={<TenantRoute element={<RespondentDetailPage />} />}
            />
            <Route
              path="/t/:tenantSlug/respondents/:respondentId/responses"
              element={<TenantRoute element={<RespondentResponsePage />} />}
            />

            {/* ====================================== */}
            {/* Redirection par défaut */}
            {/* ====================================== */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

// ============================= Bon mais pas de confirmationmodal envelopper
// import React from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useParams,
// } from "react-router-dom";

// import Dashboard from "./pages/Dashboard";
// import InviteListPage from "./pages/InviteListPage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import SignupTenantPage from "./pages/SignupTenantPage";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import ResetPasswordPage from "./pages/ResetPasswordPage";
// import SettingsPage from "./pages/SettingsPage";

// import RegionPage from "./pages/RegionPage";
// import DepartementPage from "./pages/DepartementPage";
// import SectorPage from "./pages/SectorPage";
// import VillagePage from "./pages/VallagePage";

// import AppNavbar from "./components/common/Navbar";

// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import { TenantProvider } from "./contexts/TenantContext";
// import SurveyListPage from "./pages/surveys/SurveyListPage";
// import SurveyQuestionsPage from "./pages/questions/SurveyQuestionsPage";
// import SurveyCreatePage from "./pages/surveys/SurveyCreatePage";
// import SurveyDetailPage from "./pages/surveys/SurveyDetailPage";
// import SurveyEditPage from "./pages/surveys/SurveyEditPage";
// import RespondentListPage from "./pages/respondents/RespondentListPage";
// import RespondentCreatePage from "./pages/respondents/RespondentCreatePage";
// import RespondentDetailPage from "./pages/respondents/RespondentDetailPage";
// import RespondentResponsePage from "./pages/respondents/RespondentResponsePage";

// /* =====================================================
//    Route privée (auth obligatoire)
//    ===================================================== */
// const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { token, tenantSlug } = useAuth();

//   if (!token) {
//     // 🔐 Redirection tenant-aware si possible
//     if (tenantSlug) {
//       return <Navigate to={`/t/${tenantSlug}/login`} replace />;
//     }
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// /* =====================================================
//    Vérifie la présence du tenantSlug dans l'URL
//    ===================================================== */
// const TenantWrapper: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   if (!tenantSlug) {
//     return <div className="p-4 text-danger">Tenant missing in URL1</div>;
//   }

//   return <>{children}</>;
// };

// /* =====================================================
//    Route multi-tenant COMPLÈTE
//    - Auth
//    - TenantSlug
//    - TenantProvider (context)
//    ===================================================== */
// const TenantRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => (
//   <PrivateRoute>
//     <TenantWrapper>
//       <TenantProvider>{element}</TenantProvider>
//     </TenantWrapper>
//   </PrivateRoute>
// );

// /* =====================================================
//    Application principale
//    ===================================================== */
// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppNavbar />

//         <Routes>
//           {/* ====================================== */}
//           {/* Routes publiques globales */}
//           {/* ====================================== */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupTenantPage />} />
//           {/* ====================================== */}
//           {/* Routes publiques tenant-aware (auth) */}
//           {/* ====================================== */}
//           <Route path="/t/:tenantSlug/login" element={<LoginPage />} />
//           <Route path="/t/:tenantSlug/register" element={<RegisterPage />} />
//           <Route
//             path="/t/:tenantSlug/forgot-password"
//             element={<ForgotPasswordPage />}
//           />
//           <Route
//             path="/t/:tenantSlug/reset-password"
//             element={<ResetPasswordPage />}
//           />
//           {/* ====================================== */}
//           {/* Routes protégées multi-tenant */}
//           {/* ====================================== */}
//           <Route
//             path="/t/:tenantSlug/dashboard"
//             element={<TenantRoute element={<Dashboard />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/invite"
//             element={<TenantRoute element={<InviteListPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/settings"
//             element={<TenantRoute element={<SettingsPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/region"
//             element={<TenantRoute element={<RegionPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/departement"
//             element={<TenantRoute element={<DepartementPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/secteur"
//             element={<TenantRoute element={<SectorPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/village"
//             element={<TenantRoute element={<VillagePage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/surveys"
//             element={<TenantRoute element={<SurveyListPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/surveys/:surveyId/questions"
//             element={<TenantRoute element={<SurveyQuestionsPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/surveys/new"
//             element={<TenantRoute element={<SurveyCreatePage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/surveys/:surveyId"
//             element={<TenantRoute element={<SurveyDetailPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/surveys/:surveyId/edit"
//             element={<TenantRoute element={<SurveyEditPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/surveys/:surveyId/respondents"
//             element={<TenantRoute element={<RespondentListPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/surveys/:surveyId/respondents/new"
//             element={<TenantRoute element={<RespondentCreatePage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/respondents/:respondentId"
//             element={<TenantRoute element={<RespondentDetailPage />} />}
//           />
//           <Route
//             path="/t/:tenantSlug/respondents/:respondentId/responses"
//             element={<TenantRoute element={<RespondentResponsePage />} />}
//           />

//           {/* <Route
//             path="/t/:tenantSlug/respondents/:respondentId/responses"
//             element={<RespondentResponsePage />}
//           /> */}
//           {/* <Route
//             path="/t/:tenantSlug/surveys/:surveyId/respondents"
//             element={<RespondentListPage />}
//           /> */}
//           {/* <Route
//             path="/t/:tenantSlug/surveys/:surveyId/respondents/new"
//             element={<RespondentCreatePage />} */}
//           {/* /> */}
//           {/*
//           <Route
//             path="/t/:tenantSlug/respondents/:respondentId"
//             element={<RespondentDetailPage />}
//           /> */}
//           {/* <Route path="/t/:slug/surveys" element={<SurveyListPage />} /> */}
//           {/* ====================================== */}
//           {/* Redirection par défaut */}
//           {/* ====================================== */}
//           <Route path="/" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// };

// export default App;

// ===========================
// import React from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useParams,
// } from "react-router-dom";

// import Dashboard from "./pages/Dashboard";
// import InviteListPage from "./pages/InviteListPage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import SignupTenantPage from "./pages/SignupTenantPage";

// import AppNavbar from "./components/common/Navbar";
// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// // import DepartementList from "./components/geo/DepartementList";
// import RegionPage from "./pages/RegionPage";
// import SectorPage from "./pages/SectorPage";
// import VillagePage from "./pages/VallagePage";
// import DepartementPage from "./pages/DepartementPage";
// // import ResetPassword from "./components/auth/ResetPassword";
// // import ForgotPassword from "./components/auth/ForgotPassword";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import ResetPasswordPage from "./pages/ResetPasswordPage";
// import SettingsPage from "./pages/SettingsPage";
// import { TenantProvider } from "./contexts/TenantContext";

// // ----------------------
// // Route privée tenant-aware
// // ----------------------
// const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { token, tenantSlug } = useAuth();

//   if (!token) {
//     // 🔥 Redirection tenant-aware
//     if (tenantSlug) return <Navigate to={`/t/${tenantSlug}/login`} replace />;
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// // ----------------------
// // Vérification tenantSlug
// // ----------------------
// const TenantWrapper: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   if (!tenantSlug) return <div>Tenant missing in URL</div>;

//   return <>{children}</>;
// };

// // ----------------------
// // Route multi-tenant combinée
// // ----------------------
// const TenantRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => (
//   <PrivateRoute>
//     <TenantWrapper>{element}</TenantWrapper>
//   </PrivateRoute>
// );

// // ----------------------
// // App principale
// // ----------------------
// const App: React.FC = () => (
//   <BrowserRouter>
//     <AuthProvider>
//       <AppNavbar />

//       <Routes>
//         {/* Routes publiques globales */}
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/signup" element={<SignupTenantPage />} />
//         // Auth routes publiques
//         <Route
//           path="/t/:tenantSlug/forgot-password"
//           element={<ForgotPasswordPage />}
//         />
//         <Route
//           path="/t/:tenantSlug/reset-password"
//           element={<ResetPasswordPage />}
//         />
//         {/* Route login tenant-aware */}
//         <Route path="/t/:tenantSlug/login" element={<LoginPage />} />
//         {/* Register tenant-aware */}
//         <Route path="/t/:tenantSlug/register" element={<RegisterPage />} />
//         {/* Routes multi-tenant protégées */}
//         <Route
//           path="/t/:tenantSlug/dashboard"
//           element={<TenantRoute element={<Dashboard />} />}
//         />
//         <Route
//           path="/t/:tenantSlug/region"
//           element={<TenantRoute element={<RegionPage />} />}
//         />
//         <Route
//           path="/t/:tenantSlug/departement"
//           element={<TenantRoute element={<DepartementPage />} />}
//         />
//         <Route
//           path="/t/:tenantSlug/secteur"
//           element={<TenantRoute element={<SectorPage />} />}
//         />
//         <Route
//           path="/t/:tenantSlug/village"
//           element={<TenantRoute element={<VillagePage />} />}
//         />
//         <Route
//           path="/t/:tenantSlug/invite"
//           element={<TenantRoute element={<InviteListPage />} />}
//         />
//         <Route
//           path="/t/:tenantSlug/settings"
//           element={<TenantRoute element={<SettingsPage />} />}
//         />
//         {/* Default redirect */}
//         <Route path="/" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </AuthProvider>
//   </BrowserRouter>
// );

// export default App;
