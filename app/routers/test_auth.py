from fastapi import APIRouter, Depends

from app.security import get_current_account


router = APIRouter(
    prefix="/test",
    tags=["Authentication Test"]
)


@router.get("/protected")
def protected_route(
    current_account=Depends(get_current_account)
):
    return {
        "message": "Access granted",
        "account_id": current_account.account_id,
        "role": current_account.role
    }