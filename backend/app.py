from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import random
import string
import json

app = Flask(__name__)

# ★★★ 必須允許所有 API（含 /orders） ★★★
CORS(app, resources={r"/*": {"origins": "*"}})

# ====================================================================
# 連線資料庫
# ====================================================================
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="1234",
        database="cinema1",
        charset="utf8"
    )


# ====================================================================
# 工具：產生 unique orderID
# ====================================================================
def generate_order_id(cursor):
    while True:
        order_id = ''.join(random.choices(string.digits, k=8))
        cursor.execute("SELECT 1 FROM orders WHERE orderID=%s", (order_id,))
        if cursor.fetchone() is None:
            return order_id


# ====================================================================
# 會員登入 / 忘記密碼
# ====================================================================

@app.post("/api/login")
def api_login():
        data = request.json
        memID = data.get("memID")
        pwd = data.get("password")

        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # ★ 正確欄位：pwd，而不是 password
        cursor.execute("SELECT memID, pwd FROM member WHERE memID=%s", (memID,))
        row = cursor.fetchone()

        cursor.close()
        conn.close()

        # 帳號不存在
        if not row:
            return jsonify({"status": "error", "msg": "無此帳號"}), 400

        # 密碼錯誤
        if row["pwd"] != pwd:
            return jsonify({"status": "error", "msg": "密碼錯誤"}), 400

        # 成功登入
        return jsonify({
            "status": "success",
            "memID": row["memID"]
        }), 200




@app.post("/api/forgetpwd/question")
def forgetpwd_question():
    data = request.json
    memID = data.get("memID")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT question FROM forgetpwd WHERE memID=%s", (memID,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row:
        return jsonify({"success": True, "question": row["question"]})
    else:
        return jsonify({"success": False, "msg": "查無此會員"})


@app.post("/api/forgetpwd/check")
def forgetpwd_check():
    data = request.json
    memID = data.get("memID")
    answer = data.get("answer")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT answer FROM forgetpwd WHERE memID=%s", (memID,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row and row["answer"] == answer:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "msg": "密保回答錯誤"})


# ====================================================================
# 會員註冊
# ====================================================================
@app.post("/id-check")
def id_check():
    memID = request.json.get("idNumber")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT memID FROM member WHERE memID=%s", (memID,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({"exists": bool(row)})


