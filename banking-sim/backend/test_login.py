import requests

login_data = {
    "email": "alice@demo.com",
    "password": "User1234"
}

try:
    response = requests.post("http://127.0.0.1:5000/api/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
