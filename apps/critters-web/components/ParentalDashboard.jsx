

import React, { useState, useEffect } from 'react';
import { get, set } from "idb-keyval";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

const ParentalDashboard = () => {
  const [userData, setUserData] = useState(null);
  const userId = userData ? userData.userId : null;
  const token = userData ? userData.token : null;
  const [learningMetrics, setLearningMetrics] = useState([]);
  const [petCareLogs, setPetCareLogs] = useState([]);
  const [questProgress, setQuestProgress] = useState([]);

  // Load user data from localStorage or IndexedDB
  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);

        // Load metrics from backend with authentication
        try {
          const response = await fetch(`/api/analytics/user/${parsedUser.userId}`, {
            headers: { 'Authorization': `Bearer ${parsedUser.token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setLearningMetrics(data.learningMetrics);
          } else {
            // Fallback to IndexedDB
            const pending = await get("pendingMetrics");
            if (pending) {
              setLearningMetrics([pending]);
            }
          }
        } catch (error) {
          console.error('Error loading learning metrics:', error);
        }

        // Load pet care logs from backend with authentication
        try {
          const response = await fetch(`/api/users/${parsedUser.userId}/pet-care-logs`, {
            headers: { 'Authorization': `Bearer ${parsedUser.token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setPetCareLogs(data);
          } else {
            // Fallback to IndexedDB
            const pending = await get("pendingPetCare");
            if (pending) {
              setPetCareLogs(pending);
            }
          }
        } catch (error) {
          console.error('Error loading pet care logs:', error);
        }

        // Load quest progress from backend with authentication
        try {
          const response = await fetch(`/api/users/${parsedUser.userId}/quest-progress`, {
            headers: { 'Authorization': `Bearer ${parsedUser.token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setQuestProgress(data);
          } else {
            // Fallback to IndexedDB
            const pending = await get("pendingQuests");
            if (pending) {
              setQuestProgress(pending);
            }
          }
        } catch (error) {
          console.error('Error loading quest progress:', error);
        }

        // Sync any pending data when back online
        const handleOnline = async () => {
          // Sync pending learning metrics
          const pendingMetrics = await get("pendingMetrics");
          if (pendingMetrics) {
            try {
              await fetch('/api/analytics/user/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingMetrics)
              });
              await set("pendingMetrics", null);
            } catch (error) {
              console.error('Error syncing learning metrics:', error);
            }
          }

          // Sync pending pet care logs
          const pendingPetCare = await get("pendingPetCare");
          if (pendingPetCare) {
            try {
              await fetch('/api/users/1/pet-care-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingPetCare)
              });
              await set("pendingPetCare", null);
            } catch (error) {
              console.error('Error syncing pet care logs:', error);
            }
          }

        };

        if (navigator.onLine) {
          handleOnline();
        }

        window.addEventListener('online', handleOnline);

        return () => {
          window.removeEventListener('online', handleOnline);
        };
      }
    };

    loadUserData();

  }, []);

  // Export learning progress as PDF certificate
  const exportProgressToPDF = () => {
    if (!learningMetrics.length) {
      alert("No learning data available to export!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text('Curio Critters Learning Progress Report', 10, 20);

    // Add student info
    if (userData) {
      doc.setFontSize(16);
      doc.text(`Student: ${userData.username}`, 10, 35);
      const today = new Date().toLocaleDateString();
      doc.text(`Report Date: ${today}`, 10, 42);
    }

    // Add progress summary
    doc.setFontSize(18);
    doc.text('Learning Progress Summary', 10, 60);

    let yPos = 75;
    learningMetrics.forEach((metric, index) => {
      const date = new Date(metric.date).toLocaleDateString();
      const progressText = `Quest ${index + 1}: ${date} - ${metric.questName}`;
      doc.setFontSize(12);
      doc.text(progressText, 10, yPos);

      // Add progress bar
      const xpProgress = (metric.xp / metric.requiredXP) * 50;
      doc.rect(60, yPos - 3, 50, 8); // Outline rectangle
      if (xpProgress > 0) {
        doc.setFillColor(41, 128, 185); // Blue color
        doc.rect(60, yPos - 3, xpProgress, 8, 'F'); // Filled progress bar
      }

      yPos += 15;
    });

    // Add homeschool alignment section
    if (learningMetrics.length > 0) {
      doc.setFontSize(14);
      doc.text('Common Core Alignment:', 10, yPos + 10);

      const standards = [
        "CCSS.ELA-LITERACY.RL.3.1 - Ask and answer questions to demonstrate understanding of a text.",
        "CCSS.MATH.CONTENT.3.OA.A.1 - Interpret products of whole numbers."
      ];

      doc.setFontSize(10);
      standards.forEach((standard, i) => {
        doc.text(`- ${standard}`, 20, yPos + 25 + (i * 8));
      });
    }

    // Save the PDF
    const filename = `CurioCritters_Report_${userData?.username || 'Student'}.pdf`;
    doc.save(filename);

    alert('Learning progress report exported successfully!');
  };

  // Render loading state while data is being loaded
  if (!userData) {
    return (
      <div className="loading-container flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container p-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-screen">
      {/* Dashboard Header */}
      <div className="dashboard-header mb-8">
        <h1 className="text-3xl font-bold text-white">Parental Dashboard</h1>
        <p className="text-lg text-indigo-200 mt-2">Welcome, {userData.username}'s Parent!</p>

        {/* Export Button */}
        <button
          onClick={exportProgressToPDF}
          className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
        >
          Export Progress Report (PDF)
        </button>
      </div>

      <div className="dashboard-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Learning Progress Card */}
        <div className="bg-white p-6 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">Learning Progress</h2>
          <div className="chart-container h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={learningMetrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average_score" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pet Care Logs Card */}
        <div className="bg-white p-6 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">Pet Care Activity</h2>
          <ul className="pet-care-logs h-64 overflow-y-auto pr-2">
            {petCareLogs.length > 0 ? (
              petCareLogs.map((log, index) => (
                <li key={index} className="flex items-center justify-between py-2 border-b border-gray-100 mb-3 last:border-b-0">
                  <div>
                    <p className="text-sm text-gray-700">{new Date(log.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-indigo-600 font-semibold">{log.activity} with {log.petName}</p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No pet care activities yet</p>
            )}
          </ul>
        </div>

        {/* Quest Progress Card */}
        <div className="bg-white p-6 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">Quest Progress</h2>
          {questProgress.length > 0 ? (
            questProgress.map((quest, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg shadow-inner">
                <p className="text-sm font-semibold text-indigo-700">{quest.name}</p>
                <progress
                  className="w-full h-2 mt-1 bg-gray-200 rounded"
                  value={quest.progress}
                  max="100"
                ></progress>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No quests completed yet</p>
          )}
        </div>

        {/* Subject-Specific Reports */}
        <div className="bg-white p-6 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">Subject Performance</h2>
          {learningMetrics.length > 0 ? (
            <>
              {/* History Report */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">History</h3>
                {learningMetrics.filter(metric => metric.subject === 'history').length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600">Average Score: {(learningMetrics.filter(metric => metric.subject === 'history')
                      .reduce((sum, metric) => sum + metric.average_score, 0) /
                      learningMetrics.filter(metric => metric.subject === 'history').length)
                      .toFixed(1)}%</p>
                    <ul className="mt-2">
                      {learningMetrics.filter(metric => metric.subject === 'history')
                        .map((metric, index) => (
                          <li key={index} className="text-xs text-gray-700 flex justify-between">
                            <span>{metric.topic}</span>
                            <span>{metric.average_score.toFixed(1)}%</span>
                          </li>
                        ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">No history data available</p>
                )}
              </div>

              {/* Math Report */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">Math</h3>
                {learningMetrics.filter(metric => metric.subject === 'math').length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600">Average Score: {(learningMetrics.filter(metric => metric.subject === 'math')
                      .reduce((sum, metric) => sum + metric.average_score, 0) /
                      learningMetrics.filter(metric => metric.subject === 'math').length)
                      .toFixed(1)}%</p>
                    <ul className="mt-2">
                      {learningMetrics.filter(metric => metric.subject === 'math')
                        .map((metric, index) => (
                          <li key={index} className="text-xs text-gray-700 flex justify-between">
                            <span>{metric.topic}</span>
                            <span>{metric.average_score.toFixed(1)}%</span>
                          </li>
                        ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">No math data available</p>
                )}
              </div>

              {/* Science Report */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">Science</h3>
                {learningMetrics.filter(metric => metric.subject === 'science').length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600">Average Score: {(learningMetrics.filter(metric => metric.subject === 'science')
                      .reduce((sum, metric) => sum + metric.average_score, 0) /
                      learningMetrics.filter(metric => metric.subject === 'science').length)
                      .toFixed(1)}%</p>
                    <ul className="mt-2">
                      {learningMetrics.filter(metric => metric.subject === 'science')
                        .map((metric, index) => (
                          <li key={index} className="text-xs text-gray-700 flex justify-between">
                            <span>{metric.topic}</span>
                            <span>{metric.average_score.toFixed(1)}%</span>
                          </li>
                        ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">No science data available</p>
                )}
              </div>

            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No subject-specific data available yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentalDashboard;

