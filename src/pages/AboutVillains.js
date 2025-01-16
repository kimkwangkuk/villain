import React, { useState, useEffect } from 'react';

const villains = [
  "직장인 빌런",
  "학교 빌런",
  "카페 빌런",
  "식당 빌런",
  "대중교통 빌런",
  "운동시설 빌런",
  "병원 빌런",
  "공공장소 빌런",
  "온라인 빌런",
  "이웃 빌런"
];

function AboutVillains() {
  const [currentVillain, setCurrentVillain] = useState(villains[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVillain(prev => {
        const currentIndex = villains.indexOf(prev);
        return villains[(currentIndex + 1) % villains.length];
      });
    }, 2000); // 2초마다 변경

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-7xl font-bold text-gray-900 mb-6">{currentVillain}을 제보하세요.</h1>
      </div>
    </div>
  );
}

export default AboutVillains; 