import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const HospitalInfectionProfile = () => {
  const chartOptions = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
    },
  };

  // ===== Chart Data =====
  const mrsaData = {
    labels: ["MRSA Cases", "MSSA Cases", "Unidentified Cases"],
    datasets: [
      {
        data: [62, 30, 8],
        backgroundColor: ["#dc3545", "#ffc107", "#e9ecef"],
        borderWidth: 0,
      },
    ],
  };

  const ecoliData = {
    labels: ["ESBL E. coli", "Non-ESBL E. coli"],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ["#dc3545", "#e9ecef"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="container-fluid">
      {/* ===== MRSA Section ===== */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-1">
                MRSA Bloodstream Infections
              </h6>
              <small className="text-muted">
                Proportion of bloodstream infections due to Methicillin-resistant S. aureus
              </small>
            </div>
            <button className="btn btn-sm btn-outline-secondary">Download ▾</button>
          </div>

          {/* Filters */}
          <div className="d-flex align-items-center gap-2 mb-4">
            <label className="text-muted small mb-0">Filter MRSA Data:</label>
            <select className="form-select form-select-sm w-auto">
              <option>All Hospital Units</option>
              <option>ICU</option>
              <option>Surgery Ward</option>
              <option>Emergency</option>
            </select>
          </div>

          {/* Chart & Legend */}
          <div className="row align-items-center mt-5">
            <div className="col-md-6 text-center">
              <div style={{ width: "180px", margin: "0 auto" }}>
                <Doughnut data={mrsaData} options={chartOptions} />
              </div>
            </div>
            <div className="col-md-6">
              <h6 className="fw-semibold mb-3">MRSA Distribution</h6>
              <ul className="list-unstyled small">
                <li className="d-flex justify-content-between align-items-center mb-2">
                  <span><span className="badge bg-danger me-2">&nbsp;</span> MRSA Cases</span>
                  <strong>62%</strong>
                </li>
                <li className="d-flex justify-content-between align-items-center mb-2">
                  <span><span className="badge bg-warning me-2">&nbsp;</span> MSSA Cases</span>
                  <strong>30%</strong>
                </li>
                <li className="d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-secondary me-2">&nbsp;</span> Unidentified</span>
                  <strong>8%</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ===== E. coli Section ===== */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-1">
                E. coli ESBL Resistance in Bloodstream Infections
              </h6>
              <small className="text-muted">
                Distribution of Extended-Spectrum Beta-Lactamase (ESBL) producing E. coli isolates
              </small>
            </div>
            <button className="btn btn-sm btn-outline-secondary">Download ▾</button>
          </div>

          {/* Filters */}
          <div className="d-flex align-items-center gap-2 mb-4">
            <label className="text-muted small mb-0">Filter E. coli Data:</label>
            <select className="form-select form-select-sm w-auto">
              <option>All Bloodstream Data</option>
              <option>Adult Patients</option>
              <option>Neonates</option>
            </select>
          </div>

          {/* Chart & Legend */}
          <div className="row align-items-center mt-5">
            <div className="col-md-6 text-center">
              <div style={{ width: "180px", margin: "0 auto" }}>
                <Doughnut data={ecoliData} options={chartOptions} />
              </div>
            </div>
            <div className="col-md-6">
              <h6 className="fw-semibold mb-3">E. coli Resistance Distribution</h6>
              <ul className="list-unstyled small">
                <li className="d-flex justify-content-between align-items-center mb-2">
                  <span><span className="badge bg-danger me-2">&nbsp;</span> ESBL Producers</span>
                  <strong>70%</strong>
                </li>
                <li className="d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-secondary me-2">&nbsp;</span> Non-ESBL</span>
                  <strong>30%</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalInfectionProfile;
