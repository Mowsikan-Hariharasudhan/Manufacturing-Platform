# ManufactureFlow Backend

A comprehensive manufacturing management system backend built with Node.js, Express, and PostgreSQL.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 📦 **Product Management** - Complete product lifecycle management
- 🏭 **Manufacturing Orders** - End-to-end production order management
- ⚙️ **Work Centers** - Resource and capacity management
- 📋 **Bill of Materials (BOM)** - Recipe and component management
- 📊 **Stock Management** - Real-time inventory tracking
- 👥 **User Management** - Multi-role user system
- 📧 **Email Notifications** - Password reset and welcome emails
- 🔍 **Advanced Filtering** - Search, sort, and filter all data
- 📈 **Analytics** - Performance metrics and reporting

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: express-validator with custom middleware
- **Email**: Nodemailer for email services
- **Security**: Helmet, CORS, rate limiting

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd manufactureflow-backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up PostgreSQL database**
   - Create a new database
   - Run the SQL schema (provided separately)
   - Update database credentials in .env

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manufacturing_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code
- `GET /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Manufacturing Orders
- `GET /api/manufacturing-orders` - Get all manufacturing orders
- `GET /api/manufacturing-orders/:id` - Get order by ID
- `POST /api/manufacturing-orders` - Create new order
- `PUT /api/manufacturing-orders/:id` - Update order

### Work Centers
- `GET /api/work-centers` - Get all work centers
- `GET /api/work-centers/:id` - Get work center by ID
- `POST /api/work-centers` - Create new work center
- `PUT /api/work-centers/:id` - Update work center
- `DELETE /api/work-centers/:id` - Delete work center

### Stock Management
- `GET /api/stock/ledger` - Get stock ledger
- `GET /api/stock/movements` - Get stock movements
- `POST /api/stock/movements` - Record stock movement
- `GET /api/stock/alerts` - Get stock alerts

### Bill of Materials
- `GET /api/bom` - Get all BOMs
- `GET /api/bom/:id` - Get BOM by ID
- `POST /api/bom` - Create new BOM

### Work Orders
- `GET /api/work-orders` - Get all work orders
- `PATCH /api/work-orders/:id/status` - Update work order status

## User Roles

- **Admin** - Full system access
- **Manufacturing Manager** - Production planning and oversight
- **Inventory Manager** - Stock and inventory management
- **Operator** - Shop floor operations

## Database Schema

The system uses the following main tables:
- `users` - User accounts and authentication
- `products` - Product master data
- `work_centers` - Production resources
- `bills_of_materials` - Product recipes
- `manufacturing_orders` - Production orders
- `work_orders` - Individual operations
- `stock_movements` - Inventory transactions

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- CORS protection

## Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error array"]
}
```

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
src/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── config/          # Configuration files
├── utils/           # Utility functions
└── app.js           # Express app setup
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper logging
4. Configure HTTPS
5. Set up database backups
6. Monitor performance

## Support

For issues and questions, please create an issue in the repository or contact the development team.

## License

This project is licensed under the MIT License.
