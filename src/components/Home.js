import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <h1>민코딩</h1>
        <h2>KEY 관리 프로그램</h2>
        <p>KEY 사용량을 확인하세요</p>
        <button className="start-button">사용량 확인(임시)</button>
      </div>
      <div className="stats-section">
        <div className="stats-card">
          <div className="stats-content">
            <h3>임시</h3>
            <p>임시</p>
            <div className="stats-numbers">
              <div className="stat">
                <span className="stat-label">임시</span>
                <span className="stat-value">임시</span>
              </div>
              <div className="stat">
                <span className="stat-label">임시</span>
                <span className="stat-value">임시</span>
              </div>
            </div>
          </div>
          <div className="stats-graph">
            {/* 그래프 이미지나 컴포넌트가 들어갈 자리 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 