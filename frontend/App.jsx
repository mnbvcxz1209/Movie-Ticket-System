import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- 主頁 ---
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

// --- 註冊流程 ---
import TermsPage from "./pages/TermsPage";
import IdentityCheckPage from "./pages/IdentityCheckPage";
import BasicInfoPage from "./pages/BasicInfoPage";
import EmailPage from "./pages/EmailPage";
import PasswordPage from "./pages/PasswordPage";
import SecurityQuestionPage from "./pages/SecurityQuestionPage";
import SuccessPage from "./pages/SuccessPage";
import ModifyProfilePage from "./pages/ModifyProfilePage";

// --- 訂票主流程 ---
import MovieBookingSystem from "./pages/MovieBookingSystem";
//快速搜尋
import FastSearchPage from "./pages/FastSearchPage";
//查看訂單紀錄
import OrderHistoryPage from "./pages/OrderHistoryPage";
//保護路徑
import ProtectedRoute from "./components/ProtectedRoute";
//電影詳細資訊
import MovieListPage from "./pages/MovieListPage"
import MovieDetailPage from "./pages/MovieDetailPage"
//映演品牌
import BrandsPage from "./pages/BrandsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ⭐ 主頁（兩個按鈕） */}
        <Route path="/" element={<HomePage />} />
        {/* ⭐ 登錄系統 */}
        <Route path="/login" element={<LoginPage />} />
        {/* ⭐ 修改會員資料系統 */}
        <Route path="/modify-member" element={<ModifyProfilePage />} />
        {/* ⭐ 註冊流程（不使用 /register prefix）*/}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/id-check" element={<IdentityCheckPage />} />
        <Route path="/basicinfo" element={<BasicInfoPage />} />
        <Route path="/email" element={<EmailPage />} />
        <Route path="/password" element={<PasswordPage />} />
        <Route path="/security" element={<SecurityQuestionPage />} />
        <Route path="/success" element={<SuccessPage />} />

        {/* ⭐ 訂票系統 */}
        <Route path="/booking" element={<MovieBookingSystem />} />
        {/* ⭐ 快速搜尋系統 */}
        <Route path="/fast-search" element={<FastSearchPage />} />
        {/* ⭐ 查看訂單紀錄 */}
        <Route path="/orders" element={<OrderHistoryPage />} />
        {/* ★ 被保護的訂票流程 */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <MovieBookingSystem />
            </ProtectedRoute>
          } />
        <Route path="/movies" element={<MovieListPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/brands" element={<BrandsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
