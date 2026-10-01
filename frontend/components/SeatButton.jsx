import React from "react";
import "./SeatButton.css";   // ★ 加上獨立 CSS

export default function SeatButton({ label, isSold, isSelected, onClick }) {

    let className = "seat-btn";

    if (isSold) {
        className += " sold";
    } else if (isSelected) {
        className += " selected";
    }

    return (
        <button
            disabled={isSold}
            onClick={onClick}
            className={className}
        >
            {label}
        </button>
    );
}

