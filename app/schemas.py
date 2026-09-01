from datetime import date, datetime

from pydantic import BaseModel, Field
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

# ============================================================
# REGISTER
# ============================================================

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1)
    email: str = Field(min_length=3)
    phone: str | None = None
    city: str | None = None
    password: str = Field(min_length=8)


class RegisterResponse(BaseModel):
    message: str
    account_id: int
    guest_id: int
    role: str


# ============================================================
# LOGIN
# ============================================================

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    account_id: int
    guest_id: int
    role: str
    refresh_token: str


# ============================================================
# REFRESH
# ============================================================

class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    refresh_token: str


# ============================================================
# LOGOUT
# ============================================================

class LogoutRequest(BaseModel):
    refresh_token: str


class LogoutResponse(BaseModel):
    message: str


# ============================================================
# PAYMENT
# ============================================================

from decimal import Decimal


class PaymentCreateRequest(BaseModel):
    amount: Decimal = Field(gt=0)
    method: str
    reference: str | None = None


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: str
    method: str
    reference: str | None = None
    paid_at: date


class PaymentListResponse(BaseModel):
    items: list[PaymentResponse]
    total_paid: str
    balance: str

# ============================================================
# BOOKING
# ============================================================

class BookingCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    property_id: int
    guest_id: int
    room_id: int
    check_in: date
    check_out: date
    guest_count: int

    # Optional deposit payment
    deposit: PaymentCreateRequest | None = None


class BookingResponse(BaseModel):
    message: str
    booking_id: int
    guest_id: int
    room_id: int
    check_in: date
    check_out: date
    guest_count: int
    status: str


# ============================================================
# BOOKING STATUS
# ============================================================

class BookingStatusUpdateRequest(BaseModel):
    status: str


# ============================================================
# BOOKING LIST
# ============================================================

class BookingListItem(BaseModel):
    booking_id: int
    guest_id: int
    room_id: int
    property_id: int
    check_in: date
    check_out: date
    guest_count: int
    status: str
    created_at: datetime


class PaginationMeta(BaseModel):
    limit: int
    offset: int
    total: int


class BookingListResponse(BaseModel):
    items: list[BookingListItem]
    meta: PaginationMeta


# ============================================================
# BOOKING DETAIL
# ============================================================

class BookingDetailResponse(BaseModel):
    booking_id: int
    guest_id: int
    room_id: int
    check_in: date
    check_out: date
    guest_count: int
    status: str
    created_at: datetime


# ============================================================
# ROOM
# ============================================================

class RoomTypeResponse(BaseModel):
    name: str
    max_occupancy: int


class RoomResponse(BaseModel):
    id: int
    property_id: int
    room_number: str
    room_type: RoomTypeResponse


class RoomListResponse(BaseModel):
    items: list[RoomResponse]
    meta: PaginationMeta


# ============================================================
# GUEST
# ============================================================

class GuestResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None = None
    city: str | None = None


class GuestListResponse(BaseModel):
    items: list[GuestResponse]
    meta: PaginationMeta


# ============================================================
# ME
# ============================================================

class MeResponse(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    role: str
    property_id: int | None = None


# ============================================================
# REPORTS
# ============================================================

class OccupancyResponse(BaseModel):
    property_id: int
    from_: date = Field(alias="from")
    to: date
    total_rooms: int
    occupied_rooms: int
    occupancy_percent: float


class ADRResponse(BaseModel):
    property_id: int
    from_: date = Field(alias="from")
    to: date
    room_revenue: float
    room_nights: int
    adr: float


class RevPARResponse(BaseModel):
    property_id: int
    from_: date = Field(alias="from")
    to: date
    total_rooms: int
    available_room_nights: int
    room_revenue: float
    revpar: float