@app.post("/register")
def register():
    data = request.json

    memID = data["memID"]
    account = data["email"]
    pwd = data["password"]
    last = data["lastName"]
    first = data["firstName"]
    birth = data["birth"]
    tel = data["tel"]
    q = data["security_question"]
    a = data["security_answer"]

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT memID FROM member WHERE memID=%s", (memID,))
        if cursor.fetchone():
            return jsonify({"status": "error", "msg": "此身分證字號已註冊"})

        cursor.execute("INSERT INTO deposit (memID) VALUES (%s)", (memID,))

        cursor.execute("""
            INSERT INTO member (memID, account, pwd, lastName, firstName, birth, tel)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (memID, account, pwd, last, first, birth, tel))

        cursor.execute("""
            INSERT INTO forgetpwd (memID, question, answer)
            VALUES (%s, %s, %s)
        """, (memID, q, a))

        conn.commit()
        return jsonify({"status": "success"})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "msg": str(e)})

    finally:
        cursor.close()
        conn.close()


# ====================================================================
# 電影訂票 API
# ====================================================================

# 1. 影城清單
@app.get("/cinemas")
def cinemas():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT cinemaID, name FROM cinema")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)


# 2. 某影城的電影
@app.get("/movies")
def get_movies():
    cinema_id = request.args.get("cinemaID")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT DISTINCT movie.movieID, movie.title
        FROM shows
        JOIN screen ON shows.screenID = screen.screenID
        JOIN movie ON shows.movieID = movie.movieID
        WHERE screen.cinemaID = %s
    """, (cinema_id,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)


# 3. 某電影的所有場次
@app.get("/shows")
def get_shows():
    cinema_id = request.args.get("cinemaID")
    movie_id = request.args.get("movieID")

    if not cinema_id or not movie_id:
        return jsonify({"error": "missing parameters"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            s.showID,
            DATE_FORMAT(s.showDate, '%Y-%m-%d') AS showDate,
            DATE_FORMAT(s.showTime, '%H:%i') AS showTime
        FROM shows s
        JOIN screen sc ON s.screenID = sc.screenID
        WHERE sc.cinemaID = %s AND s.movieID = %s
        ORDER BY s.showDate, s.showTime
    """, (cinema_id, movie_id))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(rows)




# 4. 某場次座位
@app.get("/seats")
def get_seats():
    show_id = request.args.get("showID")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # 1. 找出這個 showID 是哪個影廳（screenID）
    cursor.execute("""
        SELECT screenID FROM shows WHERE showID=%s
    """, (show_id,))
    show = cursor.fetchone()

    if not show:
        return jsonify({"error": "找不到場次"}), 404

    screen_id = show["screenID"]

    # 2. 找出這個影廳所有座位
    cursor.execute("""
        SELECT seatID, rowLabel, col
        FROM seats
        WHERE screenID=%s
        ORDER BY rowLabel ASC, col ASC
    """, (screen_id,))
    seats = cursor.fetchall()

    # 3. 找出座位狀態
    cursor.execute("""
        SELECT seatID, stateID
        FROM seatstate
        WHERE showID=%s
    """, (show_id,))
    seat_states = {row["seatID"]: row["stateID"] for row in cursor.fetchall()}

    cursor.close()
    conn.close()

    # 4. 組成 2D 陣列
    rows = {}
    for s in seats:
        row = s["rowLabel"]
        col = s["col"]

        if row not in rows:
            rows[row] = []

        state = seat_states.get(s["seatID"], 0)   # 預設可選(0)

        rows[row].append({
            "seatID": s["seatID"],
            "state": state
        })

    return jsonify(list(rows.values()))




@app.post("/lock-seat")
def lock_seat():
    data = request.json
    show_id = data.get("showID")
    seat_id = data.get("seatID")

    print("=== LOCK SEAT DEBUG ===")
    print("showID =", show_id)
    print("seatID =", seat_id)

    if not show_id or not seat_id:
        print("ERROR: 缺少資料")
        return jsonify({"success": False, "message": "缺少資料"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        print("查詢 seatstate...")
        cursor.execute("""
            SELECT stateID FROM seatstate
            WHERE showID=%s AND seatID=%s
        """, (show_id, seat_id))
        row = cursor.fetchone()

        print("查詢結果 row =", row)

        if row:
            if row["stateID"] != 0:
                print("ERROR: 已被選取")
                return jsonify({"success": False, "message": "座位已被選取"})

            print("更新座位 stateID=1 ...")
            cursor.execute("""
                UPDATE seatstate SET stateID=1
                WHERE showID=%s AND seatID=%s
            """, (show_id, seat_id))

        else:
            print("插入新座位 stateID=1 ...")
            cursor.execute("""
                INSERT INTO seatstate (showID, seatID, stateID)
                VALUES (%s, %s, 1)
            """, (show_id, seat_id))

        conn.commit()
        print("座位鎖定成功")
        return jsonify({"success": True})

    except Exception as e:
        print("🔥 SQL ERROR:", e)
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# 6. 全部票種
@app.get("/tickets")
def get_all_tickets():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT ticketID, name, price FROM ticket")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)


# 7. 單一票種
@app.get("/ticket")
def get_ticket():
    ticket_id = request.args.get("id")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT ticketID, name, price FROM ticket WHERE ticketID=%s", (ticket_id,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if not row:
        return jsonify({"error": "ticket not found"}), 404

    return jsonify(row)


# 8. 餐飲列表
@app.get("/foods")
def foods():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT foodID, name, price, picURL FROM foods")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)


# 9. 建立訂單
@app.post("/create-order")
def create_order():
    data = request.json

    mem_id = data.get("memID")
    show_id = data.get("showID")
    ticket_id = data.get("ticketID")
    quantity = data.get("quantity")
    foods = data.get("foods", [])
    seats = data.get("seats", [])
    pay_id = data.get("payID")   # ★ 新增：付款方式

    # ★ 必填欄位檢查（包含 payID）
    if not (mem_id and show_id and ticket_id and quantity and seats and pay_id):
        return jsonify({"success": False, "message": "缺少必要欄位"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        # ====== 取得票價 ======
        cursor.execute("SELECT price FROM ticket WHERE ticketID=%s", (ticket_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "message": "找不到票種"}), 400

        price = int(row["price"])
        ticket_total = price * int(quantity)

        # ====== 計算餐點總價 ======
        food_total = 0
        if foods:
            placeholders = ",".join(["%s"] * len(foods))
            cursor.execute(
                f"SELECT foodID, price FROM foods WHERE foodID IN ({placeholders})",
                tuple(foods)
            )
            for fp in cursor.fetchall():
                food_total += int(fp["price"])

        total_price = ticket_total + food_total

        # ====== 產生訂單編號 ======
        order_id = generate_order_id(cursor)

        # ====== 插入訂單主表（加入 payID） ======
        cursor.execute("""
            INSERT INTO orders (orderID, memID, showID, payID, totalPrice, orderStateID)
            VALUES (%s, %s, %s, %s, %s, 1)
        """, (order_id, mem_id, show_id, pay_id, total_price))

        # ====== 插入票券 ======
        cursor.execute("""
            INSERT INTO orderitems_ticket (orderID, ticketID, amount)
            VALUES (%s, %s, %s)
        """, (order_id, ticket_id, quantity))

        # ====== 插入餐點 ======
        for foodID in foods:
            cursor.execute("""
                INSERT INTO orderitems_food (orderID, foodID, amount)
                VALUES (%s, %s, 1)
            """, (order_id, foodID))

        # ====== 插入座位 ======
        for seatID in seats:
            cursor.execute("""
                INSERT INTO orderitems_seat (orderID, showID, seatID)
                VALUES (%s, %s, %s)
            """, (order_id, show_id, seatID))

        # ====== 顯示格式座位（SE001 → A1） ======
        seat_display = []
        for seatID in seats:
            cursor.execute("SELECT rowLabel, col FROM seats WHERE seatID=%s", (seatID,))
            seat_row = cursor.fetchone()
            if seat_row:
                seat_display.append(f"{seat_row['rowLabel']}{seat_row['col']}")

        conn.commit()

        # ====== 回傳完整訂單資訊 ======
        return jsonify({
            "success": True,
            "orderID": order_id,
            "payID": pay_id,
            "ticketTotal": ticket_total,
            "foodTotal": food_total,
            "totalPrice": total_price,
            "seats": seats,                # SE001, SE002...
            "seatDisplay": seat_display,   # A1, A2...
            "orderState": 1
        })

    except Exception as e:
        conn.rollback()
        print("[create-order ERROR]", e)
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()
        
#取得所有座位
@app.get("/all-seats")
def all_seats():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT seatID, rowLabel, col FROM seats")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)



# 10. 取得單一場次資訊
@app.get("/show")
def get_show():
    show_id = request.args.get("id")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            showID,
            movieID,
            screenID,
            DATE_FORMAT(showDate, '%Y-%m-%d') AS showDate,
            DATE_FORMAT(showTime, '%H:%i') AS showTime
        FROM shows 
        WHERE showID = %s
    """, (show_id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return jsonify({"error": "show not found"}), 404

    return jsonify(row)
# 11.電影清單
@app.get("/movies-all")
def movies_all():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
    SELECT 
        movieID, 
        title, 
        picURL,
        DATE_FORMAT(releaseDate, '%Y-%m-%d') AS releaseDate
    FROM movie
""")

    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)

#查詢單一電影的資訊
@app.get("/movie-one")
def get_one_movie():
    movie_id = request.args.get("id")
    if not movie_id:
        return jsonify({"error": "missing movie id"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            m.*,
            c.name AS className,
            t.name AS typeName
        FROM movie m
        LEFT JOIN movieclass c ON m.movieClassID = c.movieClassID
        LEFT JOIN movietype t ON m.movieTypeID = t.movieTypeID
        WHERE m.movieID = %s
    """, (movie_id,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    # ★★★ 重要：把 datetime/time/timedelta 全部轉字串 ★★★
    from datetime import datetime, date, time, timedelta

    for key in row:
        if isinstance(row[key], (datetime, date, time, timedelta)):
            row[key] = str(row[key])

    return jsonify(row)

# 12.電影找影城和場次
@app.get("/movie-cinema")
def movie_cinema():
    movie_id = request.args.get("movieID")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            c.cinemaID,
            c.name AS cinemaName,
            DATE_FORMAT(s.showDate, '%Y-%m-%d') AS showDate,
            DATE_FORMAT(s.showTime, '%H:%i') AS showTime
        FROM shows s
        JOIN screen sc ON s.screenID = sc.screenID
        JOIN cinema c ON sc.cinemaID = c.cinemaID
        WHERE s.movieID = %s
        ORDER BY c.cinemaID, s.showDate, s.showTime;
    """, (movie_id,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    # 按影城分組
    result = {}
    for r in rows:
        cname = r["cinemaName"]

        if cname not in result:
            result[cname] = []

        result[cname].append({
            "date": r["showDate"],
            "time": r["showTime"]
        })

    # 最終輸出
    output = [
        {"cinema": cname, "times": result[cname]}
        for cname in result
    ]

    return jsonify(output)
#查詢會員資料（載入用）
@app.get("/api/member")
def get_member():
    memID = request.args.get("memID")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT memID, account, lastName, firstName, tel FROM member WHERE memID=%s", (memID,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()
    return jsonify(row)
#更新會員資料
@app.post("/api/update-member")
def update_member():
    data = request.json
    memID = data["memID"]
    last = data["lastName"]
    first = data["firstName"]
    tel = data["tel"]
    email = data["email"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE member
        SET lastName=%s, firstName=%s, tel=%s, account=%s
        WHERE memID=%s
    """, (last, first, tel, email, memID))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"success": True})
#取得會員資料
@app.get("/api/getmember")
def api_get_member():
    memID = request.args.get("memID")

    if not memID:
        return jsonify({"error": "缺少 memID"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT memID, lastName, firstName, tel, account
        FROM member
        WHERE memID = %s
    """, (memID,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return jsonify({"error": "查無此會員"}), 404

    return jsonify(row)

#更新會員資料
@app.post("/api/update-member-modify")
def api_update_member():
    data = request.json

    memID = data.get("memID")
    lastName = data.get("lastName")
    firstName = data.get("firstName")
    tel = data.get("tel")
    email = data.get("email")   # 對應 account 欄位

    # 檢查欄位
    if not all([memID, lastName, firstName, tel, email]):
        return jsonify({"success": False, "msg": "所有欄位皆不可空白"}), 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        # 更新 member 表
        cursor.execute("""
            UPDATE member
            SET lastName=%s, firstName=%s, tel=%s, account=%s
            WHERE memID=%s
        """, (lastName, firstName, tel, email, memID))

        conn.commit()
        return jsonify({"success": True})

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "msg": str(e)}), 500

    finally:
        cursor.close()
        conn.close()
#查詢訂單紀錄        
@app.get("/orders")
def get_orders():
    memID = request.args.get("memID")
    if not memID:
        return jsonify({"status": "error", "msg": "memID required"})

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # ★ 主要訂單資料（不再使用 o.seatID）
    sql = """
        SELECT 
            o.orderID,
            o.orderTime,
            o.totalPrice,
            o.orderStateID,
            os.name AS orderState,
            c.name AS cinemaName,
            m.title AS movieTitle,
            s.showDate,
            s.showTime
        FROM orders o
        LEFT JOIN orderstate os ON o.orderStateID = os.orderStateID
        LEFT JOIN shows s ON o.showID = s.showID
        LEFT JOIN movie m ON s.movieID = m.movieID
        LEFT JOIN screen sc ON s.screenID = sc.screenID
        LEFT JOIN cinema c ON sc.cinemaID = c.cinemaID
        WHERE o.memID = %s
        ORDER BY o.orderTime DESC
    """

    cursor.execute(sql, (memID,))
    orders = cursor.fetchall()

    # ========= JSON 序列化處理 =========
    from datetime import datetime, date, time, timedelta
    def safe_convert(val):
        if isinstance(val, (datetime, date, time, timedelta)):
            return str(val)
        return val

    # ========= 補上：餐點 + 座位 =========
    for order in orders:
        orderID = order["orderID"]

        # ⭐ 修正：轉成可序列化
        for key in order:
            order[key] = safe_convert(order[key])

        # ---------- 取得餐點 ----------
        cursor.execute("""
            SELECT f.name, f.price 
            FROM orderitems_food oi 
            JOIN foods f ON oi.foodID = f.foodID
            WHERE oi.orderID = %s
        """, (orderID,))
        order["foods"] = cursor.fetchall()

        # ---------- 取得座位 ----------
        cursor.execute("""
            SELECT s.rowLabel, s.col
            FROM orderitems_seat oi
            JOIN seats s ON oi.seatID = s.seatID
            WHERE oi.orderID = %s
        """, (orderID,))

        seat_rows = cursor.fetchall()

        # 轉換成 A1、B3 這種格式
        order["seats"] = [
            f"{row['rowLabel']}{row['col']}"
            for row in seat_rows
        ]

    cursor.close()
    conn.close()

    return jsonify({"status": "ok", "orders": orders})

#取消訂單
@app.post("/cancel-order")
def cancel_order():
    data = request.json
    order_id = data.get("orderID")

    if not order_id:
        return jsonify({"status": "error", "msg": "缺少 orderID"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        # 查詢場次
        cursor.execute("SELECT showID FROM orders WHERE orderID=%s", (order_id,))
        order = cursor.fetchone()
        if not order:
            return jsonify({"status": "error", "msg": "訂單不存在"}), 400
        show_id = order["showID"]

        # 設訂單狀態
        cursor.execute(
            "UPDATE orders SET orderStateID = 2 WHERE orderID = %s",
            (order_id,)
        )

        # 查該訂單所有座位
        cursor.execute(
            "SELECT seatID FROM orderitems_seat WHERE orderID=%s AND showID=%s",
            (order_id, show_id)
        )
        seat_rows = cursor.fetchall()

        # 釋放座位
        for s in seat_rows:
            cursor.execute(
                "UPDATE seatstate SET stateID = 0 WHERE showID=%s AND seatID=%s",
                (show_id, s["seatID"])
            )

        conn.commit()
        return jsonify({"status": "ok", "msg": "訂單已取消"})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "msg": str(e)})

    finally:
        cursor.close()
        conn.close()

@app.get("/seat-info")
def seat_info():
    seat_id = request.args.get("seatID")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT rowLabel, col
        FROM seats
        WHERE seatID=%s
    """, (seat_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    return jsonify(row)
#映演品牌
@app.get("/brands")
def get_brands():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM brands")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"success": True, "data": rows})

#選擇付款方式1.臨櫃付款2.線上付款
@app.get("/pay")
def get_pay_methods():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT payID, name, content FROM pay")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)
@app.get("/api/member/account-summary")
def member_account_summary():
    memID = request.args.get("memID")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # 儲值餘額
    cursor.execute("""
        SELECT IFNULL(SUM(amount),0) AS balance
        FROM deposit WHERE memID=%s
    """, (memID,))
    balance = cursor.fetchone()["balance"]

    # 點數
    cursor.execute("""
        SELECT IFNULL(SUM(points),0) AS points
        FROM points WHERE memID=%s
    """, (memID,))
    points = cursor.fetchone()["points"]

    # 信用卡
    cursor.execute("""
        SELECT RIGHT(card,4) AS last4
        FROM creditcard WHERE memID=%s
    """, (memID,))
    card = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "balance": balance,
        "points": points,
        "cardLast4": card["last4"] if card else None
    })

@app.post("/api/member/bind-card")
def bind_card():
    data = request.json
    memID = data["memID"]
    card = data["card"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO creditcard (memID, card)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE card=%s
    """, (memID, card, card))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({ "success": True })




# ====================================================================
# DB 測試
# ====================================================================
@app.get("/db-check")
def db_check():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")
        db_name = cursor.fetchone()[0]
        return jsonify({"using_database": db_name})
    except Exception as e:
        return jsonify({"error": str(e)})


# ====================================================================
# 啟動 Server
# ====================================================================
if __name__ == "__main__":
    print("啟動 Flask 伺服器中...")
    app.run(host="127.0.0.1", port=5001, debug=True)
