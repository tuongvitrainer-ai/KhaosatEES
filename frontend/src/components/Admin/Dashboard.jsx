import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import Loading from '../Common/Loading';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
      setStats(response.data.statistics);
      setLoading(false);
    } catch (error) {
      console.error('Load data error:', error);
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!window.confirm('Bạn có chắc muốn đồng bộ dữ liệu lên Google Sheets?')) {
      return;
    }

    setSyncing(true);
    try {
      const response = await adminAPI.syncToSheets(1); // Survey ID 1
      alert(response.data.message || 'Đồng bộ thành công!');
    } catch (error) {
      alert(
        error.response?.data?.error ||
          'Lỗi khi đồng bộ. Vui lòng kiểm tra cấu hình Google Sheets.'
      );
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Loading />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.dashboardBox}>
          <h1 style={styles.title}>Bảng điều khiển quản trị</h1>

          {/* Statistics Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats?.total || 0}</div>
              <div style={styles.statLabel}>Tổng số nhân viên</div>
            </div>
            <div style={{ ...styles.statCard, ...styles.statCardSuccess }}>
              <div style={styles.statNumber}>{stats?.completed || 0}</div>
              <div style={styles.statLabel}>Đã hoàn thành</div>
            </div>
            <div style={{ ...styles.statCard, ...styles.statCardWarning }}>
              <div style={styles.statNumber}>{stats?.pending || 0}</div>
              <div style={styles.statLabel}>Chưa hoàn thành</div>
            </div>
            <div style={{ ...styles.statCard, ...styles.statCardInfo }}>
              <div style={styles.statNumber}>{stats?.completion_rate || 0}%</div>
              <div style={styles.statLabel}>Tỷ lệ hoàn thành</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button
              onClick={() => navigate('/admin/users')}
              style={styles.button}
            >
              Quản lý người dùng
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              style={styles.button}
            >
              Báo cáo & thống kê
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                ...styles.button,
                ...styles.buttonSync,
                ...(syncing ? styles.buttonDisabled : {}),
              }}
            >
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ Google Sheets'}
            </button>
          </div>

          {/* Recent Users Table */}
          <div style={styles.tableSection}>
            <h2 style={styles.sectionTitle}>Người dùng gần đây</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Mã NV</th>
                    <th style={styles.th}>Họ tên</th>
                    <th style={styles.th}>Phòng ban</th>
                    <th style={styles.th}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map((user) => (
                    <tr key={user.id} style={styles.tr}>
                      <td style={styles.td}>{user.employee_id}</td>
                      <td style={styles.td}>{user.full_name}</td>
                      <td style={styles.td}>{user.department || '-'}</td>
                      <td style={styles.td}>
                        {user.has_completed ? (
                          <span style={styles.badgeSuccess}>Đã hoàn thành</span>
                        ) : (
                          <span style={styles.badgePending}>Chưa hoàn thành</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 120px)',
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
  },
  dashboardBox: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '32px',
    color: '#2c3e50',
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #3498db',
  },
  statCardSuccess: {
    borderLeft: '4px solid #27ae60',
  },
  statCardWarning: {
    borderLeft: '4px solid #f39c12',
  },
  statCardInfo: {
    borderLeft: '4px solid #9b59b6',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonSync: {
    backgroundColor: '#27ae60',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
  },
  tableSection: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: '14px',
  },
  tr: {
    borderBottom: '1px solid #ecf0f1',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#555',
  },
  badgeSuccess: {
    padding: '4px 12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
  },
  badgePending: {
    padding: '4px 12px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
  },
};

export default Dashboard;
