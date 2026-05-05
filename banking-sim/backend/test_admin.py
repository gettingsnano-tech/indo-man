import requests

login_data = {
    "email": "admin@bank.com",
    "password": "Admin1234"
}

try:
    auth_res = requests.post("http://127.0.0.1:5000/api/auth/login", json=login_data)
    token = auth_res.json()['token']
    
    headers = {"Authorization": f"Bearer {token}"}
    user_res = requests.get("http://127.0.0.1:5000/api/admin/users", headers=headers)
    print(f"Status: {user_res.status_code}")
    if user_res.status_code == 200:
        print("Success")
    else:
        print(f"Error: {user_res.text}")
except Exception as e:
    print(f"Exception: {e}")
