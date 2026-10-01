import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../register.css";

import { updateRegisterData } from "../storage";  

export default function BasicInfoPage() {
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState("");
    const [phone, setPhone] = useState("");
    const [phone2, setPhone2] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function handleNext() {
        setError("");

        // 手機兩次是否一致
        if (phone !== phone2) {
            setError("兩次手機輸入不一致");
            return;
        }

        // 姓名至少兩個字
        if (name.length < 2) {
            setError("請輸入完整姓名（例如：陳小明）");
            return;
        }

        // 拆成姓＋名
        const lastName = name[0];
        const firstName = name.substring(1);

        
        updateRegisterData({
            lastName,
            firstName,
            birth: birthday,
            tel: phone
        });

        // 下一步：email 頁面
        navigate("/email");
    }

    return (
        <div>
            <div className="page-center">
                <div className="form-container">
                    <h1>基本資料</h1>

                    <input
                        type="text"
                        placeholder="姓名（例如：陳小明）"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    /><br /><br />

                    <input
                        type="text"
                        placeholder="生日 YYYY-MM-DD"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                    /><br /><br />

                    <input
                        type="text"
                        placeholder="手機（請輸入 10 碼）"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    /><br /><br />

                    <input
                        type="text"
                        placeholder="再次輸入手機"
                        value={phone2}
                        onChange={(e) => setPhone2(e.target.value)}
                    /><br /><br />

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button onClick={handleNext}>確認</button>
                </div>
            </div>
        </div>
    );
}
