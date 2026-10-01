// pages/MovieListPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./movie.css";

export default function MovieListPage() {

    const [movies, setMovies] = useState([]);
    const today = new Date();

    useEffect(() => {
        fetch("http://localhost:5001/movies-all")
            .then(res => res.json())
            .then(data => setMovies(data))
            .catch(err => console.error("Error:", err));
    }, []);

    // 分類：熱映中 / 即將上映
    const nowShowing = movies.filter(m => new Date(m.releaseDate) <= today);
    const comingSoon = movies.filter(m => new Date(m.releaseDate) > today);

    return (
        <div className="movie-list">

            <h1>電影介紹</h1>

            {/* 熱映中 */}
            <h2 className="section-title">🎞 熱映中</h2>
            <div className="movie-grid">
                {nowShowing.map(m => (
                    <Link to={`/movie/${m.movieID}`} key={m.movieID} className="movie-card">
                        <img src={m.picURL} alt={m.title} />
                        <h3>{m.title}</h3>
                        <p>{m.releaseDate.substring(0, 10)}</p>
                    </Link>
                ))}
            </div>

            {/* 即將上映 */}
            <h2 className="section-title"> 即將上映</h2>
            <div className="movie-grid">
                {comingSoon.map(m => (
                    <Link to={`/movie/${m.movieID}`} key={m.movieID} className="movie-card">
                        <img src={m.picURL} alt={m.title} />
                        <h3>{m.title}</h3>
                        <p>{m.releaseDate.substring(0, 10)}</p>
                    </Link>
                ))}
            </div>

        </div>
    );
}
