import requests

url = 'http://localhost:3000'


def get(path, token=None):
    return requests.get(
        f'{url}/{path}',
        headers = {} if not token else {
            'Authorization': f'Bearer {token}'
        }).json()


def post(path, data, token=None):
    return requests.post(
        f'{url}/{path}',
        json=data,
        headers={} if not token else {
            'Authorization': f'Bearer {token}'
        }).json()


def patch(path, data, token=None):
    return requests.patch(
        f'{url}/{path}',
        json=data,
        headers={} if not token else {
            'Authorization': f'Bearer {token}'
        }).json()


def login(username, password):
    return post('login', {'username': username, 'password': password})['token']


def create_wargear(name, type_id, token):
    return post('wargear', { 'name': name, 'type': type_id }, token)
