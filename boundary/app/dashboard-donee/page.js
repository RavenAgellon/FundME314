'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';
import './style.css';

export default function DoneeDashboard() {
  const [user, setUser] = useState(null);
  const [selectedFavouriteIndex, setSelectedFavouriteIndex] = useState(0);

  // Dummy data for favourite activities
  const favouriteActivities = [
    {
      id: 1,
      fraName: 'Help for Education',
      targetAmount: 1000,
      raised: 500,
      picture: '🏫',
      daysLeft: 7, // will be endDate in real implementation
    },
    {
      id: 2,
      fraName: 'Medical Aid Fund',
      targetAmount: 2200,
      raised: 1800,
      picture: '💉',
      daysLeft: 5,
    },
    {
      id: 3,
      fraName: 'Animal Shelter Support',
      targetAmount: 800,
      raised: 600,
      picture: '🐶',
      daysLeft: 9,
    },
    {
      id: 4,
      fraName: 'Disaster Relief',
      targetAmount: 5000,
      raised: 4200,
      picture: '⛑️',
      daysLeft: 3,
    },
    {
      id: 5,
      fraName: 'Community Garden',
      targetAmount: 1500,
      raised: 1200,
      picture: '🌱',
      daysLeft: 12,
    },
  ];

  const favouriteWindowStart = Math.max(
    0,
    Math.min(selectedFavouriteIndex - 1, favouriteActivities.length - 3),
  );

  const visibleFavorites = favouriteActivities
    .slice(favouriteWindowStart, favouriteWindowStart + 3)
    .map((activity, index) => ({
      ...activity,
      slideIndex: favouriteWindowStart + index,
    }));

  const showPreviousFavourite = () => {
    setSelectedFavouriteIndex((current) => Math.max(0, current - 1));
  };

  const showNextFavourite = () => {
    setSelectedFavouriteIndex((current) =>
      Math.min(favouriteActivities.length - 1, current + 1),
    );
  };

  function displayDoneePage() {
    const u = requireAuth('donee');
    if (u) setUser(u);
  }

  useEffect(() => {
    displayDoneePage();
  }, []);
  if (!user) return null;

  return (
    <>
      <Navbar role="Donee" username={user.name} />
      <div className="page-narrow">
        <div style={{ textAlign: 'center', margin: '3rem 0 2.5rem' }}>
          <h2>Donee Dashboard</h2>
          <p className="subfraName">
            Browse fundraising activities and track your donations.
          </p>
        </div>

        <div className="menu-grid">
          <div className="menu-card">
            <div
              className="card-header"
              onClick={() => alert('Go to View Favourite List page')}
            >
              <div className="card-icon">💛</div>
              <h3>My Favourite List</h3>
            </div>
            <div className="slider-wrap">
              <button
                className="slider-nav"
                type="button"
                onClick={showPreviousFavourite}
                disabled={selectedFavouriteIndex === 0}
              >
                ‹
              </button>

              <div className="slider">
                {visibleFavorites.map((activity) => {
                  const isSelected =
                    activity.slideIndex === selectedFavouriteIndex;
                  return (
                    <div
                      key={activity.id}
                      className={`slider-item${isSelected ? ' selected' : ''}`}
                      onClick={() =>
                        alert('Directly go to View FRA Details page')
                      }
                    >
                      <div className="card-icon">{activity.picture}</div>
                      <h4>{activity.fraName}</h4>
                      <p>
                        ${activity.raised.toLocaleString()} / $
                        {activity.targetAmount.toLocaleString()}
                      </p>
                      <p>{activity.daysLeft} days left</p>
                    </div>
                  );
                })}
              </div>

              <button
                className="slider-nav"
                type="button"
                onClick={showNextFavourite}
                disabled={
                  selectedFavouriteIndex === favouriteActivities.length - 1
                }
              >
                ›
              </button>
            </div>
          </div>

          <div id="container-card">
            <div
              className="menu-card"
              onClick={() => alert('Go to View FRAs page')}
            >
              <div className="card-header">
                <div className="card-icon">🏃‍♀️</div>
                <h3>Ongoing FRA</h3>
              </div>
              <p>
                View, search and participate in ongoing fundraising activities.
              </p>
            </div>

            <div
              className="menu-card"
              onClick={() => alert('Go to View Completed FRAs page')}
            >
              <div className="card-header">
                <div className="card-icon">⛳</div>
                <h3>Completed FRA</h3>
              </div>
              <p>View and search completed fundraising activities.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
