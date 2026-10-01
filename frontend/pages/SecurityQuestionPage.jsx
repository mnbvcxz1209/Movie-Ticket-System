import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../register.css";

import { getRegisterData, updateRegisterData, clearRegisterData } from "../storage";

export default function SecurityQuestionPage() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleNext() {
        setError("");

        if (!question.trim() || !answer.trim()) {
            setError("請輸入完整的安全問題與答案");
            return;
        }

        //  更新 localStorage
        updateRegisterData({
            security_question: question,
            security_answer: answer
        });

        //  取得全部註冊資料
        const data = getRegisterData();
        console.log("前端送出的 data:", data);
        if (!data.memID) {
            setError("無身分證字號資料，請重新開始註冊流程");
            return;
        }

        try {
            //  呼叫後端： /register
            const res = await fetch("http://localhost:5001/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.status === "success") {
                clearRegisterData();
                navigate("/success");
            } else {
                setError(result.msg || "註冊失敗");
            }
        } catch (err) {
            setError("無法連線到伺服器");
        }
    }

    return (
        <div className="page-center">
            <div className="form-container">
                <h1>設定安全問題</h1>
                <div>
                    <input
                        type="text"
                        placeholder="忘記密碼時的問題"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    /><br /><br />

                    <input
                        type="text"
                        placeholder="問題答案"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    /><br /><br />

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button onClick={handleNext}>確認</button>
                </div></div></div>
    );
}
