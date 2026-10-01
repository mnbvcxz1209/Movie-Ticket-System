from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt

# from db import (   # ← 完全註解掉資料庫
#     get_connection,
#     TABLE_MEMBERS,
#     COL_ID_NUMBER,
#     COL_NAME,
#     COL_BIRTHDAY,
#     COL_PHONE,
#     COL_EMAIL,
#     COL_PASSWORD_HASH,
#     COL_SEC_Q,
#     COL_SEC_A,
# )

app = FastAPI()

# ================================
# CORS for React (port 3000)
# ================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# Models (Request / Response)
# ================================
class IdCheckRequest(BaseModel):
    idNumber: str

class BasicInfoRequest(BaseModel):
    idNumber: str
    name: str
    birthday: str
    phone: str

class EmailCheckRequest(BaseModel):
    email: str

class PasswordRequest(BaseModel):
    idNumber: str
    password: str

class SecurityRequest(BaseModel):
    idNumber: str
    question: str
    answer: str


# ================================
# API 1: 身分證查重（不查 DB 直接回傳不存在）
# ================================
@app.post("/id-check")
def check_id(req: IdCheckRequest):
    print("收到 ID 檢查:", req.idNumber)
    return {"exists": False}   # 永遠回傳不存在（讓你能測試流程）


# ================================
# API 2: 儲存基本資料（只顯示 log）
# ================================
@app.post("/basic-info")
def save_basic_info(req: BasicInfoRequest):
    print("收到基本資料:", req)
    return {"success": True}


# ================================
# API 3: Email 查重（不查 DB）
# ================================
@app.post("/email-check")
def email_check(req: EmailCheckRequest):
    print("收到 email 檢查:", req.email)
    return {"exists": False}


# ================================
# API 4: 儲存密碼（只印出 hash）
# ================================
@app.post("/password")
def save_password(req: PasswordRequest):
    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt())
    print("收到密碼存入:", req.idNumber, hashed)
    return {"success": True}


# ================================
# API 5: 儲存安全問題（只顯示 log）
# ================================
@app.post("/security")
def save_security(req: SecurityRequest):
    print("收到安全問題:", req)
    return {"success": True}
