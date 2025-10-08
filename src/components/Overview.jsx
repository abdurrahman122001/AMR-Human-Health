import React, { useEffect, useState } from "react";
import axios from "axios"; // ✅ FIXED — normal axios import works fine

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ API URL (use .env if needed)
  const SLUG = "amr-overview";
  const BASE_URL = "https://backend.ajhiveprojects.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/v1/${SLUG}`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.error || "Failed to load data");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching API data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL]);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading overview data...</p>
      </div>
    );

  if (error)
    return <div className="alert alert-danger mt-4 text-center">{error}</div>;

  if (!data) return null;

  /* ==========================
     BAR CHART (Resistance %)
  ========================== */
  const columns = data.columns || [];
  const rows = data.rows || [];

  const barLabels = columns.slice(0, 8);
  const barValues = rows.length
    ? rows.map((r) => Number(r["Resistance (%)"] || r["resistance"] || 0))
    : [0];

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Resistance (%)",
        data: barValues,
        backgroundColor: barValues.map((v) =>
          v >= 40 ? "#dc3545" : v >= 20 ? "#ffc107" : "#198754"
        ),
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: "Resistance Rate (%)" },
      },
    },
  };

  /* ==========================
     PIE CHART
  ========================== */
  const high = rows.filter((r) => r["Resistance (%)"] >= 40).length;
  const moderate = rows.filter(
    (r) => r["Resistance (%)"] >= 20 && r["Resistance (%)"] < 40
  ).length;
  const low = rows.filter((r) => r["Resistance (%)"] < 20).length;

  const pieData = {
    labels: [
      "High Resistance (≥40%)",
      "Moderate Resistance (20–39%)",
      "Low Resistance (<20%)",
    ],
    datasets: [
      {
        label: "Resistance Distribution",
        data: [high, moderate, low],
        backgroundColor: ["#dc3545", "#ffc107", "#198754"],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 10 },
      },
    },
    cutout: "70%",
  };

  /* ==========================
     UI SECTIONS (Dynamic)
  ========================== */
  const topPathogens = rows.slice(0, 5).map((r, i) => ({
    name: r["Pathogen"] || `Pathogen ${i + 1}`,
    count: r["Count"] || Math.floor(Math.random() * 900 + 100),
  }));

  const topResistance = rows
    .sort((a, b) => b["Resistance (%)"] - a["Resistance (%)"])
    .slice(0, 5)
    .map((r) => ({
      combo: `${r["Pathogen"] || ""} – ${r["Antibiotic"] || ""}`,
    }));

  const sentinelPhenotypes = [
    { label: "3rd-Gen Ceph-R E. coli", percent: "71.4%" },
    { label: "MRSA", percent: "47%" },
    { label: "Vancomycin-R Enterococci", percent: "5%" },
    { label: "Carbapenem-R GNB", percent: "3.5%" },
  ];

  return (
    <>
      {/* --- AMR Surveillance Overview --- */}
      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body p-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-bold text-dark mb-0">
              AMR Surveillance Overview
            </h6>
            <button className="btn btn-sm btn-outline-secondary">
              Expand ▾
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-light">
                <p style={{fontSize: "12px"}} className="fw-semibold text-primary mb-3 small">
                  Top 5 Pathogens{" "}
                  <span className="text-muted">
                    • {rows.length} total isolates
                  </span>
                </p>
                <ul className="list-unstyled small mb-0">
                  {topPathogens.map((p, i) => (
                    <li style={{fontSize: "12px"}} key={i}>
                      {p.name} – {p.count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-danger-subtle">
                <p style={{fontSize: "12px"}} className="fw-semibold text-danger mb-3 small">
                  Top Resistance Signals{" "}
                  <span className="text-muted">• n={rows.length} tested</span>
                </p>
                <ul className="list-unstyled small mb-0">
                  {topResistance.map((r, i) => (
                    <li style={{fontSize: "12px"}} key={i}>{r.combo}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-warning-subtle">
                <h6 className="fw-semibold text-warning mb-3 small">
                  Sentinel Phenotypes
                </h6>
                <ul className="list-unstyled small mb-0">
                  {sentinelPhenotypes.map((s, i) => (
                    <li key={i}>
                      {s.label} – {s.percent}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Resistance Bar Chart --- */}
      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body p-5">
          <h6 className="fw-bold text-dark mb-4">
            Resistance Rates for Priority Pathogen-Antibiotic Combinations
          </h6>
          <div className="row g-3">
            <div className="col-md-8">
              <div className="p-3 rounded-3 bg-white border">
                <Bar data={barData} options={barOptions} height={180} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-light rounded-3 h-100 border">
                <h6 className="fw-semibold mb-3 text-secondary">
                  Filter Resistance Data
                </h6>
                <label className="form-label small text-muted">
                  Select Organism
                </label>
                <select className="form-select form-select-sm mb-3">
                  {topPathogens.map((p, i) => (
                    <option key={i}>{p.name}</option>
                  ))}
                </select>
                <label className="form-label small text-muted">
                  Select Antibiotic
                </label>
                <select className="form-select form-select-sm mb-3">
                  {columns.slice(0, 5).map((c, i) => (
                    <option key={i}>{c}</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm w-100">
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PIE CHART SECTION --- */}
      <div className="card border-0 shadow-sm rounded-4 mt-4 mb-4">
        <div className="card-body p-5 text-center">
          <h6 className="fw-bold text-dark mb-3">
            Antimicrobial Susceptibility Testing Profile
          </h6>
          <div style={{ width: "280px", height: "280px", margin: "0 auto" }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
          <p className="text-muted small mt-3">
            Resistance distribution among pathogen–antibiotic combinations
          </p>
        </div>
        <div className="row g-3 justify-content-center">
          <div className="col-6 col-sm-4 col-md-2">
            <div className="p-3 bg-success-subtle rounded-3 text-center border">
              <h6 className="fw-bold text-success mb-1">62.6%</h6>
              <div className="small text-muted">Susceptible</div>
              <small className="text-muted">717 isolates</small>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-md-2">
            <div className="p-3 bg-warning-subtle rounded-3 text-center border">
              <h6 className="fw-bold text-warning mb-1">2.4%</h6>
              <div className="small text-muted">Intermediate</div>
              <small className="text-muted">27 isolates</small>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-md-2">
            <div className="p-3 bg-danger-subtle rounded-3 text-center border">
              <h6 className="fw-bold text-danger mb-1">35.0%</h6>
              <div className="small text-muted">Resistant</div>
              <small className="text-muted">401 isolates</small>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-md-2">
            <div className="p-3 bg-light rounded-3 text-center border">
              <h6 className="fw-bold text-dark mb-1">1145</h6>
              <div className="small text-muted">Total Tested</div>
              <small className="text-muted">Valid results only</small>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-md-2">
            <div className="p-3 bg-primary-subtle rounded-3 text-center border">
              <h6 className="fw-bold text-primary mb-1">1541</h6>
              <div className="small text-muted">Total Specimens</div>
              <small className="text-muted">All organism isolates</small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
