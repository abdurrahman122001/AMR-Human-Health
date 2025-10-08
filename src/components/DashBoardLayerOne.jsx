import React, { useEffect, useState } from "react";
import axios from "axios";
import ResistanceHeatMap from "../components/ResistanceHeatMap";
import AntimicrobialProfile from "../components/AntimicrobialProfile";
import HospitalInfectionProfile from "../components/HospitalInfectionProfile";
import Overview from "../components/Overview";
import MDRProfileMain from "../components/MDRProfileMain";
import PathogenProfile from "../components/PathogenProfile";
import {
  TestTube,
  Eye,
  Building2,
  BarChart3,
  Shield,
  AlertTriangle,
} from "lucide-react";

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

          const summaryCards = [
            {
              title: "Total Isolates",
              value: apiData.totalRows || "10,894",
              desc: "Laboratory specimens",
              icon: <TestTube size={18} />,
            },
            {
              title: "Organisms",
              value: apiData.columns?.length || "115",
              desc: "Under surveillance",
              icon: <Eye size={18} />,
            },
            {
              title: "Surveillance Sites",
              value: apiData.sites || "12",
              desc: "Institutions reporting",
              icon: <Building2 size={18} />,
            },
            {
              title: "Average Resistance",
              value:
                `${(
                  (apiData.rows || [])
                    .map((r) => Number(r["Resistance (%)"] || 0))
                    .reduce((a, b) => a + b, 0) /
                  (apiData.rows?.length || 1)
                ).toFixed(1)}%` || "80.8%",
              desc: "Pathogens with 30+ isolates",
              icon: <BarChart3 size={18} />,
            },
            {
              title: "MDRO Incidence",
              value: apiData.mrsaRate || "41.7",
              desc: "per 1,000 admissions",
              icon: <Shield size={18} />,
              warning: true,
            },
            {
              title: "MDR Bacteria",
              value: apiData.mdrRate || "5.3%",
              desc: "Indicator bacteria isolates",
              icon: <AlertTriangle size={18} />,
              warning: true,
            },
          ];

          setStats(summaryCards);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
        setStats([
          {
            title: "Total Isolates",
            value: "10,894",
            desc: "Laboratory specimens",
            icon: <TestTube size={18} />,
          },
          {
            title: "Organisms",
            value: "115",
            desc: "Under surveillance",
            icon: <Eye size={18} />,
          },
          {
            title: "Surveillance Sites",
            value: "12",
            desc: "Institutions reporting",
            icon: <Building2 size={18} />,
          },
          {
            title: "Average Resistance",
            value: "80.8%",
            desc: "Pathogens with 30+ isolates",
            icon: <BarChart3 size={18} />,
          },
          {
            title: "MDRO Incidence",
            value: "41.7",
            desc: "per 1,000 admissions",
            icon: <Shield size={18} />,
            warning: true,
          },
          {
            title: "MDR Bacteria",
            value: "5.3%",
            desc: "Indicator bacteria isolates",
            icon: <AlertTriangle size={18} />,
            warning: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container min-vh-100 p-4" style={{ backgroundColor: "white" }}>
      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <p className="fw-bold mb-1 text-dark" style={{fontSize: "20px"}}>
            Antimicrobial Resistance Dashboard - Human Health
          </p>
          <small className="text-muted">
            Last updated: 29 Sept 2025 at 6:00 PM
          </small>
        </div>
        <img
          src="/gass-logo.png"
          alt="GASS Logo"
          style={{ height: "40px", objectFit: "contain" }}
        />
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
        <div
          className="p-4 mb-4 rounded-4"
          style={{ backgroundColor: "rgba(186,184,108,0.2)" }}
        >
          <div className="row g-3 p-3">
            {stats.map((card, i) => (
              <div className="col-12 col-sm-6 col-lg-2" key={i}>
                <div className="card h-100 border-0 shadow-sm rounded-4">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <p className="text-muted fw-semibold small mb-0" style={{fontSize: "12px"}}>
                        {card.title}
                      </p>
                      <span className="text-secondary">{card.icon}</span>
                    </div>
                    <p
                      className={`fw-bold mb-1 ${
                        card.warning ? "text-danger" : "text-dark"
                      }`}
                      style={{ fontSize: "18px" }}
                    >
                      {card.value}
                    </p>
                    <small className="text-muted">{card.desc}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== NAV TABS - EXACT STYLING FROM IMAGE ===== */}
      <div className="mb-6 mt-20" style={{ padding: "0 8px" }}>
        <div className="d-flex flex-wrap align-items-center gap-1" style={{ rowGap: "8px" }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`fw-semibold border rounded-2 px-3 py-2 ${
              activeTab === 'overview' 
                ? 'bg-black text-white border-primary' 
                : 'bg-white text-dark border-gray-300'
            }`}
            style={{
              fontSize: "13px",
              lineHeight: "1.2",
              minHeight: "36px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            Overview
          </button>
          
          <span className="mx-1 text-muted" style={{ fontSize: "14px" }}></span>
          
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`fw-semibold border rounded-2 px-3 py-2 ${
              activeTab === 'heatmap' 
                ? 'bg-black text-white border-primary' 
                : 'bg-white text-dark border-gray-300'
            }`}
            style={{
              fontSize: "13px",
              lineHeight: "1.2",
              minHeight: "36px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            Resistance Heat Map
          </button>
          
          <span className="mx-1 text-muted" style={{ fontSize: "14px" }}></span>
          
          <button
            onClick={() => setActiveTab('antibiotic')}
            className={`fw-semibold border rounded-2 px-3 py-2 ${
              activeTab === 'antibiotic' 
                ? 'bg-black text-white border-primary' 
                : 'bg-white text-dark border-gray-300'
            }`}
            style={{
              fontSize: "13px",
              lineHeight: "1.2",
              minHeight: "36px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            Antimicrobial Profile
          </button>
          
          <span className="mx-1 text-muted" style={{ fontSize: "14px" }}></span>
          
          <button
            onClick={() => setActiveTab('pathogen')}
            className={`fw-semibold border rounded-2 px-3 py-2 ${
              activeTab === 'pathogen' 
                ? 'bg-black text-white border-primary' 
                : 'bg-white text-dark border-gray-300'
            }`}
            style={{
              fontSize: "13px",
              lineHeight: "1.2",
              minHeight: "36px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            Pathogen Profile
          </button>
          
          <span className="mx-1 text-muted" style={{ fontSize: "14px" }}></span>
          
          <button
            onClick={() => setActiveTab('mdr')}
            className={`fw-semibold border rounded-2 px-3 py-2 ${
              activeTab === 'mdr' 
                ? 'bg-black text-white border-primary' 
                : 'bg-white text-dark border-gray-300'
            }`}
            style={{
              fontSize: "13px",
              lineHeight: "1.2",
              minHeight: "36px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            Multi-Drug Resistance Profile
          </button>
          
          <span className="mx-1 text-muted" style={{ fontSize: "14px" }}></span>
          
          <button
            onClick={() => setActiveTab('hospital')}
            className={`fw-semibold border rounded-2 px-3 py-2 ${
              activeTab === 'hospital' 
                ? 'bg-black text-white border-primary' 
                : 'bg-white text-dark border-gray-300'
            }`}
            style={{
              fontSize: "13px",
              lineHeight: "1.2",
              minHeight: "36px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            Hospital-Acquired Infection
          </button>
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      {activeTab === "overview" && <Overview />}
      {activeTab === "heatmap" && <ResistanceHeatMap />}
      {activeTab === "antibiotic" && <AntimicrobialProfile />}
      {activeTab === "hospital" && <HospitalInfectionProfile />}
      {activeTab === "mdr" && <MDRProfileMain />}
      {activeTab === "pathogen" && <PathogenProfile />}
      {activeTab !== "overview" &&
        !["heatmap", "antibiotic", "hospital", "mdr", "pathogen"].includes(activeTab) && (
          <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-4">
            <h6 className="text-muted">
              Content for "{activeTab}" tab coming soon...
            </h6>
          </div>
        )}
    </div>
  );
};

export default DashBoardLayerOne;