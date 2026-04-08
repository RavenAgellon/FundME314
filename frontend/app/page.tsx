'use client'

export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>FundME314</h1>
      <h2>Fundraising Website Project</h2>
      <p>Project for 314 Software Development Methodologies</p>
      <p>
        This project aims to develop a fundraising website similar to GoFundMe.
      </p>

      <hr style={{ margin: '30px 0' }} />

      <h2>Platform Overview</h2>
      <p>
        The website will allow users to register and log in, create fundraising
        pages, manage their campaigns, and contribute donations to other
        campaigns.
      </p>

      <h2>Main Features</h2>
      <ul>
        <li>User account registration and login</li>
        <li>Create and manage fundraising campaigns</li>
        <li>Browse campaigns from other users</li>
        <li>Donate to a campaign</li>
        <li>Track fundraising progress</li>
      </ul>
    </div>
  )
}