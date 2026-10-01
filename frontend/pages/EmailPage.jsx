import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../register.css";

import { updateRegisterData } from "../storage";   

export default function EmailPage() {
    const [email, setEmail] = useState("");
    const [email2, setEmail2] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function handleNext() {
        setError("");

        //  驗證 email 是否一致
        if (email !== email2) {
            setError("兩次輸入的 Email 不一致");
            return;
        }

        //  驗證 email 格式
        if (!email.includes("@") || !email.includes(".")) {
            setError("Email 格式不正確");
            return;
        }

        //  儲存 email 到 localStorage
        updateRegisterData({ email });

        //  前往下一頁
        navigate("/password");
    }

    return (
        <div>
            <div className="page-center">
                <div className="form-container">
                    <h1>Email 設定</h1>

                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    /><br /><br />

                    <input
                        type="text"
                        placeholder="再次輸入 Email"
                        value={email2}
                        onChange={(e) => setEmail2(e.target.value)}
                    /><br /><br />

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button onClick={handleNext}>確認</button>
                </div></div></div>
    );
}
