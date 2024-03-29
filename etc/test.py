import requests

url = 'http://localhost:3000'


def get(path, token=None):
    res = requests.get(
        f'{url}/{path}',
        headers = {} if not token else {
            'Authorization': f'Bearer {token}'
        })

    try:
        return res.json()
    except:
        return res.text


def post(path, data, token=None):
    res = requests.post(
        f'{url}/{path}',
        json=data,
        headers={} if not token else {
            'Authorization': f'Bearer {token}'
        })

    try:
        return res.json()
    except:
        return res.text


def patch(path, data, token=None):
    res = requests.patch(
        f'{url}/{path}',
        json=data,
        headers={} if not token else {
            'Authorization': f'Bearer {token}'
        })

    try:
        return res.json()
    except:
        return res.text


def delete(path, token=None):
    return requests.delete(
        f'{url}/{path}',
        headers={} if not token else {
            'Authorization': f'Bearer {token}'
        })


def login(username, password):
    return post('login', {'username': username, 'password': password})['token']


def register(username, password):
    return post('register', {'username': username, 'password': password})['token']


def create_wargear(name, type_id, token):
    return post('wargear', {
        'name': name,
        'type': type_id
    }, token)


def setup():
    types = ['Melee weapon', 'Ranged weapon', 'Grenade', 'Other']
    weapons = [
        {'name': 'Hot-Shot lasgun', 'type': 2},
        {'name': 'Hot-Shot laspistol', 'type': 2},
        {'name': 'Frag grenade', 'type': 3},
        {'name': 'Chainsword', 'type': 1},
        {'name': 'Power sword', 'type': 1}
    ]
    ranks = ['Colonel', 'Captain', 'Private', 'Sergeant']
    honours = [
        {'name': 'Red ribbon', 'description': 'Purely decorative'},
        {'name': 'Silver ribbon', 'description': 'Even more decorative'}
    ]

    battles = [
        {'name': 'The battle for Test hill', 'description': 'The battle for Test hill', 'location': 'Test hill', 'date': '1970-01-01'},
        {'name': 'The second battle for Test hill', 'description': 'They came back for more', 'location': 'Test hill', 'date': '1970-01-02'}
    ]

    models = [
        {'name': 'Foo', 'rank': 3, 'wargear': [1, 2], 'honours': []},
        {'name': 'Bar', 'rank': 3, 'wargear': [1, 2], 'honours': []},
        {'name': 'Baz', 'rank': 4, 'wargear': [1, 2, 4], 'honours': [
            {'honour': 1, 'battle': 1, 'reason': 'Just because'}
        ]}
    ]

    units = [
        {'name': 'Test squad', 'members': [1, 2, 3], 'leader': 3, 'honours': [
            {'honour': 2, 'battle': 1, 'reason': 'Just because'}
        ]}
    ]

    token = register('test', '1234')

    for t in types:
        print(post('wargear/types', {'name': t}, token))

    for w in weapons:
        print(post('wargear', w, token))

    for r in ranks:
        print(post('ranks', {'name': r}, token))

    for h in honours:
        print(post('honours', h, token))

    for b in battles:
        print(post('battles', b, token))

    for m in models:
        print(post('models', m, token))

    for u in units:
        print(post('units', u, token))
