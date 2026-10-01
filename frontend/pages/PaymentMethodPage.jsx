import React, { useEffect, useState } from "react";
import { useBooking } from "../context/BookingContext";

export default function PaymentMethodPage() {
    const { setPayID, setPayMethod, setCurrentStep } = useBooking();

    const [methods, setMethods] = useState([]);
    const [selected, setSelected] = useState(null);

    // 取得付款方式
    useEffect(() => {
        fetch("http://localhost:5001/pay")
            .then(res => res.json())
            .then(data => setMethods(data));
    }, []);

    const handleNext = () => {
        if (!selected) return alert("請先選擇付款方式");

        setPayID(selected);
        setPayMethod(selected === 1 ? "online" : "counter");

        setCurrentStep("pay");  // ★ 進入 PayPage
    };

    return (
        <div className="page-center">
            <div className="form-container">

                <h1 className="text-2xl font-bold mb-4">選擇付款方式</h1>

                <div className="space-y-4">
                    {methods.map(m => (
                        <button
                            key={m.payID}
                            type="button"
                            onClick={() => setSelected(m.payID)}
                            className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${selected === m.payID
                                    ? "border-purple-600 bg-purple-100 shadow-md"
                                    : "border-gray-300 bg-white hover:border-purple-400"}
            `}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">{m.name}</h2>
                                    <p className="text-gray-600">{m.content}</p>
                                </div>

                                {/* 選取圈圈 */}
                                <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${selected === m.payID ? "border-purple-600" : "border-gray-400"}
                `}>
                                    {selected === m.payID && (
                                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>


                <button
                    className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    onClick={handleNext}
                >
                    下一步
                </button>

            </div>
        </div>
    );
}
