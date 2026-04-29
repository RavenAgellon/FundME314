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
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  function displayPage() {
    const u = requireAuth('platform_management');
    if (u) setUser(u);
  }

  useEffect(() => {
    displayPage();
  }, []);

  async function generateDailyReport() {
    setLoadingDaily(true);
    try {
      const res = await apiFetch(
        `/api/fra/report/daily?date=${encodeURIComponent(dailyDate)}&month=${encodeURIComponent(dailyMonth)}&year=${encodeURIComponent(dailyYear)}`,
        'GET',
      );
      const data = await res.json();
      setDailyTotal(data);
    } catch {
      setDailyTotal(0);
    } finally {
      setLoadingDaily(false);
    }
  }

  async function generateWeeklyReport() {
    setLoadingWeekly(true);
    try {
      const res = await apiFetch(
        `/api/fra/report/weekly?date=${encodeURIComponent(weeklyDate)}&month=${encodeURIComponent(weeklyMonth)}&year=${encodeURIComponent(weeklyYear)}`,
        'GET',
      );
      const data = await res.json();
      setWeeklyTotal(data);
    } catch {
      setWeeklyTotal(0);
    } finally {
      setLoadingWeekly(false);
    }
  }

  async function generateMonthlyReport() {
    setLoadingMonthly(true);
    try {
      const res = await apiFetch(
        `/api/fra/report/monthly?month=${encodeURIComponent(monthlyMonth)}&year=${encodeURIComponent(monthlyYear)}`,
        'GET',
      );
      const data = await res.json();
      setMonthlyTotal(data);
    } catch {
      setMonthlyTotal(0);
    } finally {
      setLoadingMonthly(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <Navbar role="Platform Mgmt" username={user.name} />
      <div className="page">
        <span className="back-link" onClick={() => router.push('/dashboard-platform')}>
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
                <input type="number" min="1" max="31" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Month</label>
                <input type="number" min="1" max="12" value={dailyMonth} onChange={(e) => setDailyMonth(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" min="2000" value={dailyYear} onChange={(e) => setDailyYear(e.target.value)} />
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-primary" onClick={generateDailyReport}>Generate Daily Report</button>
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
                <input type="number" min="1" max="31" value={weeklyDate} onChange={(e) => setWeeklyDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Month</label>
                <input type="number" min="1" max="12" value={weeklyMonth} onChange={(e) => setWeeklyMonth(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" min="2000" value={weeklyYear} onChange={(e) => setWeeklyYear(e.target.value)} />
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-primary" onClick={generateWeeklyReport}>Generate Weekly Report</button>
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
                <input type="number" min="1" max="12" value={monthlyMonth} onChange={(e) => setMonthlyMonth(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" min="2000" value={monthlyYear} onChange={(e) => setMonthlyYear(e.target.value)} />
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-primary" onClick={generateMonthlyReport}>Generate Monthly Report</button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
