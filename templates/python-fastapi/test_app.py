from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health():
    assert client.get("/healthz").json() == {"status": "ok"}

def test_greeting():
    response = client.post("/greet", json={"name": "Alex"})
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, Alex!"}

def test_invalid_name():
    for name in ("", "  ", "x" * 81):
        assert client.post("/greet", json={"name": name}).status_code == 422
