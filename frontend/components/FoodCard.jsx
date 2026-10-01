import React from "react";

export default function FoodCard({ food, isSelected, onClick }) {

    const cardStyle = isSelected
        ? "border-purple-600 bg-purple-50"
        : "border-gray-300 hover:border-purple-300";

    // 如果後端給的是 picURL = "F001.jpg"，就自動補上完整路徑
    const imagePath = food.picURL?.startsWith("/images/")
        ? food.picURL
        : `/images/foods/${food.picURL}`;

    return (
        <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${cardStyle}`}
            onClick={onClick}
        >
            <img
                src={imagePath || "https://via.placeholder.com/150"}
                alt={food.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
            />

            <h3 className="text-lg font-bold text-gray-800 mb-2">{food.name}</h3>

            <p className="text-purple-600 font-bold text-xl">${food.price}</p>

            <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                    {isSelected ? "已選擇" : "點擊選擇"}
                </span>
                {isSelected && (
                    <span className="text-purple-600 text-2xl">✓</span>
                )}
            </div>
        </div>
    );
}

