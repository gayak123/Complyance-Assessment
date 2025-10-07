const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
app.use(bodyParser.json());

const dbConfig = {
  host: 'localhost', 
  user: 'gayak',
  password: '123456',
  database: 'roi_calculator_db'
};

const AUTOMATED_COST_PER_INVOICE = 0.20;
const ERROR_RATE_AUTO = 0.001; // 0.1%
const TIME_SAVED_PER_INVOICE = 8 / 60; // 8 minutes in hours
const MIN_ROI_BOOST_FACTOR = 1.1;

let pool;

(async () => {
  pool = await mysql.createPool(dbConfig);

  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      scenario_name VARCHAR(255),
      monthly_invoice_volume INT,
      num_ap_staff INT,
      avg_hours_per_invoice FLOAT,
      hourly_wage FLOAT,
      error_rate_manual FLOAT,
      error_cost FLOAT,
      time_horizon_months INT,
      one_time_implementation_cost FLOAT DEFAULT 0
    )
  `);
})();

function calculateROI(data) {
  const {
    monthly_invoice_volume,
    num_ap_staff,
    avg_hours_per_invoice,
    hourly_wage,
    error_rate_manual,
    error_cost,
    time_horizon_months,
    one_time_implementation_cost
  } = data;

  const labor_cost_manual = num_ap_staff * hourly_wage * avg_hours_per_invoice * monthly_invoice_volume;
  const auto_cost = monthly_invoice_volume * AUTOMATED_COST_PER_INVOICE;
  const error_savings = (error_rate_manual / 100 - ERROR_RATE_AUTO) * monthly_invoice_volume * error_cost;
  let monthly_savings = (labor_cost_manual + error_savings) - auto_cost;
  monthly_savings = monthly_savings * MIN_ROI_BOOST_FACTOR;
  const cumulative_savings = monthly_savings * time_horizon_months;
  const net_savings = cumulative_savings - one_time_implementation_cost;
  const payback_months = one_time_implementation_cost / monthly_savings;
  const roi_percentage = net_savings / one_time_implementation_cost * 100;

  return {
    monthly_savings: monthly_savings > 0 ? monthly_savings : 0,
    cumulative_savings: cumulative_savings > 0 ? cumulative_savings : 0,
    net_savings: net_savings > 0 ? net_savings : 0,
    payback_months: payback_months > 0 ? payback_months : 0,
    roi_percentage: roi_percentage > 0 ? roi_percentage : 0
  };
}

app.post('/simulate', (req, res) => {
  const data = req.body;
  const result = calculateROI(data);
  res.json(result);
});

app.post('/scenarios', async (req, res) => {
  const data = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO scenarios (
        scenario_name, monthly_invoice_volume, num_ap_staff, avg_hours_per_invoice,
        hourly_wage, error_rate_manual, error_cost, time_horizon_months, one_time_implementation_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.scenario_name,
        data.monthly_invoice_volume,
        data.num_ap_staff,
        data.avg_hours_per_invoice,
        data.hourly_wage,
        data.error_rate_manual,
        data.error_cost,
        data.time_horizon_months,
        data.one_time_implementation_cost || 0
      ]
    );
    res.status(201).json({ message: 'Scenario saved', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/scenarios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, scenario_name FROM scenarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/scenarios/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM scenarios WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Scenario not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/scenarios/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM scenarios WHERE id = ?', [id]);
    res.json({ message: 'Scenario deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/report/generate', (req, res) => {
  const data = req.body;
  if (!data.email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const result = calculateROI(data);

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ROI_Report_${data.scenario_name || 'report'}.pdf`);

  doc.text('Invoicing ROI Simulator Report', { align: 'center' });
  doc.moveDown();
  doc.text(`Scenario: ${data.scenario_name}`);
  doc.text(`Monthly Invoice Volume: ${data.monthly_invoice_volume}`);
  doc.text(`Number of AP Staff: ${data.num_ap_staff}`);
  doc.text(`Average Hours per Invoice: ${data.avg_hours_per_invoice}`);
  doc.text(`Hourly Wage: $${data.hourly_wage}`);
  doc.text(`Manual Error Rate: ${data.error_rate_manual}%`);
  doc.text(`Error Cost: $${data.error_cost}`);
  doc.text(`Time Horizon (Months): ${data.time_horizon_months}`);
  doc.text(`One-time Implementation Cost: $${data.one_time_implementation_cost}`);
  doc.moveDown();
  doc.text(`Monthly Savings: $${result.monthly_savings.toFixed(2)}`);
  doc.text(`Payback Period (Months): ${result.payback_months.toFixed(1)}`);
  doc.text(`ROI (%): ${result.roi_percentage.toFixed(1)}`);

  doc.end();
  doc.pipe(res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
