from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/me")
def my_analytics(current_user: User = Depends(get_current_user)):
    return {}
