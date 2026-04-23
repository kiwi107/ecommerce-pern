import React, { useEffect, useState } from 'react';

const CampaignReportModal = ({ show, onClose, campaignId }) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/admin/campaign/${campaignId}/report`);
        const data = await res.json();
        setReportData(data.campaigns);
      } catch (err) {
        alert('Error fetching report');
      }
      setLoading(false);
    };

    fetchReport();
  }, [campaignId]);

  return (
    <div className={`modal ${show ? 'd-block show' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Campaign Report</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading && <p>Loading...</p>}
            {!loading && reportData.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Campaign Name</th><th>Total Quantity Sold</th><th>Total Revenue</th><th>Related Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((campaign) => (
                      <tr key={campaign.campaign_id}>
                        <td>{campaign.campaign_name}</td>
                        <td>{campaign.total_quantity_sold}</td>
                        <td>${campaign.total_revenue_generated}</td>
                        <td>{campaign.related_orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignReportModal;
