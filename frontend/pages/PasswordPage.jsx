import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../register.css";

import { updateRegisterData } from "../storage";   // ★ 重要：使用 storage 工具

export default function PasswordPage() {
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function handleNext() {
        setError("");

        // 1️⃣ 密碼格式簡單檢查（至少 8 位）
        if (pw.length < 8) {
            setError("密碼至少需要 8 個字元");
            return;
        }

        // 2️⃣ 驗證兩次輸入是否一致
        if (pw !== pw2) {
            setError("兩次輸入的密碼不一致");
            return;
        }

        // 3️⃣ 將密碼寫入 localStorage
        updateRegisterData({ password: pw });

        // 4️⃣ 進入下一頁（安全問題）
        navigate("/security");
    }

    return (
        <div>
            <div className="page-center">
                <div className="form-container">
                    <h1>設定密碼</h1>

                    <input
                        type="password"
                        placeholder="密碼（英數混合 8 位以上）"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                    /><br /><br />

                    <input
                        type="password"
                        placeholder="再次輸入密碼"
                        value={pw2}
                        onChange={(e) => setPw2(e.target.value)}
                    /><br /><br />

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button onClick={handleNext}>確認</button>
                </div></div></div>
    );
}
