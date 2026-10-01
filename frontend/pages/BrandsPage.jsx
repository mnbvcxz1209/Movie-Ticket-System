import React, { useEffect, useState } from "react";
import "./brand.css";
export default function BrandsPage() {

    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:5001/brands")
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setBrands(result.data);
                } else {
                    setError("資料取得失敗");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching brands:", err);
                setError("連線失敗");
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="text-center mt-10 text-lg">載入中...</p>;
    if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">🎬 映演品牌</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {brands.map((b) => (
                    <div
                        key={b.brandID}
                        className="brand-card shadow-lg rounded-xl overflow-hidden bg-white"
                    >
                        <img
                            src={b.picURL || "https://via.placeholder.com/300"}
                            alt={b.name}
                            className="w-full h-48 object-cover"
                        />

                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{b.name}</h2>

                            <p className="text-gray-700 whitespace-pre-line text-sm">
                                {b.brand_des}
                            </p>

                            {b.site_des && (
                                <p className="mt-3 text-blue-700 whitespace-pre-line text-sm">
                                    {b.site_des}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}
