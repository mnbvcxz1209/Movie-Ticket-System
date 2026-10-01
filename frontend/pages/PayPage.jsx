import React, { useEffect, useState } from "react";
import { useBooking } from "../context/BookingContext";

export default function PayPage() {

    const {
        memID,
        selectedCinema,
        selectedMovie,
        selectedShowtime,
        ticketType,
        ticketQuantity,
        selectedSeats,

        payID,
        payMethod,

        foodList,
        selectedFoods,

        orderInfo, setOrderInfo,   
        setCurrentStep
    } = useBooking();

    // 顯示資訊用
    const [cinemaName, setCinemaName] = useState("");
    const [movieName, setMovieName] = useState("");
    const [showInfo, setShowInfo] = useState({ date: "", time: "" });
    const [ticketInfo, setTicketInfo] = useState({ name: "", price: 0 });

    //  用來將 SE001 → A1（後端提供所有座位的資料）
    const [seatDetailList, setSeatDetailList] = useState([]);

    // 從後端取得所有座位資料，用來轉換座位顯示
    useEffect(() => {
        fetch("http://localhost:5001/all-seats")
            .then(res => res.json())
            .then(data => setSeatDetailList(data))
            .catch(() => console.log("無法取得 all-seats"));
    }, []);

    // 座位轉換：SE001 → A1
    const formatSeat = (seatID) => {
        const seat = seatDetailList.find(x => x.seatID === seatID);
        if (!seat) return seatID;
        return `${seat.rowLabel}${seat.col}`;
    };

    // 讀取影城名稱
    useEffect(() => {
        fetch("http://localhost:5001/cinemas")
            .then(res => res.json())
            .then(list => {
                const c = list.find(item => item.cinemaID === selectedCinema);
                setCinemaName(c?.name || "");
            });
    }, [selectedCinema]);

    // 讀取電影名稱
    useEffect(() => {
        if (!selectedCinema || !selectedMovie) return;

        fetch(`http://localhost:5001/movies?cinemaID=${selectedCinema}`)
            .then(res => res.json())
            .then(list => {
                const m = list.find(item => item.movieID === selectedMovie);
                setMovieName(m?.title || "");
            });
    }, [selectedCinema, selectedMovie]);

    // 讀取場次資訊
    useEffect(() => {
        if (!selectedShowtime) return;

        fetch(`http://localhost:5001/show?id=${selectedShowtime}`)
            .then(res => res.json())
            .then(data => setShowInfo({
                date: data.showDate,
                time: data.showTime
            }));
    }, [selectedShowtime]);

    // 讀取票種
    useEffect(() => {
        if (!ticketType) return;

        fetch(`http://localhost:5001/ticket?id=${ticketType}`)
            .then(res => res.json())
            .then(data => setTicketInfo({
                name: data.name,
                price: Number(data.price)
            }));
    }, [ticketType]);

    // 計算價格
    const selectedFoodData = foodList.filter(f =>
        selectedFoods.includes(f.foodID)
    );

    const ticketTotal = ticketInfo.price * ticketQuantity;
    const foodTotal = selectedFoodData.reduce((sum, f) => sum + Number(f.price), 0);
    const totalPrice = ticketTotal + foodTotal;

    // 付款方式中文
    const payMethodName = {
        "online": "線上付款（信用卡 / 行動支付）",
        "counter": "臨櫃付款（現場櫃台）"
    }[payMethod] || "未選擇";

    // ======================================================
    //  建立訂單並前往完成頁面
    // ======================================================
    async function submitOrder() {

        const payload = {
            memID,
            showID: selectedShowtime,
            ticketID: ticketType,
            quantity: ticketQuantity,
            foods: selectedFoods,
            seats: selectedSeats,   // ["SE001","SE002"]
            payID: payID
        };

        console.log("送出的 payload =", payload);

        try {
            const res = await fetch("http://localhost:5001/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log("後端回傳 data =", data);

            if (!data.success) {
                alert("訂單建立失敗：" + data.message);
                return;
            }

            //  訂單成功 → 儲存資料並跳轉
            setOrderInfo(data);
            setCurrentStep("success");

        } catch (err) {
            console.log(err);
            alert("無法連線到伺服器");
        }
    }


    return (
        <div className="page-center">
            <div className="form-container">
                <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 mt-8">

                        <h1 className="text-3xl font-bold text-gray-800 mb-8">確認付款</h1>

                        <div className="bg-gray-50 p-6 rounded-lg mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">訂票資訊</h2>

                            <div className="space-y-2 text-gray-700">

                                <p><span className="font-medium">影城：</span>{cinemaName}</p>
                                <p><span className="font-medium">電影：</span>{movieName}</p>
                                <p><span className="font-medium">場次：</span>{showInfo.date} {showInfo.time}</p>

                                <p>
                                    <span className="font-medium">票種：</span>
                                    {ticketInfo.name}（${ticketInfo.price}）
                                </p>

                                <p><span className="font-medium">數量：</span>{ticketQuantity}</p>

                                <p>
                                    <span className="font-medium">座位：</span>
                                    {selectedSeats.map(seat => formatSeat(seat)).join(", ")}
                                </p>

                                {selectedFoodData.length > 0 && (
                                    <div className="mt-4">
                                        <span className="font-medium">餐飲：</span>
                                        <ul className="list-disc ml-6">
                                            {selectedFoodData.map(f => (
                                                <li key={f.foodID}>{f.name} - ${f.price}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <hr className="my-4" />

                                <p><span className="font-medium">票價小計：</span>${ticketTotal}</p>
                                <p><span className="font-medium">餐飲小計：</span>${foodTotal}</p>

                                <p className="text-xl font-bold mt-4">
                                    總金額：<span className="text-purple-600">${totalPrice}</span>
                                </p>

                                <p>
                                    <span className="font-medium">付款方式：</span>
                                    {payMethodName}
                                </p>

                            </div>
                        </div>

                        <button
                            onClick={submitOrder}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            前往付款
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
