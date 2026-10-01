// 讀取全部註冊資料
export function getRegisterData() {
    return JSON.parse(localStorage.getItem("registerData") || "{}");
}

// 更新資料
export function updateRegisterData(newData) {
    const old = getRegisterData();
    const updated = { ...old, ...newData };
    localStorage.setItem("registerData", JSON.stringify(updated));
}

// 清除
export function clearRegisterData() {
    localStorage.removeItem("registerData");
}
