import requests
from concurrent.futures import ThreadPoolExecutor


URL = "http://127.0.0.1:8000/bookings"

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Iiwicm9sZSI6Imd1ZXN0IiwicHJvcGVydHlfaWQiOm51bGwsImlhdCI6MTc4ODIzOTcwMywiZXhwIjoxNzg4MjQwNjAzfQ.nfLgxt3gbmFkU7Rys1priiB-z7pMRV94ypy4bPHNDHU"


BOOKING_DATA = {
    "property_id": 1,
    "guest_id": 21,
    "room_id": 42,
    "check_in": "2029-03-10",
    "check_out": "2029-03-12",
    "guest_count": 1
}


def create_booking(name):
    response = requests.post(
        URL,
        json=BOOKING_DATA,
        headers={
            "Authorization": f"Bearer {TOKEN}"
        }
    )

    print(f"\n{name}")
    print("Status:", response.status_code)
    print("Response:", response.text)

    return response.status_code


with ThreadPoolExecutor(max_workers=2) as executor:

    future_a = executor.submit(
        create_booking,
        "Booking A"
    )

    future_b = executor.submit(
        create_booking,
        "Booking B"
    )

    status_a = future_a.result()
    status_b = future_b.result()


print("\n==============================")
print("CONCURRENCY TEST RESULT")
print("==============================")
print("Booking A:", status_a)
print("Booking B:", status_b)