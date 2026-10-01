import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearRegisterData, updateRegisterData } from "../storage";

export default function IdentityCheckPage() {

    const [idNumber, setIdNumber] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    //  每次進入這頁時，清空所有註冊資料
    useEffect(() => {
        clearRegisterData();
    }, []);

    async function handleNext() {
        setError("");

        if (!idNumber.trim()) {
            setError("請輸入身分證字號");
            return;
        }

        //  /id-check
        const res = await fetch("http://localhost:5001/id-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idNumber })
        });

        const data = await res.json();

        if (data.exists) {
            setError("此身分證字號已註冊");
            return;
        }
        //  寫入 localStorage
        updateRegisterData({ memID: idNumber });

        // 跳下一步
        navigate("/basicinfo");
    }

    return (
        <div>
            <div className="page-center">
                <div className="form-container">
                    <h1>身分證驗證</h1>
                    <input
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="請輸入身分證字號"
                    />
                    <br /><br />

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button onClick={handleNext}>下一步</button>
                </div>
            </div>
        </div>
    );
}
