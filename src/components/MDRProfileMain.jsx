import React, { useState, useEffect } from "react";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_URL = "https://backend.ajhiveprojects.com/v1/amr-overview";

// Simple Tooltip (title attribute fallback)
function TooltipComponent({ text, children }) {
  return <span title={text}>{children}</span>;
}

// SearchableSelect: input + select dropdown filter
function SearchableSelect({ value, onValueChange, options, placeholder, disabled }) {
  const [search, setSearch] = useState("");
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <input
        type="text"
        className="form-control mb-1"
        placeholder={placeholder}
        value={search}
        disabled={disabled}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="form-select"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">-- Select --</option>
        {filtered.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Chart: Doughnut showing top organisms
function MDRBacteriaIntegrated({ filteredData }) {
  const counts = {};
  filteredData.forEach((row) => {
    const org = row.ORGANISM || "Unknown";
    counts[org] = (counts[org] || 0) + 1;
  });
  const labels = Object.keys(counts).slice(0, 5);
  const data = labels.map((l) => counts[l]);
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: ["#0d6efd", "#6c757d", "#198754", "#ffc107", "#dc3545"],
      },
    ],
  };
  return (
    <div className="card h-100">
      <div className="card-body">
        <h6 className="card-title">Top Organisms (Donut)</h6>
        {labels.length > 0 ? <Doughnut data={chartData} /> : <p>No data</p>}
      </div>
    </div>
  );
}

