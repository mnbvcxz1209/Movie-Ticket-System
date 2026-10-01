import React, { useEffect } from "react";
import { useBooking } from "../context/BookingContext";
import FoodCard from "../components/FoodCard";

export default function FoodPage() {

    const {
        foodList, setFoodList,
        selectedFoods, setSelectedFoods,
        setCurrentStep
    } = useBooking();

    
    useEffect(() => {
        fetch("http://localhost:5001/foods")
            .then(res => res.json())
            .then(data => setFoodList(data))
            .catch(err => console.error("餐點讀取錯誤:", err));
    }, []);

    // 切換餐點
    const handleToggleFood = (foodID) => {
        setSelectedFoods(prev => {
            if (prev.includes(foodID)) {
                return prev.filter(id => id !== foodID);
            }
            return [...prev, foodID];
        });
    };

    return (
        <div className="page-center">
            <div className="form-container">
                <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 mt-8">

                        <h1 className="text-3xl font-bold text-gray-800 mb-8">加購餐飲</h1>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {(foodList ?? []).map(food => (
                                <FoodCard
                                    key={food.foodID}
                                    food={food}
                                    isSelected={selectedFoods.includes(food.foodID)}
                                    onClick={() => handleToggleFood(food.foodID)}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentStep("payment")}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            確認
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
