import React from 'react';

import '../profile.css';
import Navbar from '../components/Navbar';
import AccountMenu from '../components/ProfileMenu'; 
import { useState,useEffect } from 'react';


const ProfileView = () => {
  const [activeSection, setActiveSection] =useState('orders'); 
  const [sectionData, setSectionData] = useState(null); // the fetched data
  const [loading, setLoading] = useState(false); // for spinner/loader
  const [error, setError] = useState(null); // if API fails

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSectionData(null);

      try {
        let response;
        switch (activeSection) {
          case 'favourites':
            response = await fetch(`${process.env.REACT_APP_API_URL}/user/favourites`,{
              method: 'Get',
              headers: { 'Content-Type': 'application/json' 
              },
              credentials: 'include',
            });
            break;
          case 'address-book':
            response = await fetch('/user/addresses');
            break;
          case 'reviews':
            response = await fetch('/user/reviews');
            break;
          case 'payment-cards':
            response = await fetch('/user/payment-cards');
            break;
          case 'egift-card':
            response = await fetch('/user/egift-cards');
            break;
          default:
            response = null;
        }
        if (response && response.ok) {
          const data = await response.json();
          setSectionData(data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };


    fetchData();

  });
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

    <div className="profile-view">
      <Navbar />
      <div className="profile-layout">

        <AccountMenu />
      </div>

    </div>

    
    
  );
};

export default ProfileView;