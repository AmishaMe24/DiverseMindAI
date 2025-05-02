from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.routers import auth_routes, lesson_plan_routes, assessment_router, icebreaker_routes, pdf_routes
from app.config import FRONTEND_URL, SESSION_SECRET_KEY

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add session middleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY)

app.include_router(auth_routes.router, prefix="")
app.include_router(lesson_plan_routes.router, prefix="/lesson-plan")
app.include_router(assessment_router.router, prefix="/assessment", tags=["assessment"])
app.include_router(icebreaker_routes.router, prefix="/icebreaker-activity")
app.include_router(pdf_routes.router, prefix="/pdf", tags=["PDF"])

@app.get("/")
def root():
    return {"message": "FastAPI Google OAuth with .env Configuration"}