from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tests", tags=["tests"])

# Placeholder — wire up DB models and services in next iteration

@router.get("/")
def list_tests(exam: str = None, current_user: User = Depends(get_current_user)):
    return []

@router.get("/{test_id}")
def get_test(test_id: str, current_user: User = Depends(get_current_user)):
    return {}

@router.post("/{test_id}/start")
def start_test(test_id: str, current_user: User = Depends(get_current_user)):
    return {"sessionId": "placeholder", "questions": []}

@router.post("/{test_id}/submit")
def submit_test(test_id: str, current_user: User = Depends(get_current_user)):
    return {}

@router.get("/{test_id}/leaderboard")
def leaderboard(test_id: str, current_user: User = Depends(get_current_user)):
    return []
