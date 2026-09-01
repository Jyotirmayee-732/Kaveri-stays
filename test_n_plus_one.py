from sqlalchemy import event, text
from app.database import engine, SessionLocal


query_count = 0


def count_queries(conn, cursor, statement, parameters, context, executemany):
    global query_count
    query_count += 1


event.listen(engine, "before_cursor_execute", count_queries)


def n_plus_one_version():
    global query_count
    query_count = 0

    db = SessionLocal()

    try:
        # Query 1: get bookings
        bookings = db.execute(
            text("""
                SELECT booking_id, guest_id, room_id
                FROM bookings
                LIMIT 10
            """)
        ).fetchall()

        # N additional queries
        for booking in bookings:
            db.execute(
                text("""
                    SELECT guest_id, full_name, email
                    FROM guests
                    WHERE guest_id = :guest_id
                """),
                {
                    "guest_id": booking.guest_id
                }
            ).fetchone()

    finally:
        db.close()

    return query_count


def fixed_version():
    global query_count
    query_count = 0

    db = SessionLocal()

    try:
        # One query gets bookings + guest information together
        db.execute(
            text("""
                SELECT
                    b.booking_id,
                    b.guest_id,
                    b.room_id,
                    g.full_name,
                    g.email
                FROM bookings b
                JOIN guests g
                    ON g.guest_id = b.guest_id
                LIMIT 10
            """)
        ).fetchall()

    finally:
        db.close()

    return query_count


before = n_plus_one_version()
after = fixed_version()

print()
print("========================================")
print("N+1 QUERY MEASUREMENT")
print("========================================")
print(f"Before fixing: {before} SQL queries")
print(f"After fixing:  {after} SQL queries")
print("========================================")