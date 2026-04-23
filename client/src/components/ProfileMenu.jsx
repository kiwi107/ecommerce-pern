import { useNavigate } from 'react-router-dom';
//import auth form context
import { useAuth } from '../contexts/authContext';

const AccountMenu = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { setAuthState } = useAuth(); // Get setAuthState from context
  const handleClick = (section) => {
    setActiveSection(section);
  };
  //delete cookie called token
  const handleSignOut = () => {
    fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        //set auth state to false
        setAuthState({
          isAuthenticated: false,
          user: null,
          lastChecked: Date.now(),
          loading: false
        });
      })
      .catch((error) => {
        console.error('Error during logout:', error);
      });
    navigate('/');
  }




  return (
    <aside className="account-menu">
      <h3>MY ACCOUNT</h3>
      <ul>

        <li
          className={activeSection === 'profile' ? 'active' : ''}
          onClick={() => handleClick('profile')}
        >
          PROFILE
        </li>
        <li
          className={activeSection === 'orders' ? 'active' : ''}
          onClick={() => handleClick('orders')}
        >
          MY ORDERS
        </li>

        <li
          className={activeSection === 'address-book' ? 'active' : ''}
          onClick={() => handleClick('address-book')}
        >
          ADDRESS BOOK
        </li>



        <li
          className={activeSection === 'reviews' ? 'active' : ''}
          onClick={() => handleClick('reviews')}
        >
          MY REVIEWS
        </li>

        <li
          className={activeSection === 'refunds' ? 'active' : ''}
          onClick={() => handleClick('refunds')}
        >
          MY REFUNDS
        </li>



        <li className="menu-signout">
          <button className="btn btn-danger" onClick={() => handleSignOut()}>
            <i className="fas fa-sign-out-alt"></i>
            SIGN OUT
          </button>
        </li>
      </ul>


    </aside>
  );
};

export default AccountMenu;