// Chart: Bar by sex
function MDRIncidenceDemographics({ filteredData }) {
  const bySex = { Male: 0, Female: 0, Unknown: 0 };
  filteredData.forEach((r) => {
    const s = (r.SEX || "").toLowerCase();
    if (s === "m" || s.includes("male")) bySex.Male++;
    else if (s === "f" || s.includes("female")) bySex.Female++;
    else bySex.Unknown++;
  });
  const labels = Object.keys(bySex);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Count",
        data: labels.map((l) => bySex[l]),
        backgroundColor: ["#0d6efd", "#dc3545", "#6c757d"],
      },
    ],
  };
  return (
    <div className="card h-100">
      <div className="card-body">
        <h6 className="card-title">Incidence by Sex (Bar)</h6>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

export default function MDRProfileMain() {
  const [data, setData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [loadingFilterValues, setLoadingFilterValues] = useState({});
  const [filterValueErrors, setFilterValueErrors] = useState({});

  const filterTypeOptions = [
    { value: "SEX", label: "Sex" },
    { value: "AGE", label: "Age" },
    { value: "WARD", label: "Ward" },
    { value: "INSTITUTION", label: "Institution" },
    { value: "DEPARTMENT", label: "Department" },
    { value: "WARD TYPE", label: "Ward Type" },
    { value: "PATIENT TYPE", label: "Patient Type" },
    { value: "SPECIMEN TYPE", label: "Specimen Type" },
    { value: "ORGANISM", label: "Organism" },
  ];

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const resp = await fetch(API_URL);
        const json = await resp.json();
        // Assuming API returns an object like { data: { rows: [...] } }
        if (json.data && Array.isArray(json.data.rows)) {
          setData(json.data.rows);
        } else if (Array.isArray(json)) {
          // fallback if API directly returns array
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching API:", err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  // Build unique filter values from data
  const fetchFilterValues = (columnName) => {
    if (!data.length) return;
    if (filterValues[columnName]) return;

    setLoadingFilterValues((p) => ({ ...p, [columnName]: true }));
    try {
      const uniques = [
        ...new Set(
          data
            .map((r) => r[columnName])
            .filter((v) => v !== null && v !== undefined && v !== "")
        ),
      ];
      const opts = uniques
        .map((v) => ({ value: String(v), label: String(v) }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setFilterValues((p) => ({ ...p, [columnName]: opts }));
    } catch (err) {
      console.error("Error building filter values:", err);
      setFilterValueErrors((p) => ({ ...p, [columnName]: true }));
    } finally {
      setLoadingFilterValues((p) => ({ ...p, [columnName]: false }));
    }
  };

  useEffect(() => {
    if (filterType) {
      fetchFilterValues(filterType);
    }
  }, [filterType, data]);

  // Filter management
  const addFilter = () => {
    if (!filterType || !filterValue) return;
    const tLabel =
      filterTypeOptions.find((o) => o.value === filterType)?.label ||
      filterType;
    const vLabel =
      filterValues[filterType]?.find((o) => o.value === filterValue)?.label ||
      filterValue;
    const newF = { column: filterType, value: filterValue, label: `${tLabel}: ${vLabel}` };
    if (!activeFilters.some((f) => f.column === newF.column && f.value === newF.value)) {
      setActiveFilters([...activeFilters, newF]);
    }
    // reset
    setFilterType("");
    setFilterValue("");
  };

  const removeFilter = (idx) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== idx));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const filteredData =
    activeFilters.length === 0
      ? data
      : data.filter((row) =>
          activeFilters.every(
            (f) =>
              String(row[f.column])?.toLowerCase() ===
              String(f.value)?.toLowerCase()
          )
        );

  return (
    <div className="container py-4">
      {/* Filter Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-3">
            <TooltipComponent text="Dynamic filters from AMR data">
              <h5 className="mb-0 fw-semibold">Filter MDR Data:</h5>
            </TooltipComponent>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <SearchableSelect
                value={filterType}
                onValueChange={setFilterType}
                options={filterTypeOptions}
                placeholder="Search filter type..."
              />
            </div>
            <div className="col-md-4">
              <SearchableSelect
                value={filterValue}
                onValueChange={setFilterValue}
                options={filterValues[filterType] || []}
                placeholder={
                  !filterType
                    ? "Select type first"
                    : loadingFilterValues[filterType]
                    ? "Loading..."
                    : "Search value..."
                }
                disabled={!filterType || loadingFilterValues[filterType]}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-dark w-100"
                onClick={addFilter}
                disabled={!filterType || !filterValue}
              >
                Add Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-secondary">
              Active Filters ({activeFilters.length})
            </span>
            <button
              className="btn btn-link p-0"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {activeFilters.map((f, i) => (
              <span
                key={i}
                className="badge bg-light text-dark border rounded-pill px-3 py-2 d-flex align-items-center"
              >
                {f.label}
                <button
                  className="btn btn-sm btn-link text-muted ms-2 p-0"
                  onClick={() => removeFilter(i)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="row g-3">
        <div className="col-md-6">
          <MDRBacteriaIntegrated filteredData={filteredData} />
        </div>
        <div className="col-md-6">
          <MDRIncidenceDemographics filteredData={filteredData} />
        </div>
      </div>

      {/* Data Table */}
      <div className="card mt-4">
        <div className="card-body">
          {loadingData ? (
            <p className="text-muted">Loading data...</p>
          ) : (
            <>
              <p className="mb-3">
                Showing {filteredData.length} of {data.length} records
              </p>
              <div className="table-responsive" style={{ maxHeight: "400px" }}>
                <table className="table table-striped table-sm">
                  <thead className="table-dark sticky-top">
                    <tr>
                      <th>#</th>
                      <th>SEX</th>
                      <th>AGE</th>
                      <th>WARD</th>
                      <th>INSTITUTION</th>
                      <th>DEPARTMENT</th>
                      <th>WARD TYPE</th>
                      <th>PATIENT TYPE</th>
                      <th>SPECIMEN TYPE</th>
                      <th>ORGANISM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 50).map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{r.SEX}</td>
                        <td>{r.AGE}</td>
                        <td>{r.WARD}</td>
                        <td>{r.INSTITUTION}</td>
                        <td>{r.DEPARTMENT}</td>
                        <td>{r["WARD TYPE"]}</td>
                        <td>{r["PATIENT TYPE"]}</td>
                        <td>{r["SPECIMEN TYPE"]}</td>
                        <td>{r.ORGANISM}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
