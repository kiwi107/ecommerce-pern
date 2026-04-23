// src/pages/ProfileView.jsx
import React, { useState, useEffect } from 'react';
import '../profile.css';
import AccountMenu from '../components/ProfileMenu';
import { Container, Row, Col, Card, ListGroup, Badge, Image, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const UserRefunds = ({ refunds }) => {
  const safeRefunds = Array.isArray(refunds) ? refunds : [];

  return (
    <Container className="refunds-section py-4">
      <h2 className="mb-4">Your Refunds</h2>

      {safeRefunds.length > 0 ? (
        <Row xs={1} md={2} xl={3} className="g-4">
          {safeRefunds.map(refund => (
            <Col key={refund.refund_id}>
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Refund #{refund.refund_id}</span>
                  <small className="text-muted">
                    {new Date(refund.requested_at).toLocaleDateString()}
                  </small>
                </Card.Header>

                <Card.Body>
                  <h5 className="card-title">{refund.product_name}</h5>
                  <p className="mb-1"><strong>Order ID:</strong> {refund.order_id}</p>
                  <p className="mb-1"><strong>Variant:</strong> {refund.color} / {refund.size}</p>
                  <p className="mb-1"><strong>Refunded Quantity:</strong> {refund.refunded_quantity}</p>
                  <p className="mb-1"><strong>Amount:</strong> ${refund.refund_amount}</p>
                  {refund.reason && (
                    <p className="mb-1"><strong>Reason:</strong> {refund.reason}</p>
                  )}
                  <Badge
                    pill
                    bg={
                      refund.status === 'Approved'
                        ? 'success'
                        : refund.status === 'Rejected'
                        ? 'danger'
                        : refund.status === 'warning' || refund.status === 'Requested'
                        ? 'warning'
                        : 'secondary'
                    }
                    className="w-100 py-2 mt-2"
                  >
                    {refund.status}
                  </Badge>
                </Card.Body>

                <Card.Footer className="text-muted text-center">
                  Requested: {new Date(refund.requested_at).toLocaleString()}
                  {refund.processed_at && (
                    <><br />Processed: {new Date(refund.processed_at).toLocaleString()}</>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">You have no refund requests yet.</Alert>
      )}
    </Container>
  );
};



// ======== ProfileSection ==========
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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

  const handlePhotoUpload = async () => {
    if (!photo) {
      alert("Please select a photo");
      return;
    }

    const uploadForm = new FormData();
    uploadForm.append('photo', photo);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/upload_photo`, {
        method: 'PUT',
        credentials: 'include',
        body: uploadForm
      });

      if (!response.ok) {
        throw new Error(`Failed to upload photo: ${response.status}`);
      }

      const data = await response.json();
      console.log('Photo upload response:', data.message);

      if (data.profile_image) {
        setFormData(prev => ({ ...prev, profile_image: data.profile_image }));
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setPhoto(null);
    }
  };

  return (
    <Container className="profile-section py-4">
      <h2 className="mb-4">Profile Information</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <Image
                src={formData.profile_image}
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
                  <button className="btn btn-outline-primary btn-sm" onClick={handlePhotoUpload}>
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
            </ListGroup>
            <Card.Footer className="text-end">
              {editMode ? (
                <>
                  <button className="btn btn-sm btn-success me-2" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditMode(true)}>
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

// ======== OrdersSection ==========
const OrdersSection = ({ orders }) => {
  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <Container className="orders-section py-4">
      <h2 className="mb-4">Your Orders</h2>

      {safeOrders.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {safeOrders.map(order => (
            <Col key={order.order_id}>
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Order #{order.order_id}</span>
                  <small className="text-muted">{order.order_date}</small>
                </Card.Header>
                <Card.Body>
                  <Badge pill bg={order.status?.stage === 'Delivered' ? 'success' : 'warning'} className="w-100 py-2">
                    {order.status?.stage ?? "Unknown Status"}
                  </Badge>
                </Card.Body>
                <Card.Footer className="text-center">
                  <Link to={`/order/${order.order_id}`} className="btn btn-sm btn-outline-primary">
                    View Details
                  </Link>
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

// ======== ReviewsSection ==========
const ReviewsSection = ({ reviews }) => {

  const [reviewList, setReviewList] = useState(reviews || []);

const handleDelete = async (product_id) => {

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/reviews/${product_id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete review: ${response.status}`);
    }

    alert('Review deleted successfully');
    setReviewList(prev => prev.filter(r => r.pr !== product_id));
  } catch (err) {
    console.log(err, 'Error deleting review');
    alert(`Error: ${err.message}`);
  }
}

  return (
    <Container className="reviews-section py-4">
      <h2 className="mb-4">Your Reviews</h2>

      {reviews?.length > 0 ? (
        <Row>
          <Col>
            {reviewList.map(review => (
              <Card key={review.product_id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Card.Title className="h6 mb-0">{review.product_name}</Card.Title>
                    <div className="text-warning">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <Card.Text>{review.comment}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">{review.date}</small>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2">Edit</button>
                      <button className="btn btn-sm btn-outline-danger"  onClick={() => handleDelete(review.product_id)}>Delete</button>
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

// ======== AddressBookSection ==========
const AddressBookSection = ({ addresses, refreshAddresses }) => {
  const safeAddresses = Array.isArray(addresses) ? addresses : [];
  const [formData, setFormData] = useState({
    street: '', apartment_no: '', floor: '', city: '', country: ''
  });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to add address');

      setFormData({ street: '', apartment_no: '', floor: '', city: '', country: '' });
      refreshAddresses();
    } catch (err) {
      console.error(err);
      alert('Failed to add address');
    }
  };

  return (
    <Container className="address-book-section py-4">
      <h2 className="mb-4">Address Book</h2>

      {safeAddresses.length > 0 ? (
        <Row>
          {safeAddresses.map((address, index) => (
            <Col md={6} key={index} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <p className="mb-1">
                    {address.street}<br />
                    Apartment no: {address.apartment_no}<br />
                    Floor: {address.floor}<br />
                    {address.city}<br />
                    {address.country}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">You have no saved addresses.</Alert>
      )}

      <Card className="mt-4">
        <Card.Body>
          <h5>Add New Address</h5>
          <form onSubmit={handleSubmit}>
            {['street', 'apartment_no', 'floor', 'city', 'country'].map(field => (
              <input
                key={field}
                type="text"
                className="form-control mb-2"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field.replace('_', ' ').toUpperCase()}
                required
              />
            ))}
            <button type="submit" className="btn btn-primary mt-2">Add Address</button>
          </form>
        </Card.Body>
      </Card>
    </Container>
  );
};

// ======== ProfileView ==========
const ProfileView = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let endpoint = {
          profile: '/users/info',
          orders: '/users/orders',
          favourites: '/users/favourites',
          reviews: '/users/reviews',
          'address-book': '/users/address',
          refunds: '/users/refunds'
        }[activeSection];

        const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const keyMap = {
          profile: 'user',
          orders: 'orders',
          favourites: 'favorites',
          reviews: 'reviews',
          'address-book': 'addresses',
          refunds: 'refunds'
        };

        setSectionData(data[keyMap[activeSection]] || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSection]);

  const renderSection = () => {
    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    switch (activeSection) {
      case 'profile': return <ProfileSection userData={sectionData} />;
      case 'orders': return <OrdersSection orders={sectionData} />;
      case 'reviews': return <ReviewsSection reviews={sectionData} />;
      case 'address-book': return <AddressBookSection addresses={sectionData} refreshAddresses={() => setActiveSection('address-book')} />;
      case 'refunds': return <UserRefunds refunds={sectionData} />;
      default: return <ProfileSection userData={sectionData} />;
    }
  };

  return (
    <div className="profile-view">
      <div className="profile-layout">
        <AccountMenu activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="profile-content">{renderSection()}</div>
      </div>
    </div>
  );
};

export default ProfileView;
