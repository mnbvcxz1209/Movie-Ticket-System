import React, { useEffect, useState } from "react";
import { useBooking } from "../context/BookingContext";

export default function BookingPage() {
    const {
        setIsLoggedIn,
        selectedCinema, setSelectedCinema,
        selectedMovie, setSelectedMovie,
        selectedShowtime, setSelectedShowtime,
        bookingError, setBookingError,
        setCurrentStep
    } = useBooking();

    const [cinemas, setCinemas] = useState([]);
    const [movies, setMovies] = useState([]);
    const [showtimes, setShowtimes] = useState([]);

    // -------------------------------
    // 1. 取得影城
    // -------------------------------
    useEffect(() => {
        fetch("http://localhost:5001/cinemas")
            .then(res => res.json())
            .then(data => setCinemas(data))
            .catch(() => console.log("Failed to fetch cinemas"));
    }, []);

    // -------------------------------
    // 2. 取得該影城的電影
    // -------------------------------
    useEffect(() => {
        if (!selectedCinema) return;

        // 清空舊資料
        setMovies([]);
        setSelectedMovie("");
        setSelectedShowtime("");

        // 取得電影
        fetch(`http://localhost:5001/movies?cinemaID=${selectedCinema}`)
            .then(res => res.json())
            .then(data => setMovies(data))
            .catch(() => console.log("Failed to fetch movies"));
    }, [selectedCinema]);


    // -------------------------------
    // 3. 取得該電影的場次（shows）
    // -------------------------------
    useEffect(() => {
        if (!selectedCinema || !selectedMovie) return;

        setShowtimes([]);
        setSelectedShowtime("");

        fetch(`http://localhost:5001/shows?cinemaID=${selectedCinema}&movieID=${selectedMovie}`)
            .then(res => res.json())
            .then(data => setShowtimes(data))
            .catch(() => console.log("Failed to fetch showtimes"));
    }, [selectedMovie]);


    // -------------------------------
    // 下一步
    // -------------------------------
    const handleSubmit = () => {
        if (!selectedCinema || !selectedMovie || !selectedShowtime) {
            setBookingError("請完整選擇影城、電影和場次");
            return;
        }
        setBookingError("");
        setCurrentStep("ticket");
    };

    // -------------------------------
    // Render
    // -------------------------------
    return (
        <div className="page-center">
            <div className="form-container">
                <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 mt-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">電影訂票</h1>
                            <button
                                onClick={() => setIsLoggedIn(false)}
                                className="text-sm text-purple-600 hover:text-purple-800"
                            >
                                登出
                            </button>
                        </div>

                        <div className="space-y-6">

                            {/* 影城 */}
                            <div>
                                <label className="block text-sm font-medium mb-2">選擇影城</label>
                                <select
                                    value={selectedCinema}
                                    onChange={(e) => setSelectedCinema(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="">請選擇影城</option>
                                    {cinemas.map(c => (
                                        <option key={c.cinemaID} value={c.cinemaID}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 電影 */}
                            <div>
                                <label className="block text-sm font-medium mb-2">選擇電影</label>
                                <select
                                    value={selectedMovie}
                                    onChange={(e) => setSelectedMovie(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="">請選擇電影</option>
                                    {movies.map(m => (
                                        <option key={m.movieID} value={m.movieID}>
                                            {m.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 場次（shows） */}
                            <div>
                                <label className="block text-sm font-medium mb-2">選擇場次</label>
                                <select
                                    value={selectedShowtime}
                                    onChange={(e) => setSelectedShowtime(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="">請選擇場次</option>
                                    {showtimes.map(s => (
                                        <option key={s.showID} value={s.showID}>
                                            {s.showDate} {s.showTime}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {bookingError && (
                                <p className="text-red-600 text-sm font-medium">{bookingError}</p>
                            )}

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg"
                            >
                                下一步
                            </button>
                        </div>
                    </div>
                </div></div></div>
    );
}
