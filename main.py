from fastapi import FastAPI, Request

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routers.auth import router as auth_router
from app.routers.test_auth import router as test_auth_router
from app.routers.properties import router as properties_router
from app.routers.bookings import router as bookings_router
from app.routers.rooms import router as rooms_router
from app.routers.guests import router as guests_router
from app.routers.reports import router as reports_router
from app.routers.payments import router as payments_router
from app.routers.reviews import router as reviews_router


# ============================================================
# RATE LIMITER
# ============================================================

limiter = Limiter(key_func=get_remote_address)


app = FastAPI(
    title="Kaveri Stays API",
    description="API for Kaveri Stays",
    version="1.0.0"
)


from fastapi.middleware.cors import CORSMiddleware

# Register rate limiter with FastAPI
app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(test_auth_router)
app.include_router(properties_router)
app.include_router(bookings_router)
app.include_router(rooms_router)
app.include_router(guests_router)
app.include_router(reports_router)
app.include_router(payments_router)
app.include_router(reviews_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Kaveri Stays API is running"
    }