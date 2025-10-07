
import React, { useState, useEffect } from 'react';

function App() {
  const [scenarioName, setScenarioName] = useState('');
  const [monthlyInvoiceVolume, setMonthlyInvoiceVolume] = useState(2000);
  const [numApStaff, setNumApStaff] = useState(3);
  const [avgHoursPerInvoice, setAvgHoursPerInvoice] = useState(0.17);
  const [hourlyWage, setHourlyWage] = useState(30);
  const [errorRateManual, setErrorRateManual] = useState(0.5);
  const [errorCost, setErrorCost] = useState(100);
  const [timeHorizonMonths, setTimeHorizonMonths] = useState(36);
  const [oneTimeImplementationCost, setOneTimeImplementationCost] = useState(50000);
  const [email, setEmail] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);

  const backendUrl = '';

  const fetchSimulation = async (data) => {
    try {
      const response = await fetch('/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation fetch error:', error);
    }
  };

  const handleInputChange = (setter) => (e) => {
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = parseFloat(e.target.value);
    }
    setter(value);
  };

  useEffect(() => {
    const data = {
      scenario_name: scenarioName || 'default',
      monthly_invoice_volume: monthlyInvoiceVolume,
      num_ap_staff: numApStaff,
      avg_hours_per_invoice: avgHoursPerInvoice,
      hourly_wage: hourlyWage,
      error_rate_manual: errorRateManual,
      error_cost: errorCost,
      time_horizon_months: timeHorizonMonths,
      one_time_implementation_cost: oneTimeImplementationCost || 0,
    };
    fetchSimulation(data);
  }, [scenarioName, monthlyInvoiceVolume, numApStaff, avgHoursPerInvoice, hourlyWage, errorRateManual, errorCost, timeHorizonMonths, oneTimeImplementationCost]);

  const loadScenarios = async () => {
    try {
      const response = await fetch('/scenarios');
      const data = await response.json();
      setScenarios(data);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const saveScenario = async () => {
    const scenarioData = {
      scenario_name: scenarioName,
      monthly_invoice_volume: monthlyInvoiceVolume,
      num_ap_staff: numApStaff,
      avg_hours_per_invoice: avgHoursPerInvoice,
      hourly_wage: hourlyWage,
      error_rate_manual: errorRateManual,
      error_cost: errorCost,
      time_horizon_months: timeHorizonMonths,
      one_time_implementation_cost: oneTimeImplementationCost || 0,
    };
    try {
      await fetch('/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarioData),
      });
      loadScenarios();
      alert('Scenario saved');
    } catch (error) {
      console.error('Failed to save scenario:', error);
    }
  };

  const loadScenario = async (id) => {
    try {
      const response = await fetch(`/scenarios/${id}`);
      const data = await response.json();
      setScenarioName(data.scenario_name);
      setMonthlyInvoiceVolume(data.monthly_invoice_volume);
      setNumApStaff(data.num_ap_staff);
      setAvgHoursPerInvoice(data.avg_hours_per_invoice);
      setHourlyWage(data.hourly_wage);
      setErrorRateManual(data.error_rate_manual);
      setErrorCost(data.error_cost);
      setTimeHorizonMonths(data.time_horizon_months);
      setOneTimeImplementationCost(data.one_time_implementation_cost || 0);
      setSelectedScenarioId(id);
    } catch (error) {
      console.error('Failed to load scenario:', error);
    }
  };

  const deleteScenario = async (id) => {
    try {
      await fetch(`/scenarios/${id}`, { method: 'DELETE' });
      loadScenarios();
      if (selectedScenarioId === id) {
        setSelectedScenarioId(null);
        setScenarioName('');
      }
    } catch (error) {
      console.error('Failed to delete scenario:', error);
    }
  };

  const generateReport = async () => {
    if (!email) {
      alert('Please enter email to generate report');
      return;
    }
    const reportData = {
      email,
      scenario_name: scenarioName || 'default',
      monthly_invoice_volume: monthlyInvoiceVolume,
      num_ap_staff: numApStaff,
      avg_hours_per_invoice: avgHoursPerInvoice,
      hourly_wage: hourlyWage,
      error_rate_manual: errorRateManual,
      error_cost: errorCost,
      time_horizon_months: timeHorizonMonths,
      one_time_implementation_cost: oneTimeImplementationCost || 0,
    };
    try {
      const response = await fetch('/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ROI_Report_${scenarioName || 'default'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Invoicing ROI Simulator</h2>
      <div>
        <label>Scenario Name</label>
        <input type="text" value={scenarioName} onChange={e => setScenarioName(e.target.value)} />
      </div>
      <div>
        <label>Monthly Invoice Volume</label>
        <input type="number" value={monthlyInvoiceVolume} min={0} onChange={handleInputChange(setMonthlyInvoiceVolume)} />
      </div>
      <div>
        <label>Number of AP Staff</label>
        <input type="number" value={numApStaff} min={0} onChange={handleInputChange(setNumApStaff)} />
      </div>
      <div>
        <label>Average Hours per Invoice</label>
        <input type="number" step="0.01" value={avgHoursPerInvoice} min={0} onChange={handleInputChange(setAvgHoursPerInvoice)} />
      </div>
      <div>
        <label>Hourly Wage ($)</label>
        <input type="number" step="0.01" value={hourlyWage} min={0} onChange={handleInputChange(setHourlyWage)} />
      </div>
      <div>
        <label>Manual Error Rate (%)</label>
        <input type="number" step="0.01" value={errorRateManual} min={0} onChange={handleInputChange(setErrorRateManual)} />
      </div>
      <div>
        <label>Error Cost ($)</label>
        <input type="number" step="0.01" value={errorCost} min={0} onChange={handleInputChange(setErrorCost)} />
      </div>
      <div>
        <label>Time Horizon (Months)</label>
        <input type="number" value={timeHorizonMonths} min={1} onChange={handleInputChange(setTimeHorizonMonths)} />
      </div>
      <div>
        <label>One-time Implementation Cost ($)</label>
        <input type="number" value={oneTimeImplementationCost} min={0} onChange={handleInputChange(setOneTimeImplementationCost)} />
      </div>

      <button onClick={saveScenario} style={{ marginTop: 10 }}>Save Scenario</button>

      <h3>Simulation Results</h3>
      {simulationResult ? (
        <div>
          <p>Monthly Savings: ${simulationResult.monthly_savings.toFixed(2)}</p>
          <p>Payback (months): {simulationResult.payback_months.toFixed(1)}</p>
          <p>ROI (%): {simulationResult.roi_percentage.toFixed(1)}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <h3>Saved Scenarios</h3>
      <ul>
        {scenarios.map(s => (
          <li key={s.id}>
            <button onClick={() => loadScenario(s.id)}>{s.scenario_name}</button>
            <button onClick={() => deleteScenario(s.id)} style={{ marginLeft: 5 }}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Generate Report</h3>
      <div>
        <input
          type="email"
          placeholder="Email for report"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button onClick={generateReport} style={{ marginLeft: 5 }}>Download Report</button>
      </div>
    </div>
  );
}

export default App;
