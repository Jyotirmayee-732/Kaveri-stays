from app.database import engine

connections = []

try:
    print("Pool before test:")
    print(engine.pool.status())

    # Hold connections until the pool is exhausted
    for i in range(16):
        print(f"\nOpening connection {i + 1}...")
        conn = engine.connect()
        connections.append(conn)
        print(engine.pool.status())

except Exception as e:
    print("\nPOOL EXHAUSTION ERROR:")
    print(type(e).__name__)
    print(str(e))

finally:
    print("\nClosing connections...")

    for conn in connections:
        conn.close()

    print("\nPool after test:")
    print(engine.pool.status())