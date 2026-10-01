import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./HomePage.css";

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-container">

            {/* ======== 置頂按鈕列（Navbar） ======== */}
            <div className="top-menu">
                <button onClick={() => navigate("/terms")}>會員註冊</button>
                <button onClick={() => navigate("/booking")}>立即訂票</button>
                <button onClick={() => navigate("/fast-search")}>快速搜尋</button>
                <button onClick={() => navigate("/modify-member")}>修改會員資料</button>
                <button onClick={() => navigate("/orders")}>訂單紀錄</button>
                <button onClick={() => navigate("/movies")}>電影介紹</button>
                <button onClick={() => navigate("/brands")}>映演品牌介紹</button>
            </div>

            {/* ======== 首頁輪播 ======== */}
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                loop={true}
                className="home-swiper"
            >
                <SwiperSlide>
                    <div
                        className="banner"
                        style={{ backgroundImage: "url('/images/banner1.jpg')" }}
                    >
                        <div className="banner-text">
                            <h1>歡迎使用影城系統</h1>
                        </div>
                    </div>
                </SwiperSlide>

                <SwiperSlide>
                    <div
                        className="banner"
                        style={{ backgroundImage: "url('/images/banner2.jpg')" }}
                    >
                        <div className="banner-text">
                            <h1>最新活動現正進行中</h1>
                        </div>
                    </div>
                </SwiperSlide>

                <SwiperSlide>
                    <div
                        className="banner"
                        style={{ backgroundImage: "url('/images/banner3.jpg')" }}
                    >
                        <div className="banner-text">
                            <h1>立即訂票享受優惠</h1>
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>
    );
}
