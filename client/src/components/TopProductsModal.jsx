import React, { useState } from 'react';

export default function TopProductsModal({ show, onClose }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!from || !to) {
      alert('Please select both From and To dates');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/admin/top-products?from=${from}&to=${to}`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      alert('Error fetching report');
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal d-block show" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content rounded-4 shadow-sm border-0">
          <div className="modal-header bg-primary text-white rounded-top-4">
            <h5 className="modal-title">📊 Top Products Report</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <form className="row g-3 align-items-end mb-4" onSubmit={handleGenerate}>
              <div className="col-md-5">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-control rounded-pill"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-control rounded-pill"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="col-md-2 d-grid">
                <button className="btn btn-success rounded-pill" type="submit">Generate</button>
              </div>
            </form>

            {loading && (
              <div className="d-flex justify-content-center align-items-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!loading && reportData.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered align-middle shadow-sm">
                  <thead className="table-primary">
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Gender</th>
                      <th>Images</th>
                      <th>Quantity Sold</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((p) => (
                      <tr key={p.product_id}>
                        <td>{p.name}</td>
                        <td>${p.price}</td>
                        <td>{p.category}</td>
                        <td>{p.gender}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {Array.isArray(p.images) && p.images.length > 0 ? (
                              p.images.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt=""
                                  width="45"
                                  height="45"
                                  className="rounded border"
                                  style={{ objectFit: 'cover' }}
                                />
                              ))
                            ) : (
                              <span>No Images</span>
                            )}
                          </div>
                        </td>
                        <td>{p.total_quantity_sold}</td>
                        <td>${p.total_revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !reportData.length && (
              <p className="text-muted text-center mt-3">No report generated yet.</p>
            )}
          </div>

          <div className="modal-footer rounded-bottom-4 bg-light">
            <button className="btn btn-secondary rounded-pill" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
