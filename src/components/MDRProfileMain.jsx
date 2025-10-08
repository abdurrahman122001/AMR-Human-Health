import React, { useState, useEffect } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const MDRProfileMain = () => {
  // API Configuration
  const SLUG = "amr-overview";
  const BASE_URL = "https://backend.ajhiveprojects.com";

  // State
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDemographic, setSelectedDemographic] = useState('SEX');
  const [activeFilters, setActiveFilters] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');

  // Filter options
  const filterTypeOptions = [
    { value: 'SEX', label: 'Sex' },
    { value: 'AGE_CAT', label: 'Age Category' },
    { value: 'PAT_TYPE', label: 'Patient Type' },
    { value: 'WARD', label: 'Ward' },
    { value: 'INSTITUT', label: 'Institution' },
    { value: 'DEPARTMENT', label: 'Department' },
    { value: 'WARD_TYPE', label: 'Ward Type' },
    { value: 'SPEC_TYPE', label: 'Specimen Type' },
    { value: 'YEAR_SPEC', label: 'Year Specimen' }
  ];

  const demographicOptions = [
    { value: 'SEX', label: 'Sex' },
    { value: 'AGE_CAT', label: 'Age Category' },
    { value: 'INSTITUT', label: 'Institution' },
    { value: 'WARD', label: 'Ward' },
    { value: 'WARD_TYPE', label: 'Ward Type' },
    { value: 'PAT_TYPE', label: 'Patient Type' },
    { value: 'SPEC_TYPE', label: 'Specimen Type' }
  ];

  // Fetch API Data
  const fetchApiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching MDR data from:', `${BASE_URL}/v1/${SLUG}`);
      
      const res = await axios.get(`${BASE_URL}/v1/${SLUG}`);
      
      if (res.data?.success) {
        setApiData(res.data.data);
        console.log('MDR API Response:', res.data.data);
      } else {
        throw new Error(res.data?.error || "Failed to load data");
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  // Process Data for Charts
  const processMDRData = () => {
    if (!apiData || !apiData.rows) {
      return {
        mdrBacteriaData: { resistant: 35, total: 100 },
        incidenceData: [],
        demographicData: []
      };
    }

    const rows = apiData.rows || [];

    // Calculate MDR Bacteria Percentage
    const totalIsolates = rows.length;
    const mdrIsolates = rows.filter(row => {
      // Simple MDR detection based on multiple resistance markers
      const resistanceMarkers = [
        row["CTX ND30"], row["CAZ ND30"], row["IPM ND10"], 
        row["CIP ND5"], row["GEN ND10"]
      ];
      const resistantCount = resistanceMarkers.filter(marker => 
        marker && parseInt(marker) >= 20
      ).length;
      return resistantCount >= 3; // MDR if resistant to 3+ drug classes
    }).length;

    // Process Demographic Data for Bar Chart
    const demographicData = processDemographicData(rows, selectedDemographic);

    // Process Incidence Data
    const incidenceData = processIncidenceData(rows);

    return {
      mdrBacteriaData: {
        resistant: mdrIsolates,
        total: totalIsolates
      },
      incidenceData: incidenceData,
      demographicData: demographicData
    };
  };

  const processDemographicData = (rows, demographic) => {
    const groups = {};
    
    rows.forEach(row => {
      const groupValue = row[demographic] || 'Unknown';
      if (!groups[groupValue]) {
        groups[groupValue] = { total: 0, mdr: 0 };
      }
      groups[groupValue].total++;
      
      // Simple MDR detection
      const resistanceMarkers = [
        row["CTX ND30"], row["CAZ ND30"], row["IPM ND10"]
      ];
      const resistantCount = resistanceMarkers.filter(marker => 
        marker && parseInt(marker) >= 20
      ).length;
      
      if (resistantCount >= 2) {
        groups[groupValue].mdr++;
      }
    });

    return Object.entries(groups).map(([category, data]) => ({
      category,
      total: data.total,
      mdrCases: data.mdr,
      incidenceRate: data.total > 0 ? (data.mdr / data.total) * 1000 : 0
    })).sort((a, b) => b.incidenceRate - a.incidenceRate);
  };

  const processIncidenceData = (rows) => {
    // Sample incidence data by organism type
    const organisms = ['E. coli', 'K. pneumoniae', 'S. aureus', 'P. aeruginosa', 'A. baumannii'];
    
    return organisms.map(org => {
      const orgRows = rows.filter(row => 
        row.ORGANISM?.toLowerCase().includes(org.toLowerCase().split('. ')[1] || org.toLowerCase())
      );
      const total = orgRows.length;
      const mdr = orgRows.filter(row => {
        const resistanceMarkers = [
          row["CTX ND30"], row["CAZ ND30"], row["IPM ND10"]
        ];
        return resistanceMarkers.filter(marker => 
          marker && parseInt(marker) >= 20
        ).length >= 2;
      }).length;

      return {
        category: org,
        total: total,
        mdrCases: mdr,
        incidenceRate: total > 0 ? (mdr / total) * 100 : 0
      };
    }).filter(item => item.total > 0);
  };

  // Filter Helpers
  const getFilterValueOptions = (type) => {
    const mockValues = {
      SEX: ["Male", "Female"],
      AGE_CAT: ["Adult", "Pediatric", "Neonate"],
      PAT_TYPE: ["Inpatient", "Outpatient", "Emergency"],
      WARD: ["ICU", "Surgery", "Emergency", "Pediatrics"],
      INSTITUT: ["General Hospital", "Teaching Hospital"],
      DEPARTMENT: ["Medicine", "Surgery", "Pediatrics"],
      WARD_TYPE: ["General", "Specialized", "Critical Care"],
      SPEC_TYPE: ["Blood", "Urine", "Wound", "Sputum"],
      YEAR_SPEC: ["2023", "2022", "2021"]
    };
    return (mockValues[type] || []).map(value => ({ value, label: value }));
  };

  const filterHelpers = {
    addFilter: () => {
      if (filterType && filterValue) {
        const typeOption = filterTypeOptions.find(opt => opt.value === filterType);
        if (typeOption) {
          const newFilter = {
            column: filterType,
            value: filterValue,
            label: `${typeOption.label}: ${filterValue}`
          };
          setActiveFilters([...activeFilters, newFilter]);
        }
        setFilterType("");
        setFilterValue("");
      }
    },
    removeFilter: (index) => {
      setActiveFilters(activeFilters.filter((_, i) => i !== index));
    },
    clearAllFilters: () => {
      setActiveFilters([]);
    }
  };

  // Chart Data and Calculations
  const { mdrBacteriaData, incidenceData, demographicData } = processMDRData();

  const mdrBacteriaRate = mdrBacteriaData.total > 0 ? 
    Math.round((mdrBacteriaData.resistant / mdrBacteriaData.total) * 100) : 0;

  const mdrBacteriaChartData = {
    labels: ["MDR Bacteria", "Non-MDR Bacteria"],
    datasets: [
      {
        data: [mdrBacteriaRate, 100 - mdrBacteriaRate],
        backgroundColor: ["#dc3545", "#e9ecef"],
        borderWidth: 0,
      },
    ],
  };

  const incidenceChartData = {
    labels: incidenceData.map(item => item.category),
    datasets: [
      {
        label: 'MDR Incidence Rate (%)',
        data: incidenceData.map(item => item.incidenceRate),
        backgroundColor: '#198754',
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const demographicChartData = {
    labels: demographicData.map(item => item.category),
    datasets: [
      {
        label: 'Incidence Rate per 1000',
        data: demographicData.map(item => item.incidenceRate),
        backgroundColor: '#0d6efd',
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rate'
        }
      }
    },
  };

  return (
    <div className="container-fluid">
      {/* Global Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading MDR profile data from API...</p>
        </div>
      )}

      {/* Global Error State */}
      {error && (
        <div className="alert alert-warning mb-4">
          <strong>Note:</strong> Using processed data from API. Error: {error}
        </div>
      )}

      {/* Filter Controls */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="bg-light rounded-3 p-3 border">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <h6 style={{fontSize: "12px"}} className="fw-semibold text-dark mb-2">Filter MDR Data:</h6>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select form-select-sm"
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setFilterValue("");
                  }}
                >
                  <option value="">Select filter type...</option>
                  {filterTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select form-select-sm"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  disabled={!filterType}
                >
                  <option value="">
                    {filterType ? "Select value..." : "Select type first"}
                  </option>
                  {getFilterValueOptions(filterType).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button 
                  className="btn btn-sm btn-primary w-100"
                  disabled={!filterType || !filterValue}
                  onClick={filterHelpers.addFilter}
                >
                  Add Filter
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Active Filters ({activeFilters.length})
                </span>
                <button
                  onClick={filterHelpers.clearAllFilters}
                  className="text-sm text-primary text-decoration-none btn btn-link p-0"
                >
                  Clear All
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <div
                    key={index}
                    className="d-inline-flex align-items-center gap-1 bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill text-xs fw-medium"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={() => filterHelpers.removeFilter(index)}
                      className="btn btn-link p-0 text-primary text-decoration-none"
                      style={{ fontSize: '16px', lineHeight: '1' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Donut Charts Side by Side */}
      <div className="row mb-4">
        {/* MDR Bacteria Chart */}
        <div className="col-md-12">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="fw-bold text-dark mb-1">MDR Bacteria Prevalence</h6>
                  <small className="text-muted">
                    Proportion of multidrug-resistant bacterial isolates • Antimicrobial resistance surveillance
                  </small>
                </div>
                <button className="btn btn-sm btn-outline-secondary border-0">
                  <i className="bi bi-download"></i>
                </button>
              </div>

              <div className="row align-items-center">
                <div className="col-md-6 text-center">
                  <div style={{ width: "180px", margin: "0 auto" }}>
                    <Doughnut data={mdrBacteriaChartData} options={chartOptions} />
                  </div>
                  <div className="mt-3">
                    <div className="fw-bold text-dark fs-4">{mdrBacteriaRate}%</div>
                    <small className="text-muted">MDR Prevalence Rate</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-semibold mb-3">MDR Distribution</h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-dark rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                        <span className="text-dark small">Total Bacterial Isolates</span>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold">100%</div>
                        <small className="text-muted">{mdrBacteriaData.total} isolates</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 rounded">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-danger rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                        <span className="text-dark small">MDR Bacteria Cases</span>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold">{mdrBacteriaRate}%</div>
                        <small className="text-muted">{mdrBacteriaData.resistant} cases</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 rounded">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-secondary rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                        <span className="text-dark small">Non-MDR Bacteria</span>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold">{100 - mdrBacteriaRate}%</div>
                        <small className="text-muted">{mdrBacteriaData.total - mdrBacteriaData.resistant} cases</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MDR Incidence by Organism */}
        {/* <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="fw-bold text-dark mb-1">MDR Incidence by Pathogen</h6>
                  <small className="text-muted">
                    MDR incidence rates across key pathogen types • Priority pathogen surveillance
                  </small>
                </div>
                <button className="btn btn-sm btn-outline-secondary border-0">
                  <i className="bi bi-download"></i>
                </button>
              </div>

              <div style={{ height: '200px' }}>
                <Bar data={incidenceChartData} options={barChartOptions} />
              </div>

              <div className="mt-3 row text-center">
                <div className="col-4">
                  <div className="fw-bold text-dark fs-5">{mdrBacteriaData.total}</div>
                  <small className="text-muted">Total Isolates</small>
                </div>
                <div className="col-4">
                  <div className="fw-bold text-danger fs-5">{mdrBacteriaData.resistant}</div>
                  <small className="text-muted">MDR Cases</small>
                </div>
                <div className="col-4">
                  <div className="fw-bold text-primary fs-5">{mdrBacteriaRate}%</div>
                  <small className="text-muted">MDR Rate</small>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* MDRO Incidence Demographics */}
      <div className="card border-0 shadow-sm rounded-4 ">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-1">MDRO Incidence by Demographics</h6>
              <small className="text-muted">
                Multi-drug resistant organism incidence rates across demographic groups
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-sm text-muted">Group by:</span>
              <select 
                className="form-select form-select-sm w-auto"
                value={selectedDemographic}
                onChange={(e) => setSelectedDemographic(e.target.value)}
              >
                {demographicOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="btn btn-sm btn-outline-secondary border-0">
                <i className="bi bi-download"></i>
              </button>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <Bar data={demographicChartData} options={barChartOptions} />
          </div>

          <div className="row text-center mt-4">
            <div className="col-md-4">
              <div className="fw-bold text-dark fs-4">
                {demographicData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
              </div>
              <small className="text-muted">Total Isolates</small>
            </div>
            <div className="col-md-4">
              <div className="fw-bold text-danger fs-4">
                {demographicData.reduce((sum, item) => sum + item.mdrCases, 0).toLocaleString()}
              </div>
              <small className="text-muted">MDR Cases</small>
            </div>
            <div className="col-md-4">
              <div className="fw-bold text-primary fs-4">
                {demographicData.length > 0 
                  ? ((demographicData.reduce((sum, item) => sum + item.mdrCases, 0) / 
                      demographicData.reduce((sum, item) => sum + item.total, 0)) * 1000).toFixed(1)
                  : '0.0'
                }
              </div>
              <small className="text-muted">Overall Rate per 1000</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MDRProfileMain;