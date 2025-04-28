import React from 'react';
import { Link } from 'react-router-dom';
import '../profile.css';
import Navbar from '../components/Navbar';

const ProfileView = () => {
  const orders = [
    {
      id: 'HMEGHDESD05989',
      date: 'Thu, Mar 20th, 05:04 PM',
      total: 'EGP 918.20',
      items: 1,
      delivered: true
    },
    {
      id: 'HMEGHDE4617/13',
      date: 'Fri, Aug 16th, 12:04 PM',
      total: 'EGP 898.00',
      items: 1,
      delivered: true
    }
  ];

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-layout">
        {/* Left Side Menu */}
        <aside className="account-menu">
          <h3>MY ACCOUNT</h3>
          <ul>
            <li className="menu-header">ORDERS</li>
            <li><Link to="/favourites">FAVOURITES</Link></li>
            <li><Link to="/address-book">ADDRESS BOOK</Link></li>
            
            <li className="menu-header">PROFILE</li>
            <li><Link to="/reviews">MY REVIEWS</Link></li>
            
            <li className="menu-header">PAYMENT</li>
            <li><Link to="/payment-cards">PAYMENT CARDS</Link></li>
            <li><Link to="/egift-card">EGIFT CARD</Link></li>
            
            <li className="menu-signout"><Link to="/signout">SIGN OUT</Link></li>
          </ul>
          
          <div className="breadcrumb">
            <Link to="/">HOME</Link> / <Link to="/my-account">MY ACCOUNT</Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="profile-content">
          <div className="profile-header">
            <h1>ACCOUNT & REWARDS</h1>
          </div>

          <section className="recent-orders">
            <h2>RECENT ORDERS</h2>
            {orders.map((order, index) => (
              <div key={index} className="order-card">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Order Total</th>
                      <th>Total Order Items</th>
                      <th>Delivered</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{order.id}</td>
                      <td>{order.date}</td>
                      <td>{order.total}</td>
                      <td>{order.items}</td>
                      <td>{order.delivered ? '✓' : ''}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
            <button className="view-all-btn">VIEW ALL ORDERS</button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfileView;