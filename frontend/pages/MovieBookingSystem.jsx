import React from "react";
import { useBooking } from "../context/BookingContext";

import LoginPage from "./LoginPage";
import BookingPage from "./BookingPage";
import PaymentMethodPage from "./PaymentMethodPage";
import BookingTermsPage from "./BookingTermsPage";
import FoodPage from "./FoodPage";
import TicketPage from "./TicketPage";
import SeatPage from "./SeatPage";
import PayPage from "./PayPage";
import BookingSuccessPage from "./BookingSuccessPage";

function AppContent() {
    const { isLoggedIn, currentStep } = useBooking();

    // 未登入 → 顯示登入頁
    if (!isLoggedIn) return <LoginPage />;

    // 登入後 → 走流程
    switch (currentStep) {
        case "booking":
            return <BookingPage />;

        case "payment":
            return <PaymentMethodPage />;

        case "terms":
            return <BookingTermsPage />;

        case "food":
            return <FoodPage />;

        case "ticket":
            return <TicketPage />;

        case "seat":
            return <SeatPage />;

        case "pay":
            return <PayPage />;

        case "success":
            return <BookingSuccessPage />;

        default:
            return <div>未知頁面：{currentStep}</div>;
    }
}

export default function MovieBookingSystem() {
    return <AppContent />;   
}

