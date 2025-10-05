import React, { useEffect, useState } from "react";
import axios from "axios";
import ResistanceHeatMap from "../components/ResistanceHeatMap";
import AntimicrobialProfile from "../components/AntimicrobialProfile";
import HospitalInfectionProfile from "../components/HospitalInfectionProfile";
import Overview from "../components/Overview";

const DashBoardLayerOne = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "https://backend.ajhiveprojects.com";
  const SLUG = "amr-overview";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/v1/${SLUG}`);
        if (res.data?.success && res.data?.data) {
          const apiData = res.data.data;

          // ✅ Create dynamic summary cards based on your API structure
          const summaryCards = [
            {
              title: "Total Isolates",
              value: apiData.totalRows || "5,053",
              desc: "Laboratory confirmed isolates",
            },
            {
              title: "Organisms",
              value: apiData.columns?.length || "75",
              desc: "Under characterization",
            },
            {
              title: "Surveillance Sites",
              value: apiData.sites || "10",
              desc: "Across all regions",
            },
            {
              title: "Average Resistance",
              value:
                `${(
                  (apiData.rows || [])
                    .map((r) => Number(r["Resistance (%)"] || 0))
                    .reduce((a, b) => a + b, 0) /
                  (apiData.rows?.length || 1)
                ).toFixed(1)}%` || "31%",
              desc: "Across key pathogens",
            },
            {
              title: "MRSA Incidence",
              value: apiData.mrsaRate || "18.6",
              desc: "per 1,000 admissions",
            },
            {
              title: "MDR Bacteria",
              value: apiData.mdrRate || "2.4%",
              desc: "Multidrug-resistant isolates",
            },
          ];

          setStats(summaryCards);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
        // fallback static cards if API fails
        setStats([
          {
            title: "Total Isolates",
            value: "5,053",
            desc: "Laboratory confirmed isolates",
          },
          {
            title: "Organisms",
            value: "75",
            desc: "Under characterization",
          },
          {
            title: "Surveillance Sites",
            value: "10",
            desc: "Across all regions",
          },
          {
            title: "Average Resistance",
            value: "31%",
            desc: "Across key pathogens",
          },
          {
            title: "MRSA Incidence",
            value: "18.6",
            desc: "per 1,000 admissions",
          },
          {
            title: "MDR Bacteria",
            value: "2.4%",
            desc: "Multidrug-resistant isolates",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container bg-light min-vh-100 p-4">
      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">
            Antimicrobial Resistance Dashboard
          </h4>
          <small className="text-muted">
            Last updated: Server version live · Database
          </small>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="row g-3 mb-4">
          {stats.map((card, i) => (
            <div className="col-12 col-sm-6 col-xl-2" key={i}>
              <div className="card dashboard-card h-100 border-0 shadow-sm">
                <div className="card-body p-3 text-center">
                  <h6 className="text-muted small mb-1">{card.title}</h6>
                  <h5 className="fw-bold mb-1 text-dark">{card.value}</h5>
                  <small className="text-secondary">{card.desc}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== NAV TABS ===== */}
      <div className="p-3 rounded-4 mb-4">
        <ul className="nav nav-pills justify-content-between flex-nowrap">
          {[
            { id: "overview", label: "Overview" },
            { id: "heatmap", label: "Resistance Heat Map" },
            { id: "antibiotic", label: "Antibiotic Profile" },
            { id: "pathogen", label: "Pathogen Profile" },
            { id: "mdr", label: "Multi-Drug Resistance Profile" },
            { id: "hospital", label: "Hospital-Acquired Infection Profile" },
          ].map((tab) => (
            <li
              className="nav-item flex-fill"
              key={tab.id}
              style={{ minWidth: "160px" }}
            >
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`nav-link fw-semibold w-100 rounded-3 border ${
                  activeTab === tab.id
                    ? "bg-dark text-white"
                    : "bg-light text-dark"
                }`}
                style={{
                  padding: "0.9rem 1.2rem",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ===== TAB CONTENT ===== */}
      {activeTab === "overview" && <Overview />}
      {activeTab === "heatmap" && <ResistanceHeatMap />}
      {activeTab === "antibiotic" && <AntimicrobialProfile />}
      {activeTab === "hospital" && <HospitalInfectionProfile />}
      {activeTab !== "overview" &&
        !["heatmap", "antibiotic", "hospital"].includes(activeTab) && (
          <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-4">
            <h6 className="text-muted">
              Content for "{activeTab}" tab coming soon...
            </h6>
          </div>
        )}

      {/* ===== STYLES ===== */}
      <style jsx>{`
        .card {
          border-radius: 16px;
        }
        .nav-link {
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default DashBoardLayerOne;
