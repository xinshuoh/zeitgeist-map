import pytest
from app import app

@pytest.fixture()
def client():
    return app.test_client()

def test_ping(client):
    response = client.get("/ping")
    assert response.data == b'Hello from backend!'

def test_country_top_tracks(client):
    response = client.get("/country_top_tracks?country_code=ae")
    obj = response.get_json()
    assert type(obj) == list