import React, { useState, useEffect } from "react";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";

export default function ModifyProfilePage() {
    const navigate = useNavigate();
    const { isLoggedIn, username } = useBooking(); // username = memID

    /* ===============================
       基本會員資料
    =============================== */
    const [form, setForm] = useState({
        lastName: "",
        firstName: "",
        tel: "",
        email: ""
    });

    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState("");

    /* ===============================
       帳戶資訊（餘額 / 點數 / 卡）
    =============================== */
    const [account, setAccount] = useState({
        balance: 0,
        points: 0,
        cardLast4: null
    });

    const [cardInput, setCardInput] = useState("");

    /* ===============================
       未登入 → 導登入頁
    =============================== */
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: "/modify-member" } });
        }
    }, [isLoggedIn, navigate]);

    /* ===============================
       載入會員基本資料
    =============================== */
    useEffect(() => {
        if (!username) return;

        fetch(`http://localhost:5001/api/getmember?memID=${username}`)
            .then(res => res.json())
            .then(data => {
                setForm({
                    lastName: data.lastName || "",
                    firstName: data.firstName || "",
                    tel: data.tel || "",
                    email: data.account || ""
                });
            });
    }, [username]);

    /* ===============================
       載入帳戶資訊
    =============================== */
    useEffect(() => {
        if (!username) return;

        fetch(`http://localhost:5001/api/member/account-summary?memID=${username}`)
            .then(res => res.json())
            .then(data => setAccount(data));
    }, [username]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    }

    /* ===============================
       修改會員資料
    =============================== */
    function handleSubmit() {
        let newErrors = {};
        Object.keys(form).forEach(key => {
            if (!form[key]) newErrors[key] = "此欄位不可為空";
        });

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        fetch("http://localhost:5001/api/update-member-modify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                memID: username,
                ...form
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSuccessMsg("會員資料修改成功！");
                }
            });
    }

    /* ===============================
       綁定 / 更新信用卡
    =============================== */
    function handleBindCard() {
        if (cardInput.length !== 16) {
            alert("信用卡號需 16 碼");
            return;
        }

        fetch("http://localhost:5001/api/member/bind-card", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                memID: username,
                card: cardInput
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("信用卡綁定成功");
                    setAccount({
                        ...account,
                        cardLast4: cardInput.slice(-4)
                    });
                    setCardInput("");
                }
            });
    }

    return (
        <div className="page-center">
            <div className="form-container">

                <h1 className="form-title">會員中心</h1>

                {/* ================= 帳戶資訊 ================= */}
                <div className="info-box">
                    <h2>帳戶資訊</h2>
                    <p>帳戶餘額：<strong>${account.balance}</strong></p>
                    <p>目前點數：<strong>{account.points}</strong> 點</p>
                </div>

                {/* ================= 信用卡 ================= */}
                <div className="info-box">
                    <h2>信用卡綁定</h2>

                    {account.cardLast4 ? (
                        <p>已綁定卡片：**** **** **** {account.cardLast4}</p>
                    ) : (
                        <p>尚未綁定信用卡</p>
                    )}

                    <input
                        className="form-input"
                        placeholder="請輸入 16 位信用卡號"
                        value={cardInput}
                        onChange={e => setCardInput(e.target.value)}
                    />

                    <button className="form-button" onClick={handleBindCard}>
                        綁定 / 更新信用卡
                    </button>
                </div>

                {/* ================= 修改會員資料 ================= */}
                <h2 className="section-title">修改會員資料</h2>

                <label className="form-label">姓氏</label>
                <input
                    className={`form-input ${errors.lastName ? "input-error" : ""}`}
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                />
                {errors.lastName && <p className="error-text">{errors.lastName}</p>}

                <label className="form-label">名字</label>
                <input
                    className={`form-input ${errors.firstName ? "input-error" : ""}`}
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                />
                {errors.firstName && <p className="error-text">{errors.firstName}</p>}

                <label className="form-label">電話號碼</label>
                <input
                    className={`form-input ${errors.tel ? "input-error" : ""}`}
                    name="tel"
                    value={form.tel}
                    onChange={handleChange}
                />
                {errors.tel && <p className="error-text">{errors.tel}</p>}

                <label className="form-label">電子郵件</label>
                <input
                    className={`form-input ${errors.email ? "input-error" : ""}`}
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}

                <button className="form-button" onClick={handleSubmit}>
                    修改完成
                </button>

                {successMsg && (
                    <>
                        <p className="success-text">{successMsg}</p>
                        <button
                            className="form-button"
                            onClick={() => navigate("/")}
                        >
                            返回主頁
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
