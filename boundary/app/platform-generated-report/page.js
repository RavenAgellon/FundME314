'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function getTodayFields() {
  const today = new Date();
  return {
    day: String(today.getDate()).padStart(2, '0'),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    year: String(today.getFullYear()),
  };
}

function ReportResult({ label, value, loading }) {
  return (
    <div className="report-result">
      <div className="report-result-label">{label}</div>
      <div className="report-result-value">
        {loading ? 'Loading...' : formatNumber(value)}
      </div>
    </div>
  );
}

export default function PlatformGeneratedReportPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const today = useMemo(() => getTodayFields(), []);

  const [dailyDate, setDailyDate] = useState(today.day);
  const [dailyMonth, setDailyMonth] = useState(today.month);
  const [dailyYear, setDailyYear] = useState(today.year);
  const [weeklyDate, setWeeklyDate] = useState(today.day);
  const [weeklyMonth, setWeeklyMonth] = useState(today.month);
  const [weeklyYear, setWeeklyYear] = useState(today.year);
  const [monthlyMonth, setMonthlyMonth] = useState(today.month);
  const [monthlyYear, setMonthlyYear] = useState(today.year);

  const [dailyTotal, setDailyTotal] = useState(null);
  const [weeklyTotal, setWeeklyTotal] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(null);

  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null); // to display for weekly report result

  function displayPage() {
    const u = requireAuth('platform_management');
    if (u) setUser(u);
  }

  useEffect(() => {
    displayPage();
  }, [dailyTotal, weeklyTotal, monthlyTotal]);

  async function generateDailyReport() {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/fra/report/daily?date=${encodeURIComponent(dailyDate)}&month=${encodeURIComponent(dailyMonth)}&year=${encodeURIComponent(dailyYear)}`,
        'GET',
      );
      const data = await res.json();
      setDailyTotal(data);
      setReportType('daily');

      const selectedDate = new Date(`${dailyYear}-${dailyMonth}-${dailyDate}`);
      setSelectedDate(selectedDate);
    } catch {
      setDailyTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function generateWeeklyReport() {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/fra/report/weekly?date=${encodeURIComponent(weeklyDate)}&month=${encodeURIComponent(weeklyMonth)}&year=${encodeURIComponent(weeklyYear)}`,
        'GET',
      );
      const data = await res.json();
      setWeeklyTotal(data);
      setReportType('weekly');

      const selectedDate = new Date(
        `${weeklyYear}-${weeklyMonth}-${weeklyDate}`,
      );
      const endDate = new Date(selectedDate);
      endDate.setDate(selectedDate.getDate() + 6);

      setSelectedDate(selectedDate);
      setEndDate(endDate);
    } catch {
      setWeeklyTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function generateMonthlyReport() {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/fra/report/monthly?month=${encodeURIComponent(monthlyMonth)}&year=${encodeURIComponent(monthlyYear)}`,
        'GET',
      );
      const data = await res.json();
      setMonthlyTotal(data);
      setReportType('monthly');

      const selectedDate = new Date(`${monthlyYear}-${monthlyMonth}-01`);
      setSelectedDate(selectedDate);
    } catch {
      setMonthlyTotal(0);
    } finally {
      setLoading(false);
    }
  }

  function badgeStyle() {
    return {
      background: '#C9A84C22',
      color: '#C9A84C',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '1.3rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      margin: '0 6px',
    };
  }

  function reportStyle() {
    return {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '3rem',
    };
  }

  if (!user) return null;

  return (
    <>
      <Navbar role="Platform Mgmt" username={user.name} />
      <div className="page">
        <span
          className="back-link"
          onClick={() => router.push('/dashboard-platform')}
        >
          ← Back to Dashboard
        </span>
        <h2>Report Management</h2>
        <p className="subtitle">
          Generate daily, weekly, and monthly reports on platform activity.
        </p>

        <div className="report-grid">
          <section className="report-card">
            <div>
              <h3>Daily Report</h3>
              <p>Generate a report for a single day.</p>
            </div>
            <div className="report-fields">
              <div className="form-group">
                <label>Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Month</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={dailyMonth}
                  onChange={(e) => setDailyMonth(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  min="2000"
                  value={dailyYear}
                  onChange={(e) => setDailyYear(e.target.value)}
                />
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-primary" onClick={generateDailyReport}>
                Generate Daily Report
              </button>
            </div>
          </section>

          <section className="report-card">
            <div>
              <h3>Weekly Report</h3>
              <p>Generate a report for weekly selected date.</p>
            </div>
            <div className="report-fields">
              <div className="form-group">
                <label>Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={weeklyDate}
                  onChange={(e) => setWeeklyDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Month</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={weeklyMonth}
                  onChange={(e) => setWeeklyMonth(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  min="2000"
                  value={weeklyYear}
                  onChange={(e) => setWeeklyYear(e.target.value)}
                />
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-primary" onClick={generateWeeklyReport}>
                Generate Weekly Report
              </button>
            </div>
          </section>

          <section className="report-card">
            <div>
              <h3>Monthly Report</h3>
              <p>Generate a report for a selected month.</p>
            </div>
            <div className="report-fields">
              <div className="form-group">
                <label>Month</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  min="2000"
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(e.target.value)}
                />
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-primary" onClick={generateMonthlyReport}>
                Generate Monthly Report
              </button>
            </div>
          </section>
        </div>

        {/* Display Report */}
        {reportType === 'daily' && (
          <div style={reportStyle()}>
            {loading ? (
              <h2>Loading...</h2>
            ) : (
              <>
                <h2>{dailyTotal === 0 ? 'No' : dailyTotal} FRAs created on</h2>
                <div style={badgeStyle()}>
                  {selectedDate.toLocaleDateString('en-GB')}
                </div>
              </>
            )}
          </div>
        )}

        {reportType === 'weekly' && (
          <div style={reportStyle()}>
            {loading ? (
              <h2>Loading...</h2>
            ) : (
              <>
                <h2>
                  {weeklyTotal === 0 ? 'No' : weeklyTotal} FRAs created
                  from{' '}
                </h2>
                <div style={badgeStyle()}>
                  {selectedDate.toLocaleDateString('en-GB')}{' '}
                </div>
                <h2>to </h2>
                <div style={badgeStyle()}>
                  {endDate.toLocaleDateString('en-GB')}
                </div>
              </>
            )}
          </div>
        )}

        {reportType === 'monthly' && (
          <div style={reportStyle()}>
            {loading ? (
              <h2>Loading...</h2>
            ) : (
              <>
                <h2>
                  {monthlyTotal === 0 ? 'No' : monthlyTotal} FRAs created
                  on{' '}
                </h2>
                <div style={badgeStyle()}>
                  {`${selectedDate.toLocaleString('en-US', { month: 'long' })} ${selectedDate.getFullYear()}`}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
