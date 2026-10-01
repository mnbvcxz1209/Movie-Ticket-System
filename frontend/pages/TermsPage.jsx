import React from "react";
import { useNavigate } from "react-router-dom";
import "../register.css";

export default function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="page-center">
            <div className="form-container">
                <h1 className="form-title">會員權益說明</h1>
                <p>(這裡放會員權益文字)</p>

                <button
                    onClick={() => navigate("/id-check")}
                    className="form-button"
                >
                    我已閱讀並同意
                </button>
            </div>
        </div>
    );
}
