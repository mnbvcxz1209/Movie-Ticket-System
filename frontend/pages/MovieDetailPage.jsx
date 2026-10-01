// pages/MovieDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./movie.css";


export default function MovieDetailPage() {

    const { id } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5001/movie-one?id=${id}`)
            .then(res => res.json())
            .then(data => setMovie(data))
            .catch(err => console.error("Error:", err));
    }, [id]);

    if (!movie) return <h2>Loading...</h2>;

    return (
        <div className="movie-detail">
            <div className="poster-box">
                <img src={movie.picURL} alt={movie.title} />
            </div>

            <div className="info-box">
                <h1>{movie.title}</h1>
                <p><b>上映日期：</b>{movie.releaseDate}</p>
                <p><b>片長：</b>{movie.movieTime}</p>
                <p><b>分級：</b>{movie.className}</p>
                <p><b>類型：</b>{movie.typeName}</p>
                <p><b>導演：</b>{movie.director}</p>
                <h3>演員：</h3>
                <p className="multiline">{movie.actor}</p>

                <h3>電影簡介</h3>
                <p className="multiline">{movie.content}</p>
            </div>
        </div>
    );
}
