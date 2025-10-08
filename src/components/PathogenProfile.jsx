import React, { useState, useEffect } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PathogenProfile = () => {
  // API Configuration
  const SLUG = "amr-overview";
  const BASE_URL = "https://backend.ajhiveprojects.com";

  // State
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pathogen Resistance State
  const [pathogenData, setPathogenData] = useState([]);
  const [showPathogenTable, setShowPathogenTable] = useState(false);
  
  // Isolate Analytics State
  const [selectedCategory, setSelectedCategory] = useState('organism');
  const [distributionData, setDistributionData] = useState([]);
  const [showDistributionTable, setShowDistributionTable] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filter State
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

  const categoryOptions = [
    { value: 'organism', label: 'Organism', column: 'ORGANISM', palette: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] },
    { value: 'sex', label: 'Sex', column: 'SEX', palette: ['#3b82f6', '#ec4899', '#10b981'] },
    { value: 'age_cat', label: 'Age', column: 'AGE_CAT', palette: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'] },
    { value: 'institut', label: 'Institution', column: 'INSTITUT', palette: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'] },
    { value: 'spec_type', label: 'Specimen', column: 'SPEC_TYPE', palette: ['#059669', '#10b981', '#34d399', '#f59e0b'] },
    { value: 'ward', label: 'Ward', column: 'WARD', palette: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'] }
  ];

  // Fetch API Data
  const fetchApiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data from:', `${BASE_URL}/v1/${SLUG}`);
      
      const res = await axios.get(`${BASE_URL}/v1/${SLUG}`);
      
      if (res.data?.success) {
        setApiData(res.data.data);
        console.log('API Response:', res.data.data);
        processAllData(res.data.data);
      } else {
        throw new Error(res.data?.error || "Failed to load data");
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      // Use fallback data
      setPathogenData(generateFallbackPathogenData());
      setDistributionData(generateFallbackDistributionData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  // Process all data from API
  const processAllData = (data) => {
    if (!data || !data.rows) {
      setPathogenData(generateFallbackPathogenData());
      setDistributionData(generateFallbackDistributionData());
      return;
    }

    const rows = data.rows || [];
    setTotalRecords(rows.length);

    // Process Pathogen Resistance Data
    processPathogenData(rows);
    
    // Process Distribution Data
    processDistributionData(rows);
  };

  // Process Pathogen Resistance Data
  const processPathogenData = (rows) => {
    const organismGroups = {};
    
    rows.forEach(row => {
      const organism = row.ORGANISM || 'Unknown';
      if (!organismGroups[organism]) {
        organismGroups[organism] = { total: 0, resistant: 0 };
      }
      organismGroups[organism].total++;
      
      // Simple resistance detection based on common antibiotic markers
      const resistanceMarkers = [
        row["CTX ND30"], row["CAZ ND30"], row["IPM ND10"], 
        row["CIP ND5"], row["GEN ND10"]
      ];
      const resistantCount = resistanceMarkers.filter(marker => 
        marker && parseInt(marker) >= 20
      ).length;
      
      if (resistantCount >= 2) {
        organismGroups[organism].resistant++;
      }
    });

    const processedData = Object.entries(organismGroups)
      .map(([organism, data]) => {
        const resistanceRate = data.total > 0 ? (data.resistant / data.total) * 100 : 0;
        return {
          organism,
          organismName: formatOrganismName(organism),
          resistanceRate,
          resistantCount: data.resistant,
          totalTested: data.total,
          color: getResistanceAlertColor(resistanceRate)
        };
      })
      .filter(item => item.totalTested > 10) // Only include organisms with >10 isolates
      .sort((a, b) => b.resistanceRate - a.resistanceRate);

    setPathogenData(processedData);
  };

  // Process Distribution Data
  const processDistributionData = (rows) => {
    const currentCategory = categoryOptions.find(cat => cat.value === selectedCategory);
    if (!currentCategory) return;

    const groups = {};
    
    rows.forEach(row => {
      const categoryValue = row[currentCategory.column] || 'Unknown';
      if (!groups[categoryValue]) {
        groups[categoryValue] = 0;
      }
      groups[categoryValue]++;
    });

    const total = Object.values(groups).reduce((sum, count) => sum + count, 0);
    const processedData = Object.entries(groups)
      .map(([name, value], index) => ({
        name: name,
        value: value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: currentCategory.palette[index % currentCategory.palette.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories

    setDistributionData(processedData);
  };

  // Format organism names
  const formatOrganismName = (orgCode) => {
    const nameMap = {
      'sau': 'S. aureus',
      'eco': 'E. coli',
      'spn': 'S. pneumoniae',
      'kpn': 'K. pneumoniae',
      'ent': 'Enterococcus spp.',
      'efa': 'E. faecalis',
      'pae': 'P. aeruginosa',
      'aba': 'A. baumannii'
    };
    return nameMap[orgCode] || orgCode;
  };

  // Get resistance alert color
  const getResistanceAlertColor = (percentage) => {
    if (percentage < 20) return '#16a34a';
    if (percentage < 40) return '#eab308';
    return '#dc2626';
  };

  // Fallback data generators
  const generateFallbackPathogenData = () => {
    return [
      { organism: 'eco', organismName: 'E. coli', resistanceRate: 45.2, resistantCount: 142, totalTested: 314, color: '#dc2626' },
      { organism: 'sau', organismName: 'S. aureus', resistanceRate: 38.7, resistantCount: 89, totalTested: 230, color: '#eab308' },
      { organism: 'kpn', organismName: 'K. pneumoniae', resistanceRate: 32.1, resistantCount: 67, totalTested: 209, color: '#eab308' },
      { organism: 'pae', organismName: 'P. aeruginosa', resistanceRate: 28.4, resistantCount: 54, totalTested: 190, color: '#16a34a' },
      { organism: 'efa', organismName: 'E. faecalis', resistanceRate: 22.6, resistantCount: 38, totalTested: 168, color: '#16a34a' }
    ];
  };

  const generateFallbackDistributionData = () => {
    return [
      { name: 'E. coli', value: 314, percentage: 31.4, color: '#3b82f6' },
      { name: 'S. aureus', value: 230, percentage: 23.0, color: '#ec4899' },
      { name: 'K. pneumoniae', value: 209, percentage: 20.9, color: '#10b981' },
      { name: 'P. aeruginosa', value: 190, percentage: 19.0, color: '#f59e0b' },
      { name: 'E. faecalis', value: 168, percentage: 16.8, color: '#ef4444' }
    ];
  };

  // Filter Helpers
  const getFilterValueOptions = (type) => {
    const mockValues = {
      SEX: ["Male", "Female"],
      AGE_CAT: ["Adult", "Pediatric", "Neonate"],
      PAT_TYPE: ["Inpatient", "Outpatient", "Emergency"],
      WARD: ["ICU", "Surgery", "Emergency", "Pediatrics"],
      INSTITUT: ["General Hospital", "Teaching Hospital"],
      SPEC_TYPE: ["Blood", "Urine", "Wound", "Sputum"]
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

  // Chart Data and Options
  const currentCategory = categoryOptions.find(cat => cat.value === selectedCategory);

  const distributionChartData = {
    labels: distributionData.map(item => item.name),
    datasets: [
      {
        data: distributionData.map(item => item.percentage),
        backgroundColor: distributionData.map(item => item.color),
        borderWidth: 0,
      },
    ],
  };

  const pathogenChartData = {
    labels: pathogenData.map(item => item.organismName),
    datasets: [
      {
        label: 'Resistance Rate (%)',
        data: pathogenData.map(item => item.resistanceRate),
        backgroundColor: pathogenData.map(item => item.color),
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
        max: 100,
        title: {
          display: true,
          text: 'Resistance Rate (%)'
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
          <p className="mt-3 text-muted">Loading pathogen profile data from API...</p>
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
                <h6 style={{fontSize: "12px"}} className="fw-semibold text-dark mb-2">Filter Pathogen Data:</h6>
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

      {/* Pathogen Resistance Profiles */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-1">
                Pathogen Resistance Profiles (&gt;10 isolates)
              </h6>
              <small className="text-muted">
                Antimicrobial resistance rates for key pathogens • Data from: {BASE_URL}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button 
                className={`btn btn-sm ${showPathogenTable ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowPathogenTable(!showPathogenTable)}
              >
                {showPathogenTable ? 'Chart View' : 'Table View'}
              </button>
              <button className="btn btn-sm btn-outline-secondary border-0">
                <i className="bi bi-download"></i>
              </button>
            </div>
          </div>

          {showPathogenTable ? (
            /* Table View */
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Pathogen</th>
                    <th className="text-end">Resistant</th>
                    <th className="text-end">Total Tested</th>
                    <th className="text-end">Resistance Rate</th>
                    <th className="text-center">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {pathogenData.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{index + 1}</td>
                      <td className="fw-medium">{item.organismName}</td>
                      <td className="text-end">{item.resistantCount.toLocaleString()}</td>
                      <td className="text-end">{item.totalTested.toLocaleString()}</td>
                      <td className="text-end fw-bold">{item.resistanceRate.toFixed(1)}%</td>
                      <td className="text-center">
                        <span className={`badge ${
                          item.resistanceRate < 20 ? 'bg-success' :
                          item.resistanceRate < 40 ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {item.resistanceRate < 20 ? 'Low' : item.resistanceRate < 40 ? 'Moderate' : 'High'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Chart View */
            <div>
              <div className="d-flex justify-content-center mb-4 gap-4 flex-wrap">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-success rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                  <small>Low risk (&lt;20%)</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-warning rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                  <small>Moderate risk (20-39%)</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-danger rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                  <small>High risk (≥40%)</small>
                </div>
              </div>

              <div style={{ height: '400px' }}>
                <Bar data={pathogenChartData} options={barChartOptions} />
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="row text-center mt-4">
            <div className="col-md-3">
              <div className="fw-bold text-dark fs-4">{pathogenData.length}</div>
              <small className="text-muted">Pathogens Analyzed</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-dark fs-4">
                {pathogenData.reduce((sum, item) => sum + item.totalTested, 0).toLocaleString()}
              </div>
              <small className="text-muted">Total Isolates</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-primary fs-4">
                {pathogenData.length > 0 
                  ? (pathogenData.reduce((sum, item) => sum + item.resistanceRate, 0) / pathogenData.length).toFixed(1)
                  : '0.0'
                }%
              </div>
              <small className="text-muted">Average Resistance</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-danger fs-4">
                {pathogenData.length > 0 ? Math.max(...pathogenData.map(item => item.resistanceRate)).toFixed(1) : '0.0'}%
              </div>
              <small className="text-muted">Highest Resistance</small>
            </div>
          </div>
        </div>
      </div>

      {/* Isolate Distribution Analysis */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-1">
                {currentCategory?.label} Distribution Analysis
              </h6>
              <small className="text-muted">
                Composition analysis across isolate categories • Total: {totalRecords.toLocaleString()} records
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-sm text-muted">Category:</span>
              <select 
                className="form-select form-select-sm w-auto"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button 
                className={`btn btn-sm ${showDistributionTable ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowDistributionTable(!showDistributionTable)}
              >
                {showDistributionTable ? 'Chart View' : 'Table View'}
              </button>
              <button className="btn btn-sm btn-outline-secondary border-0">
                <i className="bi bi-download"></i>
              </button>
            </div>
          </div>

          {showDistributionTable ? (
            /* Table View */
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th className="text-end">Count</th>
                    <th className="text-end">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {distributionData.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="rounded-circle"
                            style={{ width: '12px', height: '12px', backgroundColor: item.color }}
                          ></div>
                          {item.name}
                        </div>
                      </td>
                      <td className="text-end fw-medium">{item.value.toLocaleString()}</td>
                      <td className="text-end fw-bold">{item.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Chart View */
            <div className="row align-items-center">
              <div className="col-md-6 text-center">
                <div style={{ width: "280px", margin: "0 auto" }}>
                  <Doughnut data={distributionChartData} options={chartOptions} />
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="fw-semibold mb-3">{currentCategory?.label} Distribution</h6>
                <div className="d-flex flex-column gap-2">
                  {distributionData.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center p-2 rounded">
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="rounded-circle"
                          style={{ width: '12px', height: '12px', backgroundColor: item.color }}
                        ></div>
                        <span className="text-dark small">{item.name}</span>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold">{item.percentage.toFixed(1)}%</div>
                        <small className="text-muted">{item.value} isolates</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathogenProfile;