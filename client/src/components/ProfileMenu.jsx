import { Link } from 'react-router-dom';

const AccountMenu = ({ activeSection, onSectionChange }) => {
  const handleClick = (section) => {
    onSectionChange(section); 
  };

  return (
    <aside className="account-menu">
      <h3>MY ACCOUNT</h3>
      <ul>
       
        <li 
          className={activeSection === 'orders' ? 'active' : ''} 
          onClick={() => handleClick('orders')}
        >
          FAVOURITES
        </li>
        <li 
          className={activeSection === 'favourites' ? 'active' : ''} 
          onClick={() => handleClick('favourites')}
        >
          FAVOURITES
        </li>
        <li 
          className={activeSection === 'address-book' ? 'active' : ''} 
          onClick={() => handleClick('address-book')}
        >
          ADDRESS BOOK
        </li>

        <li className="menu-header">PROFILE</li>
        <li 
          className={activeSection === 'profile' ? 'active' : ''} 
          onClick={() => handleClick('profile')}
        >
          FAVOURITES
        </li>
        <li 
          className={activeSection === 'reviews' ? 'active' : ''} 
          onClick={() => handleClick('reviews')}
        >
          MY REVIEWS
        </li>

        <li className="menu-header">PAYMENT</li>
        <li 
          className={activeSection === 'payment-cards' ? 'active' : ''} 
          onClick={() => handleClick('payment-cards')}
        >
          PAYMENT CARDS
        </li>
        <li 
          className={activeSection === 'egift-card' ? 'active' : ''} 
          onClick={() => handleClick('egift-card')}
        >
          EGIFT CARD
        </li>

        <li className="menu-signout">
          <Link to="/signout">SIGN OUT</Link>
        </li>
      </ul>

      <div className="breadcrumb">
        <Link to="/">HOME</Link> / <Link to="/my-account">MY ACCOUNT</Link>
      </div>
    </aside>
  );
};

export default AccountMenu;
