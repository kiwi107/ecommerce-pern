import React, { useState } from 'react';

import AdminProducts from './AdminProducts';
import AdminCampaigns from './AdminCampaigns';
import AdminOrders from './AdminOrders';
import AdminRefunds from './AdminRefunds';
import AdminCoupans from './AdminCoupans';
import AdminInventory from './AdminInventory';
import AdminTags from './AdminTags';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('products');

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <AdminProducts />;
      case 'campaigns':
        return <AdminCampaigns />;
      case 'orders':
        return <AdminOrders />;
      case 'refunds':
        return <AdminRefunds />;
      case 'coupons':
        return <AdminCoupans />;
      case 'inventory':
        return <AdminInventory />;
      case 'tags':
        return <AdminTags />;
      default:
        return null;
    }
  };

  // Kiwi color palette
  const colors = {
    light: '#d4f4dd',      // kiwi flesh
    medium: '#7fc97f',     // vibrant green
    dark: '#4c8c4a',       // deep kiwi skin
    hover: '#a5e0a1',      // lighter green hover
  };

  const buttonStyle = {
    border: 'none',
    textAlign: 'left',
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    transition: 'background-color 0.3s, color 0.3s',
    color: colors.dark,
    fontWeight: '500',
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.medium,
    color: 'white',
    fontWeight: '600',
  };

  const sidebarStyle = {
    backgroundColor: colors.light,
    width: '250px',
    minHeight: '100vh',
    padding: '24px 16px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={sidebarStyle}>
        <h4 style={{ color: colors.dark, marginBottom: '24px' }}>Admin Panel</h4>
        <ul className="nav flex-column">
          {[
            { key: 'products', label: 'Products', icon: 'bi-tag' },
            { key: 'campaigns', label: 'Promotional Campaigns', icon: 'bi-megaphone' },
            { key: 'orders', label: 'Orders', icon: 'bi-bag' },
            { key: 'refunds', label: 'Refunds', icon: 'bi-arrow-counterclockwise' },
            { key: 'coupons', label: 'Coupons', icon: 'bi-ticket-perforated' },
            { key: 'inventory', label: 'Inventory Management', icon: 'bi-box' },
            { key: 'tags', label: 'Tags', icon: 'bi-tags' },
          ].map((tab) => (
            <li className="nav-item mb-2" key={tab.key}>
              <button
                className="nav-link btn"
                style={activeTab === tab.key ? activeButtonStyle : buttonStyle}
                onClick={() => setActiveTab(tab.key)}
                onMouseOver={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = colors.hover;
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <i className={`bi ${tab.icon} fs-5 me-1`}></i> {tab.label}
              </button>
            </li>

          ))}
        </ul>
      </div>

      <div style={{
        flexGrow: 1,
        backgroundColor: '#f9fdf9',
        padding: '24px',
      }}>
        {renderContent()}
      </div>
    </div>
  );
}