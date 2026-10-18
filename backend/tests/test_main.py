def test_read_root_endpoint(client):
    """
    Verifies that the API entry point returns standard landing instructions.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Welcome to EasyLoan" in response.json()["message"]

def test_health_check_endpoint(client):
    """
    Verifies that the server system status reports absolute operational metrics.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "environment": "development"}
