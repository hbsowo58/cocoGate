import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <h1>코인원×제프트 자동 매매</h1>
        <h2>나만의 코인 로봇 어드바이저</h2>
        <p>시뮬레이션을 통해 전략을 검증하고 자동으로 거래하세요!</p>
        <button className="start-button">지금 거래하기</button>
      </div>
      <div className="stats-section">
        <div className="stats-card">
          <div className="stats-content">
            <h3>젠포트, 국내 최초의 HTS장사꾼가?</h3>
            <p>국내 주식 로봇 어드바이저의 안정적 입증과 검증</p>
            <div className="stats-numbers">
              <div className="stat">
                <span className="stat-label">운용중인 자산</span>
                <span className="stat-value">1조</span>
              </div>
              <div className="stat">
                <span className="stat-label">누적 수익률</span>
                <span className="stat-value">1,300억</span>
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