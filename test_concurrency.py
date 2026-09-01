import requests
from concurrent.futures import ThreadPoolExecutor

URL = "http://127.0.0.1:8000/bookings"

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Iiwicm9sZSI6Imd1ZXN0IiwicHJvcGVydHlfaWQiOm51bGwsImlhdCI6MTc4ODI1MTczNSwiZXhwIjoxNzg4MjUyNjM1fQ.fiUHr1dp9CL9fXAVrRn3J-Iuq4eOqLNK3JjzE2asLEw"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

booking_data = {
    "property_id": 1,
    "guest_id": 25,
    "room_id": 32,
    "check_in": "2025-12-29",
    "check_out": "2025-12-31",
    "guest_count": 1
}


def create_booking():
    response = requests.post(
        URL,
        headers=headers,
        json=booking_data
    )

    print("Status:", response.status_code)
    print("Response:", response.text)
    print("-" * 60)


with ThreadPoolExecutor(max_workers=2) as executor:
    futures = [
        executor.submit(create_booking),
        executor.submit(create_booking)
    ]

    for future in futures:
        future.result()