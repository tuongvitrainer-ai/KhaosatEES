import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import Loading from '../Common/Loading';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Load users error:', error);
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await adminAPI.updateUser(user.id, {
        is_active: !user.is_active,
      });
      loadUsers();
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái người dùng');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department &&
        user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <div style={styles.box}>
          <h1 style={styles.title}>Quản lý người dùng</h1>

          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã NV, họ tên, phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.stats}>
            <span>
              Tổng số: <strong>{users.length}</strong> người dùng
            </span>
            <span>
              Hiển thị: <strong>{filteredUsers.length}</strong> kết quả
            </span>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mã NV</th>
                  <th style={styles.th}>Họ tên</th>
                  <th style={styles.th}>Phòng ban</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Trạng thái khảo sát</th>
                  <th style={styles.th}>Kích hoạt</th>
                  <th style={styles.th}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>{user.employee_id}</td>
                    <td style={styles.td}>{user.full_name}</td>
                    <td style={styles.td}>{user.department || '-'}</td>
                    <td style={styles.td}>{user.email || '-'}</td>
                    <td style={styles.td}>
                      {user.has_completed ? (
                        <span style={styles.badgeSuccess}>Đã hoàn thành</span>
                      ) : (
                        <span style={styles.badgePending}>Chưa hoàn thành</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {user.is_active ? (
                        <span style={styles.badgeActive}>Đang hoạt động</span>
                      ) : (
                        <span style={styles.badgeInactive}>Tạm khóa</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleToggleActive(user)}
                        style={styles.buttonSmall}
                      >
                        {user.is_active ? 'Khóa' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  box: {
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    color: '#2c3e50',
    marginBottom: '25px',
  },
  searchContainer: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 15px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#666',
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
    whiteSpace: 'nowrap',
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
    display: 'inline-block',
  },
  badgePending: {
    padding: '4px 12px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    display: 'inline-block',
  },
  badgeActive: {
    padding: '4px 12px',
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    display: 'inline-block',
  },
  badgeInactive: {
    padding: '4px 12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    display: 'inline-block',
  },
  buttonSmall: {
    padding: '6px 12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

export default UserManagement;
