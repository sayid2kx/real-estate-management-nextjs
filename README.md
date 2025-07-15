# 🏠 Real Estate Management System (REMS)

A comprehensive web-based application that facilitates digital real estate transactions between property sellers and buyers. Built with modern technologies for a seamless user experience.

## 🌟 Features

### 🔐 Authentication & User Management

- **Dual Role System**: Separate registration/login for buyers and sellers
- **Secure Authentication**: NextAuth.js with token-based session management
- **Protected Routes**: Role-based access control
- **User Profiles**: Personal information management with profile images

### 🏠 Property Management (Sellers)

- **Add Properties**: Post new listings with images, descriptions, and details
- **Edit Properties**: Update existing property information
- **Delete Properties**: Remove properties from listings
- **Dashboard**: Centralized property management interface

### 🔍 Property Discovery (Buyers)

- **Browse Listings**: View all available properties
- **Advanced Filters**: Filter by location, price range, and property type
- **Property Details**: Comprehensive property information display
- **Review System**: Read and submit property reviews

### 💬 Communication & Transactions

- **Buy/Negotiation Requests**: Send purchase or negotiation requests
- **Request Management**: Sellers can accept/reject requests
- **Real-time Chat**: Direct communication between buyers and sellers
- **Email Notifications**: Automatic updates for key actions

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components, API Routes)
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Language**: JavaScript

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sayid2kx/sales-management-system-nextjs.git
   cd sales-management-system-nextjs
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/testdb"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Gmail Service (for email notifications)
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Database Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update the `DATABASE_URL` in your `.env` file
3. The application will automatically create necessary collections

### Authentication Setup

1. Configure NextAuth.js providers in `providers.js`
2. Set up your `NEXTAUTH_SECRET` - generate a secure random string
3. Configure session strategy and callbacks

### Gmail Service Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for your Gmail account
3. Update `GMAIL_USER` and `GMAIL_PASS` in your `.env` file
4. Test email delivery in development

### File Upload Configuration

1. Set up upload directories (`public/uploads/`)
2. Configure file size limits and allowed formats
3. Implement image optimization for property photos

## 👨‍💻 Author

**Sarowar Jahan Sayid**

- GitHub: [@sayid2kx](https://github.com/sayid2kx)
- Email: your.email@example.com

**Happy Coding! 🚀**
