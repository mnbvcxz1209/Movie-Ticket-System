import { Navigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

export default function ProtectedRoute({ children }) {
    const { isLoggedIn } = useBooking();

    // 未登入 → 強制跳登入
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    // 已登入 → 顯示內容
    return children;
}
