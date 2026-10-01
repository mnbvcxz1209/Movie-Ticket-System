import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

export default function BookingSuccessPage() {

    const navigate = useNavigate();

    const {
        selectedCinema,
        selectedMovie,
        selectedShowtime,
        ticketType,
        ticketQuantity,
        foodList,
        selectedFoods,

        orderInfo,       // ★ PayPage 傳入的完整訂單資訊
        resetBooking
    } = useBooking();

    const [cinemaName, setCinemaName] = useState("");
    const [movieName, setMovieName] = useState("");
    const [showInfo, setShowInfo] = useState({ showDate: "", showTime: "" });
    const [ticketInfo, setTicketInfo] = useState({ name: "", price: 0 });

    // 顯示座位（例如 ["A1","A2"]）
    const [seatDisplay, setSeatDisplay] = useState([]);

    // 食物資料
    const selectedFoodData = foodList.filter(f =>
        selectedFoods.includes(f.foodID)
    );

    // ======= 座位顯示（使用 orderInfo.seatDisplay）=======
    useEffect(() => {
        if (orderInfo && orderInfo.seatDisplay) {
            setSeatDisplay(orderInfo.seatDisplay);
        }
    }, [orderInfo]);

    // ======= 付款方式顯示 =======
    const payMethodText = {
        1: "線上付款（信用卡/行動支付）",
        2: "臨櫃付款（現場櫃台）"
    }[orderInfo?.payID] || "未知";

    // ====== 影城 ======
    useEffect(() => {
        fetch("http://localhost:5001/cinemas")
            .then(res => res.json())
            .then(list => {
                const c = list.find(item => item.cinemaID === selectedCinema);
                setCinemaName(c?.name || "");
            });
    }, [selectedCinema]);

    // ====== 電影 ======
    useEffect(() => {
        fetch(`http://localhost:5001/movies?cinemaID=${selectedCinema}`)
            .then(res => res.json())
            .then(list => {
                const m = list.find(item => item.movieID === selectedMovie);
                setMovieName(m?.title || "");
            });
    }, [selectedCinema, selectedMovie]);

    // ====== 場次 ======
    useEffect(() => {
        fetch(`http://localhost:5001/show?id=${selectedShowtime}`)
            .then(res => res.json())
            .then(data => {
                setShowInfo({
                    showDate: data.showDate,
                    showTime: data.showTime
                });
            });
    }, [selectedShowtime]);

    // ====== 票種 ======
    useEffect(() => {
        fetch(`http://localhost:5001/ticket?id=${ticketType}`)
            .then(res => res.json())
            .then(data => {
                setTicketInfo({
                    name: data.name,
                    price: Number(data.price)
                });
            });
    }, [ticketType]);

    // 回首頁（不再建立訂單）
    function goHome() {
        resetBooking();
        navigate("/");
    }

    return (
        <div className="page-center">
            <div className="form-container">
                <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 mt-8 text-center">

                        {/* ICON */}
                        <div className="text-6xl mb-4 text-green-600">✓</div>

                        {/* 標題 */}
                        <h1 className="text-3xl font-bold text-green-600 mb-8">
                            訂票成功！
                        </h1>

                        {/* 訂單編號 */}
                        <p className="text-lg font-semibold text-gray-700 mb-6">
                            訂單編號：<span className="text-purple-600">{orderInfo?.orderID}</span>
                        </p>

                        <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">訂票資訊</h2>

                            <div className="space-y-2 text-gray-700">

                                <p><span className="font-medium">影城：</span>{cinemaName}</p>
                                <p><span className="font-medium">電影：</span>{movieName}</p>

                                <p>
                                    <span className="font-medium">場次：</span>
                                    {showInfo.showDate} {showInfo.showTime}
                                </p>

                                <p>
                                    <span className="font-medium">付款方式：</span>
                                    {payMethodText}
                                </p>

                                <p>
                                    <span className="font-medium">票種：</span>
                                    {ticketInfo.name}（{ticketType}）
                                </p>

                                <p><span className="font-medium">數量：</span>{ticketQuantity}</p>

                                <p>
                                    <span className="font-medium">座位：</span>
                                    {seatDisplay.join(", ")}
                                </p>

                                {selectedFoodData.length > 0 && (
                                    <div className="mt-4">
                                        <span className="font-medium">加購餐飲：</span>
                                        <ul className="list-disc ml-6">
                                            {selectedFoodData.map(f => (
                                                <li key={f.foodID}>
                                                    {f.name} - ${f.price}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <hr className="my-4" />

                                <p className="text-xl font-bold">
                                    總金額：<span className="text-purple-600">${orderInfo?.totalPrice}</span>
                                </p>

                            </div>
                        </div>

                        <button
                            onClick={goHome}
                            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            返回主頁
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
