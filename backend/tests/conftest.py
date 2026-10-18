import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    """
    Creates an isolated execution TestClient runner to target endpoint layers 
    without manual interface operations.
    ```
    """
    with TestClient(app) as test_client:
        yield test_client

