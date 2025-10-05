import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AntimicrobialProfile = () => {
    // === Dummy Data ===
    const antibiotics = [
        "AMP", "AMC", "CAZ", "CRO", "CTX", "CIP", "GEN", "IPM", "MEM", "PIP",
        "TZP", "VAN", "ERY", "CLI", "DOX", "TET", "SXT", "FEP", "CHL", "AZM",
        "OXA", "PEN", "AMX", "LEV", "TOB", "AK", "CEF", "CFM", "CXM", "FOS",
        "NIT", "RIF", "ETP", "TGC", "COL"
    ];

    const resistant = antibiotics.map(() => Math.floor(Math.random() * 50) + 30); // 30-80%
    const intermediate = antibiotics.map(() => Math.floor(Math.random() * 20)); // 0-20%
    const susceptible = antibiotics.map(
        (_, i) => 100 - resistant[i] - intermediate[i]
    );

    const data = {
        labels: antibiotics,
        datasets: [
            {
                label: "Resistant (R)",
                data: resistant,
                backgroundColor: "#dc3545",
                stack: "Stack 0",
            },
            {
                label: "Intermediate (I)",
                data: intermediate,
                backgroundColor: "#ffc107",
                stack: "Stack 0",
            },
            {
                label: "Susceptible (S)",
                data: susceptible,
                backgroundColor: "#198754",
                stack: "Stack 0",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
                labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true },
            },
            tooltip: { enabled: true },
        },
        scales: {
            x: {
                stacked: true,
                ticks: { font: { size: 10 } },
                grid: { display: false },
            },
            y: {
                stacked: true,
                max: 100,
                ticks: {
                    callback: (val) => `${val}%`,
                },
                title: { display: true, text: "Percentage (%)" },
            },
        },
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-5">
                {/* ===== HEADER ===== */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 className="fw-bold text-dark mb-1">
                            Susceptibility Testing Profiles of Antimicrobials
                        </h6>
                        <small className="text-muted">
                            Susceptible/Intermediate/Resistant distribution for 35 antibiotics · Comprehensive antimicrobial sensitivity analysis
                        </small>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary">⬇ Download</button>
                </div>

                {/* ===== FILTERS ===== */}
                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                    <label className="text-muted small mb-0">Filter:</label>
                    <select className="form-select form-select-sm w-auto">
                        <option>Select type...</option>
                    </select>
                    <select className="form-select form-select-sm w-auto">
                        <option>Select type first</option>
                    </select>
                    <button className="btn btn-sm btn-outline-primary">Add</button>
                </div>

                {/* ===== CHART ===== */}
                <div className="p-3 bg-white rounded-4 border mb-4">
                    <Bar data={data} options={options} height={110} />
                </div>

                {/* ===== SUMMARY CARDS ===== */}
                <div className="row g-3 justify-content-center mt-5">
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

                {/* ===== FOOTNOTE ===== */}
                <div className="text-muted small text-center mt-5">
                    Antimicrobial resistance antibiotic profiles · S/I/R distribution analysis across 35 antibiotics · Showing all antibiotics with available resistance data
                </div>
            </div>

            {/* ===== CUSTOM STYLES ===== */}
            <style jsx>{`
        .card-body {
          background-color: #fff;
        }
        .btn-outline-secondary {
          font-size: 13px;
        }
      `}</style>
        </div>
    );
};

export default AntimicrobialProfile;
