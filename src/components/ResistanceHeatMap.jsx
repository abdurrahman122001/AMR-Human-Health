import React from "react";

const ResistanceHeatMap = () => {
    const antibiotics = [
        {
            name: "Amoxicillin/Clavulanic acid",
            data: [13.7, 81.1, 41.7, "-", 32.4, "-", "-"],
        },
        {
            name: "Amikacin",
            data: [13.7, 8.3, 16.7, "-", "-", "-", "-"],
        },
        {
            name: "Ampicillin",
            data: [96.7, 100, 100, "-", "-", "-", "-"],
        },
        {
            name: "Azithromycin",
            data: ["-", "-", "-", "-", 32.9, "-", "-"],
        },
        {
            name: "Chloramphenicol",
            data: [56.2, 61.4, 49.6, "-", 56.2, "-", "-"],
        },
        {
            name: "Ciprofloxacin",
            data: [40, 59.4, 55.6, 22.2, 35, "-", "-"],
        },
        {
            name: "Clindamycin",
            data: ["-", "-", "-", "-", 61.4, "-", "-"],
        },
        {
            name: "Cloxacillin",
            data: ["-", "-", "-", "-", 73.1, "-", "-"],
        },
        {
            name: "Ceftriaxone",
            data: [66.3, 72.8, 84.1, "-", 73.8, "-", "-"],
        },
        {
            name: "Cefotaxime",
            data: [39.3, 72.8, 84.1, "-", "-", "-", "-"],
        },
        {
            name: "Cefixime",
            data: ["-", 88.8, 92.2, "-", 73.8, "-", "-"],
        },
    ];

    const pathogens = [
        "Acinetobacter spp.",
        "E. coli",
        "K. pneumoniae",
        "Salmonella spp.",
        "S. aureus",
        "Shigella spp.",
        "S. pneumoniae",
    ];

    const getColor = (val) => {
        if (val === "-" || val === undefined) return "#f8f9fa";
        const num = parseFloat(val);
        if (num >= 40 && num < 70) return "#ffc107"; // moderate (yellow)
        if (num >= 70) return "#dc3545"; // high (red)
        if (num < 40) return "#198754"; // low (green)
        return "#f8f9fa";
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-5">
                {/* ===== HEADER ===== */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 className="fw-bold text-dark mb-1">
                            Pathogen–Antibiotic Resistance Heatmap for WHONET Priority Pathogens
                        </h6>
                        <small className="text-muted">
                            Comprehensive resistance patterns across pathogen–antibiotic combinations · Visual overview of resistance surveillance
                        </small>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary">⬇ Download</button>
                </div>

                {/* ===== FILTERS ===== */}
                <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                    <label className="text-muted small mb-0">Filter Resistance Data:</label>
                    <select className="form-select form-select-sm w-auto">
                        <option>Select filter type...</option>
                        <option>Low Resistance Risk (&lt;40%)</option>
                        <option>Moderate Resistance Risk (40–69%)</option>
                        <option>High Resistance Risk (≥70%)</option>
                    </select>
                    <select className="form-select form-select-sm w-auto">
                        <option>Select type first</option>
                    </select>
                    <button className="btn btn-sm btn-outline-primary">Add Filter</button>
                </div>

                {/* ===== LEGEND ===== */}
                <div className="d-flex align-items-center gap-4 small mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className="d-inline-block rounded-2"
                            style={{ width: "16px", height: "16px", backgroundColor: "#198754" }}
                        ></span>
                        <span>Low Resistance Risk (&lt;40%)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className="d-inline-block rounded-2"
                            style={{ width: "16px", height: "16px", backgroundColor: "#ffc107" }}
                        ></span>
                        <span>Moderate Resistance Risk (40–69%)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className="d-inline-block rounded-2"
                            style={{ width: "16px", height: "16px", backgroundColor: "#dc3545" }}
                        ></span>
                        <span>High Resistance Risk (≥70%)</span>
                    </div>
                </div>

                {/* ===== HEATMAP TABLE ===== */}
                <div className="table-responsive">
                    <table className="table table-bordered align-middle text-center small">
                        <thead className="table-light">
                            <tr>
                                <th className="text-start fw-semibold">
                                    Antibiotic / Organism
                                </th>
                                {pathogens.map((p, i) => (
                                    <th key={i}>{p}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {antibiotics.map((antibiotic, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="text-start fw-semibold">
                                        {antibiotic.name}
                                    </td>
                                    {antibiotic.data.map((value, colIndex) => (
                                        <td
                                            key={colIndex}
                                            style={{
                                                backgroundColor: getColor(value),
                                                color:
                                                    value === "-" || value === undefined
                                                        ? "#000"
                                                        : "#fff",
                                            }}
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
            {/* ===== CUSTOM STYLES ===== */}
            <style jsx>{`
        .table th,
        .table td {
          border-color: #dee2e6;
          vertical-align: middle;
          font-size: 13px;
        }
        .table th {
          background-color: #f8f9fa;
          white-space: nowrap;
        }
        .card-body {
          background: #fff;
        }
      `}</style>
        </div>
    );
};

export default ResistanceHeatMap;
