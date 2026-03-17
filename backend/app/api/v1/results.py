from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/results", tags=["results"])

@router.get("/")
def my_results(current_user: User = Depends(get_current_user)):
    return []

@router.get("/{result_id}")
def get_result(result_id: str, current_user: User = Depends(get_current_user)):
    return {}
