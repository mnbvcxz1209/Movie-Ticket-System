import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

export default function LoginPage() {

    const {
        username, setUsername,
        password, setPassword,
        errorMessage, login,

        // 忘記密碼相關
        forgotMode, question, answer, setAnswer, forgotError,
        askQuestion, checkAnswer, setForgotMode
    } = useBooking();

    const navigate = useNavigate();
    const location = useLocation();

    // ✅ 按下登入按鈕
    const handleLogin = async () => {
        const result = await login();

        if (!result) return;

        // ★ 保險：如果 login 回傳 memID → 再寫一次
        if (result.memID) setUsername(result.memID);

        navigate("/");  // 成功後回首頁
    };



    return (
        <div className="page-center">
            <div className="form-container">

                <h1 className="form-title">會員登入</h1>

                {/* ======= 正常登入 ======= */}
                {!forgotMode && (
                    <>
                        <label className="form-label">會員編號</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="請輸入 memID"
                        />

                        <label className="form-label">密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                        />

                        {errorMessage && <p className="error-text">{errorMessage}</p>}

                        <button className="form-button" onClick={handleLogin}>
                            登入
                        </button>

                        <button className="terms-button" onClick={askQuestion}>
                            忘記密碼？
                        </button>
                    </>
                )}

                {/* ======= 忘記密碼模式 ======= */}
                {forgotMode && (
                    <>
                        <p className="form-label">密保問題：{question}</p>

                        <input
                            className="form-input"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="請輸入答案"
                        />

                        {forgotError && <p className="error-text">{forgotError}</p>}

                        <button className="form-button" onClick={checkAnswer}>
                            確認答案
                        </button>

                        <button
                            className="terms-button"
                            onClick={() => {
                                setAnswer("");
                                setForgotMode(false);
                            }}
                        >
                            返回登入
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}


