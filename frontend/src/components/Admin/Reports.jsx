import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Header from '../Common/Header';
import Footer from '../Common/Footer';
import Loading from '../Common/Loading';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await adminAPI.getSurveySummary(1); // Survey ID 1
      setSummary(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Load summary error:', error);
      setLoading(false);
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
        <div style={styles.box}>
          <h1 style={styles.title}>Báo cáo & Thống kê</h1>

          {/* Overview Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{summary?.total_users || 0}</div>
              <div style={styles.statLabel}>Tổng số nhân viên</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{summary?.completed || 0}</div>
              <div style={styles.statLabel}>Đã hoàn thành</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{summary?.pending || 0}</div>
              <div style={styles.statLabel}>Chưa hoàn thành</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                {summary?.completion_rate || 0}%
              </div>
              <div style={styles.statLabel}>Tỷ lệ hoàn thành</div>
            </div>
          </div>

          {/* Category Average Scores */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Điểm trung bình theo danh mục</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Danh mục</th>
                    <th style={styles.th}>Điểm TB</th>
                    <th style={styles.th}>Số câu trả lời</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.average_scores_by_category?.map((cat, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{cat.name}</td>
                      <td style={styles.td}>
                        <strong>{cat.avg_score?.toFixed(2) || 'N/A'}</strong>
                      </td>
                      <td style={styles.td}>{cat.response_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question Statistics */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Thống kê theo câu hỏi</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Câu hỏi</th>
                    <th style={styles.th}>Danh mục</th>
                    <th style={styles.th}>Điểm TB</th>
                    <th style={styles.th}>Min</th>
                    <th style={styles.th}>Max</th>
                    <th style={styles.th}>Số câu trả lời</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.question_statistics?.map((q, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{q.question_text}</td>
                      <td style={styles.td}>{q.category_name || '-'}</td>
                      <td style={styles.td}>
                        <strong>{q.avg_score?.toFixed(2) || 'N/A'}</strong>
                      </td>
                      <td style={styles.td}>{q.min_score || '-'}</td>
                      <td style={styles.td}>{q.max_score || '-'}</td>
                      <td style={styles.td}>{q.response_count}</td>
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
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: '#f9f9f9',
    padding: '25px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#3498db',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  section: {
    marginTop: '40px',
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
};

export default Reports;
