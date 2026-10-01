import React, { useEffect, useState } from "react";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";

export default function OrderHistoryPage() {

    const { username } = useBooking();   // username = memID
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    //  未登入 → 強制跳到登入頁
    useEffect(() => {
        if (!username) {
            navigate("/login");
        }
    }, [username, navigate]);

    //  登入後抓訂單資料
    useEffect(() => {
        if (!username) return;

        fetch(`http://localhost:5001/orders?memID=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    setOrders(data.orders);
                }
            });
    }, [username]);

    //  取消訂單
    function handleCancel(id) {
        if (!window.confirm("確定要取消這筆訂單嗎？")) return;

        fetch("http://localhost:5001/cancel-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: id })
        })
            .then(res => res.json())
            .then(result => {
                if (result.status === "ok") {
                    alert("訂單已取消！");

                    // **取消後從列表移除**
                    setOrders(prev => prev.filter(o => o.orderID !== id));

                } else {
                    alert("取消失敗：" + result.msg);
                }
            });
    }


    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">

                <h1 className="text-3xl font-bold mb-6 text-center">訂單紀錄</h1>

                {/* 沒有訂單 */}
                {orders.length === 0 && (
                    <p className="text-center text-gray-600">
                        尚無訂單紀錄
                    </p>
                )}

                {/* 訂單列表 */}
                {orders.map(order => (
                    <div
                        key={order.orderID}
                        className="border rounded-lg p-4 mb-4 bg-gray-50 shadow-sm"
                    >
                        <h2 className="text-xl font-bold mb-2">
                            訂單編號：{order.orderID}
                        </h2>

                        <p><span className="font-medium">訂單時間：</span>{order.orderTime}</p>
                        <p><span className="font-medium">影城：</span>{order.cinemaName}</p>
                        <p><span className="font-medium">電影：</span>{order.movieTitle}</p>
                        <p>
                            <span className="font-medium">場次：</span>
                            {order.showDate} {order.showTime}
                        </p>

                        {/* 座位顯示 */}
                        {order.seats && order.seats.length > 0 && (
                            <p className="mt-2">
                                <span className="font-medium">座位：</span>
                                {order.seats.join(", ")}
                            </p>
                        )}

                        {/* 餐點 */}
                        {order.foods && order.foods.length > 0 && (
                            <div className="mt-2">
                                <span className="font-medium">餐點：</span>
                                <ul className="list-disc ml-6">
                                    {order.foods.map((f, i) => (
                                        <li key={i}>{f.name} - ${f.price}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="mt-3 text-lg font-bold">
                            總金額：${order.totalPrice}
                        </p>

                        {/* 取消訂單按鈕 */}
                        <button
                            onClick={() => handleCancel(order.orderID)}
                            className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            取消訂單
                        </button>
                    </div>
                ))}

                {/* 返回主頁 */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate("/")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
                    >
                        返回主頁
                    </button>
                </div>
            </div>
        </div>
    );
}
