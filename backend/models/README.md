This folder contains data models for the backend.

### User Model

- `_id`: ObjectId
- `name`: string
- `username`: string
- `email`: string
- `password`: string (hashed)
- `following`: number
- `followers`: number
- `tweets`: array of tweet IDs (references to the `tweets` collection)

### Tweet Model

- `_id`: ObjectId
- `content`: string
- `authorId`: string (reference to the user's `_id`)
- `createdAt`: string (ISO timestamp)
