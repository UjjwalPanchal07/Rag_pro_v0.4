from fastapi import APIRouter, Depends
from app.services.retrieval_service import search_answer, search_answer_by_module
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/ask")
def ask(rfp_id: str, query: str, _: dict = Depends(get_current_user)):
    return {"answer": search_answer(rfp_id, query) or "No Answer Found"}


@router.get("/ask_by_module")
def ask_by_module(rfp_level_tag: str, module: str, query: str, _: dict = Depends(get_current_user)):
    return {"answer": search_answer_by_module(rfp_level_tag, module, query) or "No Answer Found"}
