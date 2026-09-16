from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Deplexo API starter", version="1.0.0")

class Greeting(BaseModel):
    name: str = Field(min_length=1, max_length=80, pattern=r".*\S.*")

@app.get("/healthz")
def health():
    return {"status": "ok"}

@app.get("/")
def index():
    return {"message": "Hello from Deplexo", "docs": "/docs"}

@app.post("/greet")
def greet(body: Greeting):
    return {"message": f"Hello, {body.name.strip()}!"}
