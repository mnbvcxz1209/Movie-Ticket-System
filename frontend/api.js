const BASE_URL = "http://localhost:5000"; // 你的 Flask port

export async function register(data) {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}
