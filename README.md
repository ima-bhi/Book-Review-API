# Book Review API

A RESTful API for managing books and user reviews, built with Node.js, Express, MongoDB, and TypeScript.

---

## Project Setup Instructions

1. **Clone the repository**

   ```sh
   git clone https://github.com/ima-bhi/Book-Review-API.git
   cd book-review-api
   ```

2. **Use Node.js v20 and install dependencies**

   ```sh
   nvm use 20 # or ensure Node v20 is active
   npm install
   ```

3. **Set up environment variables**

   - The `.env` file is provided via Google Drive: [Download .env](https://drive.google.com/file/d/1wMexbDf8xrrLvYJ3_3NXF02D_t2nPCkW/view?usp=sharing)

4. **Start the server**

   ```sh
   DEFAULT_PORT = 3001  (change it on .env)

   npm start
   ```

   The API will be available at [http://localhost:3001](http://localhost:3001)

---

## Example API Requests

Below are example curl commands for common API operations.  
**(For more endpoints, see the attached Postman collection: [Postman Collection](https://api.postman.com/collections/16403500-4dfcea29-30fc-420f-94c2-dc574bce6620?access_key=PMAT-01JVXMXX9KJYMBZZX2HD77F3M6))**

TOKEN - USER LOGIN TOKEN (SET ON environment Variable)

### Register User

```sh
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login User

```sh
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create a Book (requires JWT token)

```sh
curl -X POST http://localhost:3001/books \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Book Title","author":"Author Name","genre":"Fiction","description":"A great book."}'
```

### Get All Books

```sh
curl -X GET http://localhost:3001/books \
  -H "Authorization: Bearer <your_token>"
```

### Get Book by ID

```sh
curl -X GET http://localhost:3001/books/<book_id> \
  -H "Authorization: Bearer <your_token>"
```

### Create Book Review

```sh
curl -X POST http://localhost:3001/books/<book_id>/review \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Excellent read!"}'
```

### Update Book Review

```sh
curl -X PUT http://localhost:3001/reviews/<review_id> \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"rating":4,"comment":"Updated review comment"}'
```

### Delete Book Review

```sh
curl -X DELETE http://localhost:3001/reviews/<review_id> \
  -H "Authorization: Bearer <your_token>"
```

---

## More API Endpoints

- Additional endpoints and usage examples are available in the [Postman Collection](https://api.postman.com/collections/16403500-4dfcea29-30fc-420f-94c2-dc574bce6620?access_key=PMAT-01JVXMXX9KJYMBZZX2HD77F3M6).

---

## Design Decisions & Assumptions

- **Authentication:** JWT-based authentication for all protected routes.
- **Validation:** Uses `celebrate` and `Joi` for request validation.
- **Pagination:** Implemented for listing books and reviews.
- **Error Handling:** Centralized error handling and consistent response format.
- **Assumption:** Each user can review a book only once.

---

## Database Schema

### User

| Field     | Type     | Description           |
| --------- | -------- | --------------------- |
| \_id      | ObjectId | Primary Key           |
| name      | String   | User's name           |
| email     | String   | User's email (unique) |
| password  | String   | Hashed password       |
| resetLink | String   | For password reset    |
| active    | Boolean  | Account status        |
| createdAt | Date     | Auto-generated        |
| updatedAt | Date     | Auto-generated        |

### Book

| Field       | Type     | Description       |
| ----------- | -------- | ----------------- |
| \_id        | ObjectId | Primary Key       |
| title       | String   | Book title        |
| author      | String   | Book author       |
| genre       | String   | Book genre        |
| description | String   | Book description  |
| addedBy     | ObjectId | Reference to User |
| createdAt   | Date     | Auto-generated    |
| updatedAt   | Date     | Auto-generated    |

### Review

| Field     | Type     | Description       |
| --------- | -------- | ----------------- |
| \_id      | ObjectId | Primary Key       |
| bookId    | ObjectId | Reference to Book |
| userId    | ObjectId | Reference to User |
| rating    | Number   | Rating (1-5)      |
| comment   | String   | Review text       |
| createdAt | Date     | Auto-generated    |
| updatedAt | Date     | Auto-generated    |
