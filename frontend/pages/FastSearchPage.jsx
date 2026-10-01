import React, { useState, useEffect } from "react";
import "./FastSearchPage.css"; 
export default function FastSearchPage() {

    const [mode, setMode] = useState(""); // "cinema" / "movie"
    const [cinemas, setCinemas] = useState([]);
    const [movies, setMovies] = useState([]);

    const [selectedCinema, setSelectedCinema] = useState("");
    const [selectedMovie, setSelectedMovie] = useState("");

    const [resultMovies, setResultMovies] = useState([]); // 影城模式
    const [movieCinemaData, setMovieCinemaData] = useState([]); // 電影模式（cinema + times）

    // ---------------------------------------------------
    // 取得影城
    // ---------------------------------------------------
    useEffect(() => {
        fetch("http://localhost:5001/cinemas")
            .then(res => res.json())
            .then(data => setCinemas(data));
    }, []);

    // ---------------------------------------------------
    // 取得所有電影
    // ---------------------------------------------------
    useEffect(() => {
        fetch("http://localhost:5001/movies-all")
            .then(res => res.json())
            .then(data => setMovies(data));
    }, []);

    // ---------------------------------------------------
    // 影城模式 顯示該影城正在上映的電影
    // ---------------------------------------------------
    useEffect(() => {
        if (mode !== "cinema" || !selectedCinema) return;

        fetch(`http://localhost:5001/movies?cinemaID=${selectedCinema}`)
            .then(res => res.json())
            .then(data => setResultMovies(data))
            .catch(err => console.log("movies error", err));
    }, [mode, selectedCinema]);

    // ---------------------------------------------------
    // 電影模式 使用 /movie-cinema 取得上映影城 + 場次
    // ---------------------------------------------------
    useEffect(() => {
        if (mode !== "movie" || !selectedMovie) return;

        fetch(`http://localhost:5001/movie-cinema?movieID=${selectedMovie}`)
            .then(res => res.json())
            .then(data => {
                console.log("movie-cinema 回傳:", data);
                setMovieCinemaData(data);
            })
            .catch(err => console.log("movie-cinema error", err));
    }, [mode, selectedMovie]);

    return (
        <div className="fast-search-page">

            <div className="search-card">
                <h2 className="title"> 快速搜尋</h2>

                {/* 搜尋模式 */}
                <div className="mode-select">
                    <label>
                        <input
                            type="radio"
                            checked={mode === "cinema"}
                            onChange={() => {
                                setMode("cinema");
                                setSelectedCinema("");
                                setSelectedMovie("");
                                setResultMovies([]);
                                setMovieCinemaData([]);
                            }}
                        />
                        依影城查詢
                    </label>

                    <label>
                        <input
                            type="radio"
                            checked={mode === "movie"}
                            onChange={() => {
                                setMode("movie");
                                setSelectedCinema("");
                                setSelectedMovie("");
                                setResultMovies([]);
                                setMovieCinemaData([]);
                            }}
                        />
                        依電影查詢
                    </label>
                </div>

                {/* =======================
                     影城模式
                ======================== */}
                {mode === "cinema" && (
                    <>
                        <h3>選擇影城</h3>

                        <select
                            value={selectedCinema}
                            onChange={(e) => setSelectedCinema(e.target.value)}
                        >
                            <option value="">請選擇影城</option>
                            {cinemas.map(c => (
                                <option key={c.cinemaID} value={c.cinemaID}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {resultMovies.length > 0 && (
                            <div className="result-box">
                                <h3>🎞 上映電影：</h3>
                                <ul>
                                    {resultMovies.map(m => (
                                        <li key={m.movieID}>{m.title}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {/* =======================
                     電影模式
                ======================== */}
                {mode === "movie" && (
                    <>
                        <h3>選擇電影</h3>

                        <select
                            value={selectedMovie}
                            onChange={(e) => setSelectedMovie(e.target.value)}
                        >
                            <option value="">請選擇電影</option>
                            {movies.map(m => (
                                <option key={m.movieID} value={m.movieID}>
                                    {m.title}
                                </option>
                            ))}
                        </select>

                        {/* 顯示上映影城與場次 */}
                        {movieCinemaData.length > 0 && (
                            <div className="result-box">
                                <h3>上映影城與場次：</h3>

                                {movieCinemaData.map((item, idx) => (
                                    <div className="cinema-item" key={idx}>
                                        <strong> {item.cinema}</strong>
                                        <ul>
                                            {item.times.map((t, j) => (
                                                <li key={j}>
                                                    {t.date}　{t.time}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}

                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}
