from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MicroSaaS Marcenaria API",
    description="Backend API for Woodworking Project Management SaaS",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to MicroSaaS Marcenaria API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
