'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

function getTodayFields() {
  const today = new Date();
  return {
    day: String(today.getDate()).padStart(2, '0'),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    year: String(today.getFullYear()),
  };
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

  // Style Functions
  function reportContainerStyle() {
    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    };
  }

  function reportAttrContainerStyle() {
    return {
      display: 'grid',
      gap: '0.75rem',
      marginTop: '1.25rem',
    };
  }

  function reportAttrStyle() {
    return {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.15)',
      paddingBottom: '0.6rem',
      gap: '8rem',
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
          <div style={reportContainerStyle()}>
            {loading ? (
              <h2>Loading...</h2>
            ) : (
              <>
                <h2 style={{ marginTop: '2.5rem' }}>Daily Report</h2>
                <div style={reportAttrContainerStyle()}>
                  <div style={reportAttrStyle()}>
                    <span>Date</span>
                    <span>{selectedDate.toLocaleDateString('en-GB')}</span>
                  </div>
                  <div style={reportAttrStyle()}>
                    <span>Created FRAs</span>
                    <span>{dailyTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {reportType === 'weekly' && (
          <div style={reportContainerStyle()}>
            {loading ? (
              <h2>Loading...</h2>
            ) : (
              <>
                <h2 style={{ marginTop: '2.5rem' }}>Weekly Report</h2>
                <div style={reportAttrContainerStyle()}>
                  <div style={reportAttrStyle()}>
                    <span>Date</span>
                    <span>
                      {`${selectedDate.toLocaleDateString('en-GB')} - 
                        ${endDate.toLocaleDateString('en-GB')}`}
                    </span>
                  </div>
                  <div style={reportAttrStyle()}>
                    <span>Created FRAs</span>
                    <span>{weeklyTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {reportType === 'monthly' && (
          <div style={reportContainerStyle()}>
            {loading ? (
              <h2>Loading...</h2>
            ) : (
              <>
                <h2 style={{ marginTop: '2.5rem' }}>Monthly Report</h2>
                <div style={reportAttrContainerStyle()}>
                  <div style={reportAttrStyle()}>
                    <span>Date</span>
                    <span>
                      {`${selectedDate.toLocaleDateString('en-GB', {
                        month: 'long',
                      })} ${selectedDate.getFullYear()}`}
                    </span>
                  </div>
                  <div style={reportAttrStyle()}>
                    <span>Created FRAs</span>
                    <span>{monthlyTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
