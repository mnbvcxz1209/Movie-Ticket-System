import React from "react";
import { useNavigate } from "react-router-dom";
import "../register.css";

export default function SuccessPage() {
    const navigate = useNavigate();

    return (<div className="page-center">
        <div className="form-container">
            <div className="success-container">
                <h1>註冊成功！</h1>
                <p>您現在可以使用帳號登入。</p>

                <button
                    className="back-home-btn"
                    onClick={() => navigate("/")}
                >
                    回到首頁
                </button>
            </div></div></div>
    );
}
