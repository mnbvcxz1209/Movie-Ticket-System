import React from "react";
import { useBooking } from "../context/BookingContext";

export default function BookingTermsPage() {

    const {
        termsContent,
        paymentMethod,
        setCurrentStep
    } = useBooking();

    const handleAgree = () => {
        if (paymentMethod === "instant") {
            setCurrentStep("food");
        } else {
            setCurrentStep("ticket");
        }
    };

    return (
        <div className="page-center">
            <div className="form-container">
                <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 mt-8">

                        <h1 className="text-3xl font-bold text-gray-800 mb-8">會員條款</h1>

                        <div className="bg-gray-50 p-6 rounded-lg mb-6 h-96 overflow-y-auto border border-gray-300">
                            <p className="text-gray-700 whitespace-pre-line">
                                {termsContent}
                            </p>
                        </div>

                        <button
                            onClick={handleAgree}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            同意
                        </button>

                    </div>
                </div></div></div>
    );
}
