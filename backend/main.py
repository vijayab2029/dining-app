import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import menu

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menu.router)

@app.get("/")
def root():
    return {"message": "Dining app API running"}