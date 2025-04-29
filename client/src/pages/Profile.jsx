
import React from 'react';
import '../profile.css';
import Navbar from '../components/Navbar';
import AccountMenu from '../components/ProfileMenu'; 
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Image, Spinner, Alert } from 'react-bootstrap';

// Section components with Bootstrap styling
const ProfileSection = ({ userData }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(userData || {});
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState(null); 

  useEffect(() => {
    setFormData(userData || {});
  }, [userData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedData = {
        ...formData,
        address: `(${formData.address.street},${formData.address.city},${formData.address.state},${formData.address.country},${formData.address.zip})`
      };
  
      console.log('Saving data:', JSON.stringify(formattedData));
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save changes: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Save response:', data.message);
      setEditMode(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  

  const handleCancel = () => {
    setFormData(userData);
    setEditMode(false);
  };

  const handle_photo = async () => {
  if (!photo){
  alert("Please select a photo")
  return
}

    const formData = new FormData();
    formData.append('photo', photo);
    try{
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/upload_photo`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`Failed to upload photo: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Photo upload response:', data.message);

    }
    catch(err){
      alert(`Error: ${err.message}`);
    }
    finally{
      setPhoto(null)
    }

  }

  return (
    <Container className="profile-section py-4">
      <h2 className="mb-4">Profile Information</h2>
      <Row>
      <Col md={4} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <Image
                src={formData.profile_image || '/default-avatar.png'}
                roundedCircle
                width={150}
                height={150}
                className="mb-3"
              />
              {editMode && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    className="form-control form-control-sm mb-2"
                  />
                  <button className="btn btn-outline-primary btn-sm" onClick={handle_photo}>
                    Upload Photo
                  </button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <ListGroup variant="flush">
            {['username', 'email', 'phone'].map((field) => (
  <ListGroup.Item key={field}>
    <Row>
      <Col sm={3}><strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong></Col>
      <Col>
        {editMode ? (
          <input
            type="text"
            value={formData[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="form-control form-control-sm"
          />
        ) : (
          formData[field] || 'N/A'
        )}
      </Col>
    </Row>
  </ListGroup.Item>
))}

{/* Address fields */}
<ListGroup.Item>
  <Row>
    <Col sm={3}><strong>Address:</strong></Col>
    <Col>
      {editMode ? (
        <>
          {['street', 'city', 'state', 'country', 'zip'].map((subField) => (
            <input
              key={subField}
              placeholder={subField}
              className="form-control form-control-sm mb-1"
              value={formData.address?.[subField] || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    [subField]: e.target.value,
                  },
                }))
              }
            />
          ))}
        </>
      ) : (
        `${formData.address?.street || ''}, ${formData.address?.city || ''}, ${formData.address?.state || ''}, ${formData.address?.country || ''} - ${formData.address?.zip || ''}`
      )}
    </Col>
  </Row>
</ListGroup.Item>

            </ListGroup>
            <Card.Footer className="text-end">
              {editMode ? (
                <>
                  <button 
                    className="btn btn-sm btn-success me-2" 
                    onClick={handleSave} 
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
const OrdersSection = ({ orders }) => {
  return (
    <Container className="orders-section py-4">
      <h2 className="mb-4">Your Orders</h2>
      
      {orders?.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {orders.map(order => (
            <Col key={order.order_id}>
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Order #{order.order_id}</span>
                  <small className="text-muted">{order.order_date}</small>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total:</span>
                    <strong>{order.total_price}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Items:</span>
                    <span>{order.items} item(s)</span>
                  </div>
                  <Badge pill bg={order.delivered ? "success" : "warning"} className="w-100 py-2">
                    {order.delivered ? 'Delivered' : 'Processing'}
                  </Badge>
                </Card.Body>
                <Card.Footer className="text-center">
                  <button className="btn btn-sm btn-outline-primary">View Details</button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">You haven't placed any orders yet.</Alert>
      )}
    </Container>
  );
};

const FavouritesSection = ({ favourites }) => {
  return (
    <Container className="favourites-section py-4">
      <h2 className="mb-4">Your Favourites</h2>
      
      {favourites?.length > 0 ? (
        <Row xs={2} md={3} lg={4} className="g-4">
          {favourites.map(item => (
            <Col key={item.id}>
              <Card className="h-100">
                <Card.Img variant="top" src={item.image} style={{ height: '180px', objectFit: 'cover' }} />
                <Card.Body>
                  <Card.Title className="h6">{item.name}</Card.Title>
                  <Card.Text className="fw-bold text-primary">{item.price}</Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                  <button className="btn btn-sm btn-outline-success">Add to Cart</button>
                  <button className="btn btn-sm btn-outline-danger">Remove</button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">You don't have any favourites yet.</Alert>
      )}
    </Container>
  );
};

const ReviewsSection = ({ reviews }) => {
  return (
    <Container className="reviews-section py-4">
      <h2 className="mb-4">Your Reviews</h2>
      
      {reviews?.length > 0 ? (
        <Row>
          <Col>
            {reviews.map(review => (
              <Card key={review.id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Card.Title className="h6 mb-0">{review.productName}</Card.Title>
                    <div className="text-warning">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <Card.Text>{review.comment}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">{review.date}</small>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2">Edit</button>
                      <button className="btn btn-sm btn-outline-danger">Delete</button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      ) : (
        <Alert variant="info">You haven't written any reviews yet.</Alert>
      )}
    </Container>
  );
};

const ProfileView = () => {
  const [activeSection, setActiveSection] = useState('profile'); 
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for demonstration
  const mockData = {

    orders: [
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
    ],
    favourites: [
      {
        id: 1,
        name: 'Wireless Headphones',
        price: 'EGP 1,299.00',
        image: '/headphones.jpg'
      },
      {
        id: 2,
        name: 'Smart Watch',
        price: 'EGP 2,499.00',
        image: '/smartwatch.jpg'
      }
    ],
    reviews: [
      {
        id: 1,
        productName: 'Wireless Earbuds',
        rating: 4,
        comment: 'Great sound quality but battery life could be better.',
        date: '2 weeks ago'
      }
    ]
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSectionData(null);
  
      try {
        let endpoint = '';
        let response;
  
        switch (activeSection) {
          case 'profile':
            endpoint = '/users/info';
            break;
          case 'orders':
            endpoint = '/users/orders';
            break;
          case 'favourites':
            endpoint = '/users/favourites';
            break;
          case 'reviews':
            endpoint = '/users/reviews';
            break;
          default:
            endpoint = '/users/info';
        }
  
        // Make the API call
        response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();

        console.log('API response:', data); // Log the API response for debugging
        
        // Transform API response based on endpoint
        switch (activeSection) {
          case 'profile':
            setSectionData(data.user); // Assuming response is { user: {...} }
            console.log('Profile data:', data.user); // Log profile data for debugging
            break;
          case 'orders':
            console.log('Orders data:', data.orders); // Log orders data for debugging
            setSectionData(data.orders || []); // Assuming response is { orders: [...] }
            break;
          case 'favourites':
            setSectionData(data.favorites || []); // Assuming response is { favorites: [...] }
            break;
          case 'reviews':
            setSectionData(data.reviews || []); // Assuming response is { reviews: [...] }
            break;
          default:
            setSectionData(data);
        }
  
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        
        // Fallback to mock data if API fails
        setSectionData(mockData[activeSection] || null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [activeSection]);

  const renderSection = () => {
    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">Error: {error}</div>;
    }

    switch (activeSection) {
      case 'profile':
        return <ProfileSection userData={sectionData} />;
      case 'orders':
        return <OrdersSection orders={sectionData} />;
      case 'favourites':
        return <FavouritesSection favourites={sectionData} />;
      case 'reviews':
        return <ReviewsSection reviews={sectionData} />;
      // Add cases for other sections as needed
      default:
        return <ProfileSection userData={sectionData} />;
    }
  };

  return (
    <div className="profile-view">
      
      <div className="profile-layout">
        <AccountMenu 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div className="profile-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;