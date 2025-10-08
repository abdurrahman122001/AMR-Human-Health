import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { Bar, Pie, Line } from "react-chartjs-2";

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
  const [vetFilterType, setVetFilterType] = useState("");
  const [vetFilterValue, setVetFilterValue] = useState("");

  const SLUG = "amr-overview";
  const BASE_URL = "https://backend.ajhiveprojects.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/v1/${SLUG}`);
        console.log("API Response:", res.data);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.error || "Failed to load data");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Error fetching API data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL]);

  // Veterinary resistance trends data
  const vetResistanceTrends = [
    {
      pathogen: "E. coli",
      antibiotic: "3rd Generation Cephalosporins",
      currentResistance: 31.2,
      trendData: [25, 28, 30, 29, 31, 31.2],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    },
    {
      pathogen: "E. coli",
      antibiotic: "Carbapenems",
      currentResistance: 2.1,
      trendData: [1.2, 1.5, 1.8, 1.9, 2.0, 2.1],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    },
    {
      pathogen: "K. pneumoniae",
      antibiotic: "Carbapenems",
      currentResistance: 15.7,
      trendData: [10, 12, 13, 14, 15, 15.7],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    },
    {
      pathogen: "K. pneumoniae",
      antibiotic: "Aminoglycosides",
      currentResistance: 28.4,
      trendData: [22, 24, 25, 26, 27, 28.4],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    },
    {
      pathogen: "K. pneumoniae",
      antibiotic: "Fluoroquinolones",
      currentResistance: 35.2,
      trendData: [28, 30, 32, 33, 34, 35.2],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    },
    {
      pathogen: "K. pneumoniae",
      antibiotic: "3rd-Generation Cephalosporins",
      currentResistance: 42.8,
      trendData: [35, 37, 39, 40, 41, 42.8],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    },
    {
      pathogen: "Enterococci",
      antibiotic: "Vancomycin",
      currentResistance: 8.3,
      trendData: [6, 7, 7.5, 8, 8.2, 8.3],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    },
    {
      pathogen: "S. aureus",
      antibiotic: "Methicillin",
      currentResistance: 22.6,
      trendData: [18, 19, 20, 21, 22, 22.6],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    }
  ];

  // Filter options for veterinary data
  const vetFilterOptions = {
    pathogen: [
      { value: "all", label: "All Pathogens" },
      { value: "E. coli", label: "E. coli" },
      { value: "K. pneumoniae", label: "K. pneumoniae" },
      { value: "Enterococci", label: "Enterococci" },
      { value: "S. aureus", label: "S. aureus" }
    ],
    antibiotic: [
      { value: "all", label: "All Antibiotics" },
      { value: "3rd Generation Cephalosporins", label: "3rd Generation Cephalosporins" },
      { value: "Carbapenems", label: "Carbapenems" },
      { value: "Aminoglycosides", label: "Aminoglycosides" },
      { value: "Fluoroquinolones", label: "Fluoroquinolones" },
      { value: "Vancomycin", label: "Vancomycin" },
      { value: "Methicillin", label: "Methicillin" }
    ]
  };

  // Filter veterinary data
  const filteredVetTrends = vetResistanceTrends.filter(trend => {
    if (vetFilterType && vetFilterValue && vetFilterValue !== "all") {
      if (vetFilterType === "pathogen") {
        return trend.pathogen === vetFilterValue;
      } else if (vetFilterType === "antibiotic") {
        return trend.antibiotic === vetFilterValue;
      }
    }
    return true;
  });

  // Loading State
  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-secondary me-3" role="status"></div>
          <span className="text-muted">Loading overview data...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body d-flex align-items-center justify-content-center py-5 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded">
          <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '24px', height: '24px' }}>
            <span className="small">!</span>
          </div>
          <span className="text-danger">Error loading data: {error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <span className="text-muted">No data available</span>
        </div>
      </div>
    );
  }

  /* ==========================
     BAR CHART - Fixed Data Structure
  ========================== */
  const getBarChartData = () => {
    if (data.rows && data.rows.length > 0) {
      const resistanceData = data.rows.slice(0, 8);

      const labels = resistanceData.map(item =>
        item.Pathogen || item.Antibiotic || `Item ${data.rows.indexOf(item) + 1}`
      );

      const values = resistanceData.map(item =>
        Number(item["Resistance (%)"] || item.resistance || Math.random() * 100)
      );

      return {
        labels: labels,
        datasets: [
          {
            label: "Resistance (%)",
            data: values,
            backgroundColor: values.map(v =>
              v >= 40 ? "#dc2626" : v >= 20 ? "#eab308" : "#16a34a"
            ),
            borderRadius: 6,
            borderWidth: 1,
          },
        ],
      };
    } else {
      const demoLabels = ['E. coli', 'K. pneumoniae', 'S. aureus', 'P. aeruginosa', 'A. baumannii'];
      const demoValues = [65, 42, 28, 53, 75];

      return {
        labels: demoLabels,
        datasets: [
          {
            label: "Resistance (%)",
            data: demoValues,
            backgroundColor: demoValues.map(v =>
              v >= 40 ? "#dc2626" : v >= 20 ? "#eab308" : "#16a34a"
            ),
            borderRadius: 6,
            borderWidth: 1,
          },
        ],
      };
    }
  };

  const barData = getBarChartData();

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Resistance Rate (%)"
        },
        grid: {
          color: "rgba(0,0,0,0.1)"
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

  /* ==========================
     PIE CHART - Fixed Data Structure
  ========================== */
  const getPieChartData = () => {
    let high = 0, moderate = 0, low = 0;

    if (data.rows && data.rows.length > 0) {
      data.rows.forEach(item => {
        const resistance = Number(item["Resistance (%)"] || item.resistance || 0);
        if (resistance >= 40) high++;
        else if (resistance >= 20) moderate++;
        else low++;
      });
    } else {
      high = 3;
      moderate = 2;
      low = 5;
    }

    return {
      labels: [
        "High Resistance (≥40%)",
        "Moderate Resistance (20–39%)",
        "Low Resistance (<20%)",
      ],
      datasets: [
        {
          label: "Number of Combinations",
          data: [high, moderate, low],
          backgroundColor: ["#dc2626", "#eab308", "#16a34a"],
          borderColor: ["#b91c1c", "#ca8a04", "#15803d"],
          borderWidth: 2,
        },
      ],
    };
  };

  const pieData = getPieChartData();

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 15
        }
      }
    },
    cutout: "50%",
  };

  /* ==========================
     UI SECTIONS (Dynamic with fallbacks)
  ========================== */
  const getTopPathogens = () => {
    if (data.rows && data.rows.length > 0) {
      return data.rows.slice(0, 5).map((r, i) => ({
        name: r.Pathogen || r.Antibiotic || `Pathogen ${i + 1}`,
        count: r.Count || Math.floor(Math.random() * 900 + 100),
      }));
    }
    return [
      { name: "E. coli", count: 1250 },
      { name: "K. pneumoniae", count: 890 },
      { name: "S. aureus", count: 756 },
      { name: "P. aeruginosa", count: 543 },
      { name: "A. baumannii", count: 432 },
    ];
  };

  const getTopResistance = () => {
    if (data.rows && data.rows.length > 0) {
      return data.rows
        .sort((a, b) => (b["Resistance (%)"] || 0) - (a["Resistance (%)"] || 0))
        .slice(0, 5)
        .map((r) => ({
          combo: `${r.Pathogen || "Pathogen"} – ${r.Antibiotic || "Antibiotic"}`,
        }));
    }
    return [
      { combo: "E. coli – Ceftriaxone" },
      { combo: "K. pneumoniae – Meropenem" },
      { combo: "S. aureus – Oxacillin" },
      { combo: "P. aeruginosa – Piperacillin" },
      { combo: "A. baumannii – Imipenem" },
    ];
  };

  const topPathogens = getTopPathogens();
  const topResistance = getTopResistance();

  const sentinelPhenotypes = [
    { label: "3rd-Gen Ceph-R E. coli", percent: "71.4%" },
    { label: "MRSA", percent: "47%" },
    { label: "Vancomycin-R Enterococci", percent: "5%" },
    { label: "Carbapenem-R GNB", percent: "3.5%" },
  ];

  const totalIsolates = data.rows ? data.rows.length : 1541;

  return (
    <div className="d-flex flex-column gap-4">
      {/* --- AMR Surveillance Overview --- */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-bottom-0 pb-0 pt-4 px-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="card-title mb-1 fw-semibold">AMR Surveillance Overview</h5>
              <p className="text-muted mb-0 small">
                Comprehensive antimicrobial resistance surveillance data • Overview of resistance patterns and key metrics
              </p>
            </div>
            <button className="btn btn-sm btn-outline-secondary border-0">
              <i className="bi bi-download"></i>
            </button>
          </div>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            {/* Top Pathogens */}
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-light border h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p style={{ fontSize: "12px" }} className="fw-semibold text-primary mb-0 small">Top 5 Pathogens</p>
                  <span style={{ fontSize: "12px" }} className="text-muted small">{totalIsolates} total isolates</span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {topPathogens.map((p, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center small">
                      <span style={{ fontSize: "12px" }} className="text-dark">{p.name}</span>
                      <span style={{ fontSize: "12px" }} className="fw-semibold text-dark">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Resistance Signals */}
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p style={{ fontSize: "12px" }} className="fw-semibold text-danger mb-0 small">Top Resistance Signals</p>
                  <span className="text-danger small">n={totalIsolates} tested</span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {topResistance.map((r, i) => (
                    <div style={{ fontSize: "12px" }} key={i} className="small text-dark">
                      {r.combo}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sentinel Phenotypes */}
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p style={{ fontSize: "12px" }} className="fw-semibold text-warning mb-0 small">Sentinel Phenotypes</p>
                </div>
                <div className="d-flex flex-column gap-2">
                  {sentinelPhenotypes.map((s, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center small">
                      <span style={{ fontSize: "12px" }} className="text-dark">{s.label}</span>
                      <span style={{ fontSize: "12px" }} className="fw-semibold text-dark">{s.percent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Resistance Bar Chart --- */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-bottom-0 pb-0 pt-4 px-4">
          <div>
            <h5 className="card-title mb-1 fw-semibold">Resistance Rates for Priority Pathogen-Antibiotic Combinations</h5>
            <p className="text-muted mb-0 small">
              Visual representation of resistance patterns across key pathogen-antibiotic combinations • Color-coded by risk level
            </p>
          </div>
        </div>
        <div className="card-body p-4">
          <div className="row g-4">
            {/* Chart */}
            <div className="col-lg-9">
              <div className="border rounded-3 p-3 bg-white">
                <div style={{ height: '300px' }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="col-lg-3">
              <div className="bg-light border rounded-3 p-3 h-100">
                <p style={{fontSize: "14px"}} className="fw-semibold text-secondary mb-3">Filter Resistance Data</p>

                <div className="d-flex flex-column gap-3">
                  <div>
                    <label style={{fontSize: "12px"}} className="form-label small text-muted mb-2">
                      Select Organism
                    </label>
                    <select className="form-select form-select-sm">
                      {topPathogens.map((p, i) => (
                        <option key={i} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{fontSize: "12px"}} className="form-label small text-muted mb-2">
                      Select Antibiotic
                    </label>
                    <select className="form-select form-select-sm">
                      <option>Ceftriaxone</option>
                      <option>Meropenem</option>
                      <option>Oxacillin</option>
                      <option>Piperacillin</option>
                      <option>Imipenem</option>
                    </select>
                  </div>

                  <button className="btn btn-sm btn-dark w-100">
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Veterinary Resistance Trends --- */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-bottom-0 pb-0 pt-4 px-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="card-title mb-1 fw-semibold">Veterinary Resistance Trends for Priority Pathogen-Antibiotic Combinations</h5>
              <p className="text-muted mb-0 small">
                Resistance percentage trends over time for veterinary priority pathogen-antibiotic combinations - Animal health surveillance monitoring
              </p>
            </div>
            <button className="btn btn-sm btn-outline-secondary border-0">
              <i className="bi bi-download"></i>
            </button>
          </div>
        </div>
        <div className="card-body p-4">
          {/* Filter Controls */}
          <div className="mb-5 bg-light rounded-3 p-3 border">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <p style={{fontSize: "12px"}} className="fw-semibold text-dark mb-2 small">Filter Veterinary Data:</p>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={vetFilterType}
                  onChange={(e) => {
                    setVetFilterType(e.target.value);
                    setVetFilterValue("");
                  }}
                >
                  <option value="">Select filter type...</option>
                  <option value="pathogen">By Pathogen</option>
                  <option value="antibiotic">By Antibiotic</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={vetFilterValue}
                  onChange={(e) => setVetFilterValue(e.target.value)}
                  disabled={!vetFilterType}
                >
                  <option value="">
                    {vetFilterType ? "Select value..." : "Select type first"}
                  </option>
                  {vetFilterType && vetFilterOptions[vetFilterType]?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-sm btn-dark w-100"
                  disabled={!vetFilterType || !vetFilterValue}
                  onClick={() => {
                    // Filter logic is already handled by the state
                    console.log("Applying filter:", { vetFilterType, vetFilterValue });
                  }}
                >
                  Add Filter
                </button>
              </div>
            </div>
          </div>

          {/* Veterinary Trends Grid */}
          <div className="row g-4">
            {filteredVetTrends.map((trend, index) => (
              <div key={index} className="col-md-6 col-lg-4 col-xl-3">
                <div className="card border h-100">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <p style={{fontSize: "12px"}} className="fw-semibold mb-1 small">{trend.pathogen} vs 
                          
                          <span>{trend.antibiotic}</span></p>
                        <div className="fw-bold text-dark fs-5">{trend.currentResistance}%</div>
                      </div>
                    </div>

                    {/* Mini Trend Chart */}
                    <div className="mb-3" style={{ height: '60px' }}>
                      <Line
                        data={{
                          labels: trend.years,
                          datasets: [
                            {
                              data: trend.trendData,
                              borderColor: trend.currentResistance >= 40 ? '#dc2626' :
                                trend.currentResistance >= 20 ? '#eab308' : '#16a34a',
                              backgroundColor: 'transparent',
                              borderWidth: 2,
                              tension: 0.4,
                              pointRadius: 2,
                              pointHoverRadius: 4
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  return `Resistance: ${context.parsed.y}%`;
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              display: true,
                              grid: { display: false },
                              ticks: {
                                maxTicksLimit: 3,
                                callback: function (value, index) {
                                  return index === 0 || index === trend.years.length - 1 ? trend.years[index] : '';
                                }
                              }
                            },
                            y: {
                              display: false,
                              min: 0,
                              max: Math.max(...trend.trendData) * 1.2
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">R% by SPEC_YEAR</small>
                      <div className="d-flex gap-1">
                        <small className="text-muted">{trend.years[0]}</small>
                        <small className="text-muted">-</small>
                        <small className="text-muted">{trend.years[trend.years.length - 1]}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Filter Display */}
          {(vetFilterType && vetFilterValue) && (
            <div className="mt-4 p-3 bg-light rounded-3 border">
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Active Filter: {vetFilterType === 'pathogen' ? 'Pathogen' : 'Antibiotic'} = {
                    vetFilterOptions[vetFilterType]?.find(opt => opt.value === vetFilterValue)?.label
                  }
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setVetFilterType("");
                    setVetFilterValue("");
                  }}
                >
                  Clear Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* --- PIE CHART SECTION --- */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-bottom-0 pb-0 pt-4 px-4 text-center">
          <div>
            <h5 className="card-title mb-1 fw-semibold">Antimicrobial Susceptibility Testing Profile</h5>
            <p className="text-muted mb-0 small">
              Resistance distribution among pathogen–antibiotic combinations • Comprehensive susceptibility testing overview
            </p>
          </div>
        </div>
        <div className="card-body p-4">
          {/* Pie Chart */}
          <div className="d-flex justify-content-center mb-4">
            <div style={{ width: "300px", height: "300px" }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row g-3 justify-content-center">
            <div className="col-6 col-sm-4 col-md-2">
              <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 text-center">
                <div className="fw-bold text-success fs-5 mb-1">62.6%</div>
                <div className="small text-success fw-medium">Susceptible</div>
                <small className="text-muted">717 isolates</small>
              </div>
            </div>

            <div className="col-6 col-sm-4 col-md-2">
              <div className="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3 text-center">
                <div className="fw-bold text-warning fs-5 mb-1">2.4%</div>
                <div className="small text-warning fw-medium">Intermediate</div>
                <small className="text-muted">27 isolates</small>
              </div>
            </div>

            <div className="col-6 col-sm-4 col-md-2">
              <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 text-center">
                <div className="fw-bold text-danger fs-5 mb-1">35.0%</div>
                <div className="small text-danger fw-medium">Resistant</div>
                <small className="text-muted">401 isolates</small>
              </div>
            </div>

            <div className="col-6 col-sm-4 col-md-2">
              <div className="p-3 bg-light border rounded-3 text-center">
                <div className="fw-bold text-dark fs-5 mb-1">{totalIsolates}</div>
                <div className="small text-secondary fw-medium">Total Tested</div>
                <small className="text-muted">Valid results only</small>
              </div>
            </div>

            <div className="col-6 col-sm-4 col-md-2">
              <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 text-center">
                <div className="fw-bold text-primary fs-5 mb-1">1541</div>
                <div className="small text-primary fw-medium">Total Specimens</div>
                <small className="text-muted">All organism isolates</small>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-top text-center">
            <p className="text-muted small mb-0">
              Antimicrobial susceptibility testing profile • Comprehensive resistance distribution analysis across tested specimens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;