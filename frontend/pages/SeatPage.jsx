import React, { useEffect, useState } from "react";
import SeatButton from "../components/SeatButton";
import { useBooking } from "../context/BookingContext";
import "./SeatPage.css"; 

export default function SeatPage() {

    const {
        seatStatus, setSeatStatus,
        selectedSeats, setSelectedSeats,
        seatError, setSeatError,
        ticketQuantity,
        setCurrentStep,
        selectedShowtime,
    } = useBooking();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 讀取座位
    useEffect(() => {
        if (!selectedShowtime) {
            setSeatError("場次遺失，請回上一頁重新選擇");
            return;
        }

        fetch(`http://localhost:5001/seats?showID=${selectedShowtime}`)
            .then(res => res.json())
            .then(data => setSeatStatus(data))
            .catch(err => setSeatError("無法取得座位資料"));
    }, [selectedShowtime]);

    const handleSeatClick = (row, col) => {
        const seatObj = seatStatus[row][col]; // { seatID, state }

        if (seatObj.state === 1) {
            setSeatError("此座位已售出");
            return;
        }

        setSeatError("");

        const seatID = seatObj.seatID;

        setSelectedSeats(prev =>
            prev.includes(seatID)
                ? prev.filter(x => x !== seatID)
                : [...prev, seatID]
        );
    };


    // 點座位
    const handleConfirmSeats = async () => {
        if (selectedSeats.length !== ticketQuantity) {
            setSeatError(`請選擇 ${ticketQuantity} 個座位`);
            return;
        }

        setIsSubmitting(true);
        setSeatError("");

        try {
            for (let seatID of selectedSeats) {
                const res = await fetch("http://localhost:5001/lock-seat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        showID: selectedShowtime,
                        seatID: seatID   // ⭐⭐ 看這裡：直接 seatID
                    })
                });

                const result = await res.json();
                if (!result.success) {
                    setSeatError(`座位 ${seatID} 已被選取或無法鎖定`);
                    setIsSubmitting(false);
                    return;
                }
            }

            setCurrentStep("food");

        } catch (err) {
            setSeatError("座位鎖定失敗，請稍後再試");
        }

        setIsSubmitting(false);
    };


    return (
        <div className="page-center">
            <div className="form-container">
                <div className="seat-container">

                    <div className="seat-box">
                        <h1 className="title">選擇座位</h1>
                        <p className="subtitle">請選擇 {ticketQuantity} 個座位</p>

                        {/* 標示說明 */}
                        <div className="legend">
                            <div className="legend-item">
                                <div className="legend-box available"></div> 可選
                            </div>
                            <div className="legend-item">
                                <div className="legend-box selected"></div> 已選
                            </div>
                            <div className="legend-item">
                                <div className="legend-box sold"></div> 已售出
                            </div>
                        </div>

                        {/* 螢幕 */}
                        <div className="screen">螢幕</div>

                        {/* 座位區 */}
                        <div className="seat-grid">
                            {seatStatus.map((row, rowIndex) => (
                                <div key={rowIndex} className="seat-row">
                                    {row.map((seatObj, colIndex) => (
                                        <SeatButton
                                            key={seatObj.seatID}
                                            label={`${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`}
                                            isSold={seatObj.state === 1}
                                            isSelected={selectedSeats.includes(seatObj.seatID)}
                                            onClick={() => handleSeatClick(rowIndex, colIndex)}
                                        />
                                    ))}
                                </div>
                            ))}

                        </div>

                        {seatError && <p className="error">{seatError}</p>}

                        <button
                            onClick={handleConfirmSeats}
                            className="confirm-btn"
                        >
                            確認座位
                        </button>
                    </div>

                </div></div></div>
    );
}
