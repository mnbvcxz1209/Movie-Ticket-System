import React, { useEffect, useState } from "react";
import { useBooking } from "../context/BookingContext";

export default function TicketPage() {

    const {
        ticketType, setTicketType,
        ticketQuantity, setTicketQuantity,
        setCurrentStep
    } = useBooking();

    const [ticketOptions, setTicketOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 後端抓票種資料
    useEffect(() => {
        fetch("http://localhost:5001/tickets")
            .then(res => res.json())
            .then(data => {
                setTicketOptions(data);   // [ {ticketID, name, price}, ... ]
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("無法載入票種資料");
                setLoading(false);
            });
    }, []);

    const handleNext = () => {
        if (!ticketType) return;
        setCurrentStep("seat");
    };

    if (loading) return <p className="text-center mt-10">載入中...</p>;
    if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

    return (
        <div className="page-center">
            <div className="form-container">
                <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 mt-8">

                        <h1 className="text-3xl font-bold text-gray-800 mb-8">選擇票種與數量</h1>

                        <div className="space-y-6">

                            {/* 票種 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    票種
                                </label>
                                <select
                                    value={ticketType}
                                    onChange={(e) => setTicketType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">請選擇票種</option>

                                    {ticketOptions.map(t => (
                                        <option key={t.ticketID} value={t.ticketID}>
                                            {t.name}（${t.price}）
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 數量 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    數量
                                </label>
                                <select
                                    value={ticketQuantity}
                                    onChange={(e) => setTicketQuantity(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 下一步 */}
                            <button
                                onClick={handleNext}
                                disabled={!ticketType}
                                className={`w-full py-3 rounded-lg font-medium transition-colors ${ticketType
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                下一步
                            </button>

                        </div>
                    </div>
                </div></div></div>
    );
}
